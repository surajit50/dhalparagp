"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  House,
  XCircle,
} from "lucide-react";
import { verifyOwnership } from "@/action/linkage-actions";
import { toast } from "@/components/ui/use-toast";
import { useLinkageTable } from "@/hooks/use-linkage-table";
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

type LinkageApplication = {
  id: string;
  applicationNo: string;
  applicantName: string;
  createdAt: Date;
};

type Props = {
  initialItems: LinkageApplication[];
};

export default function LinkageOwnershipListClient({ initialItems }: Props) {
  const {
    q,
    setQ,
    page,
    setPage,
    pageSize,
    items,
    total,
    loading,
    refresh,
    totalPages,
  } = useLinkageTable<LinkageApplication>({
    apiEndpoint: "/api/linkage/ownership-ready",
    initialItems,
  });

  const [actionApp, setActionApp] = useState<{
    id: string;
    confirm: boolean;
  } | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleAction = (id: string, confirm: boolean) => {
    setActionApp({ id, confirm });
    setIsAlertOpen(true);
  };

  const confirmAction = async () => {
    if (!actionApp) return;
    try {
      const res = await verifyOwnership({
        applicationId: actionApp.id,
        officerName: "GP Verification Officer",
        confirmed: actionApp.confirm,
      });
      if (res.success) {
        toast({
          title: actionApp.confirm
            ? "Ownership Verified"
            : "Verification Failed",
          description: res.message,
        });
        refresh();
      } else {
        toast({
          title: "Error",
          description: res.error,
          variant: "destructive",
        });
      }
    } finally {
      setIsAlertOpen(false);
      setActionApp(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 col-span-1 md:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-800/30 text-emerald-600 dark:text-emerald-400">
                <House className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  Ownership Verification
                </CardTitle>
                <CardDescription>
                  Second-stage verification confirming ownership and family
                  linkage accuracy.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">{total}</div>
              <div className="text-sm text-gray-500">pending verification</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-4 w-4" /> Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Find application..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="bg-white"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-100 dark:bg-gray-900">
                <TableRow>
                  <TableHead className="w-16 text-center">#</TableHead>
                  <TableHead>App No</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((app, index) => (
                  <TableRow
                    key={app.id}
                    className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors"
                  >
                    <TableCell className="text-center text-gray-500">
                      {(page - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-800">
                      {app.applicationNo}
                    </TableCell>
                    <TableCell className="font-medium">
                      {app.applicantName}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAction(app.id, true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <ShieldCheck className="h-4 w-4 mr-1" /> Final Verify
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAction(app.id, false)}
                          variant="destructive"
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-gray-500 italic"
                    >
                      {loading
                        ? "Loading..."
                        : "No applications pending ownership verification"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {items.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t bg-gray-50/50">
              <div className="text-sm text-gray-500">
                Page {page} of {totalPages} ({total} total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation Ready?</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm you want to{" "}
              {actionApp?.confirm ? "LEGITIMIZE" : "INVALIDATE"} the ownership
              status for this application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionApp?.confirm
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              Confirm {actionApp?.confirm ? "Verification" : "Rejection"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
