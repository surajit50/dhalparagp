"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { TenderStatus } from "@prisma/client";
import { ShowNitDetails } from "@/components/ShowNitDetails";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusVariants: Record<
  TenderStatus,
  "destructive" | "success" | "warning" | "default"
> = {
  Cancelled: "destructive",
  published: "success",
  ToBeOpened: "warning",
  publish: "success",
  TechnicalBidOpening: "warning",
  TechnicalEvaluation: "warning",
  FinancialBidOpening: "warning",
  FinancialEvaluation: "warning",
  Retender: "warning",
  AOC: "default",
};

interface Tender {
  id: string;
  workslno: number | string;
  tenderStatus: TenderStatus;
  nitDetails: {
    memoNumber: number | string;
    memoDate: Date;
  };
  ApprovedActionPlanDetails: {
    activityDescription: string;
  };
}

interface Props {
  tenders: Tender[];
  updateTenderStatus: (formData: FormData) => Promise<void>;
}

const ITEMS_PER_PAGE = 10;

export function ActiveTendersTable({ tenders, updateTenderStatus }: Props) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [pendingUpdate, setPendingUpdate] = useState<{
    id: string;
    status: TenderStatus;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTenders = useMemo(() => {
    let filtered = tenders;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.nitDetails.memoNumber.toString().includes(search) ||
          t.workslno.toString().includes(search) ||
          t.ApprovedActionPlanDetails.activityDescription
            .toLowerCase()
            .includes(search)
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((t) => t.tenderStatus === selectedStatus);
    }

    return filtered;
  }, [tenders, searchTerm, selectedStatus]);

  const totalPages = Math.ceil(filteredTenders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filteredTenders.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const handleStatusChange = (
    id: string,
    status: TenderStatus,
    current: TenderStatus
  ) => {
    if (status === current) return;
    setPendingUpdate({ id, status });
  };

  const confirmUpdate = async () => {
    if (!pendingUpdate) return;

    setIsSubmitting(true);

    const fd = new FormData();
    fd.append("id", pendingUpdate.id);
    fd.append("status", pendingUpdate.status);

    await updateTenderStatus(fd);

    setPendingUpdate(null);
    setIsSubmitting(false);
    router.refresh();
  };

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between bg-slate-50 border p-3 rounded-md">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search NIT / Work Name / Sl No"
            className="pl-8 h-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 items-center">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[170px] h-9 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {Object.keys(statusVariants).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-100 sticky top-0">
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>NIT</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Update</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="text-sm mt-2 text-muted-foreground">
                    No tenders found
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((t, i) => (
                <TableRow key={t.id} className="hover:bg-slate-50">
                  <TableCell className="text-center text-xs">
                    {startIndex + i + 1}
                  </TableCell>

                  <TableCell>
                    <ShowNitDetails
                      nitdetails={t.nitDetails.memoNumber}
                      memoDate={t.nitDetails.memoDate}
                      workslno={t.workslno}
                    />
                  </TableCell>

                  <TableCell className="max-w-[350px] truncate">
                    {t.ApprovedActionPlanDetails.activityDescription}
                  </TableCell>

                  <TableCell>
                    <Badge variant={statusVariants[t.tenderStatus]}>
                      {t.tenderStatus}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Select
                      value={t.tenderStatus}
                      onValueChange={(v) =>
                        handleStatusChange(
                          t.id,
                          v as TenderStatus,
                          t.tenderStatus
                        )
                      }
                    >
                      <SelectTrigger className="w-[200px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(statusVariants).map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center border bg-slate-50 p-2 rounded-md">
          <span className="text-xs text-muted-foreground">
            Page {currentPage} / {totalPages}
          </span>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft size={14} />
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <AlertDialog open={!!pendingUpdate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              New Status: {pendingUpdate?.status}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction onClick={confirmUpdate}>
              {isSubmitting ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
