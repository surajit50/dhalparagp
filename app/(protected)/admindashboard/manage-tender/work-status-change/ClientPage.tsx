"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { InfoIcon, Search } from "lucide-react";
import { formatDate } from "@/utils/utils";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import WorkStatusForm from "@/components/WorkStatusForm";
import { updateWorkStatus } from "@/action/updateWorkStatus";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "approved", label: "Approved" },
  { value: "tenderPublish", label: "Tender Publish" },
  { value: "workorder", label: "Work Order" },
  { value: "yettostart", label: "Yet to Start" },
  { value: "workinprogress", label: "Work in Progress" },
  { value: "workcompleted", label: "Work Completed" },
  { value: "billgenerated", label: "Bill Generated" },
  { value: "billpaid", label: "Bill Paid" },
];

const PAGE_SIZE = 10;

export type WorkItem = {
  id: string;
  workStatus: string;
  workCommencementDate: Date | null;
  completionDate: Date | null;
  workslno: number;
  nitDetails: {
    memoNumber: number | string;
    memoDate: Date;
  };
  ApprovedActionPlanDetails: {
    activityDescription: string;
  };
};

interface ClientPageProps {
  workList: WorkItem[];
}

export default function ClientPage({ workList }: ClientPageProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredWorks = useMemo(() => {
    let filtered = workList;

    if (activeTab !== "all") {
      filtered = filtered.filter((w) => w.workStatus === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (w) =>
          String(w.nitDetails?.memoNumber ?? "").toLowerCase().includes(q) ||
          String(w.workslno ?? "").includes(q) ||
          (w.ApprovedActionPlanDetails?.activityDescription ?? "")
            .toLowerCase()
            .includes(q)
      );
    }

    return filtered;
  }, [workList, activeTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredWorks.length / PAGE_SIZE));

  const paginatedWorks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredWorks.slice(start, start + PAGE_SIZE);
  }, [filteredWorks, currentPage]);

  const handleStatusUpdate = async () => {
    router.refresh();
  };

  const canUpdateStatus = (status: string) =>
    status !== "workcompleted" && status !== "billpaid";

  return (
    <>
      {/* WB GOV HEADER */}
      <div className="w-full bg-orange-900 text-white py-3 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold tracking-wide">
              WB e-Tender & Work Monitoring System
            </h2>
            <p className="text-xs opacity-80">
              Government of West Bengal
            </p>
          </div>
          <div className="text-sm font-medium">
            Work Status Dashboard
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4 bg-slate-50 min-h-screen">
        {/* TITLE SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Work Status Management
            </h1>
            <p className="text-sm text-gray-500">
              Update and track work progress via NIT number
            </p>
          </div>
          <Badge variant="secondary" className="px-4 py-2 text-base">
            Total Works: {workList.length}
          </Badge>
        </div>

        {/* SEARCH PANEL */}
        <Card className="p-4 shadow-sm border bg-white mb-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by NIT, work no, or work name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 border-orange-300 focus-visible:ring-orange-500"
            />
          </div>
        </Card>

        {/* TABS */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v);
            setCurrentPage(1);
          }}
        >
          <TabsList className="flex flex-wrap gap-2 p-2 bg-orange-50 rounded-lg border mb-4">
            {STATUS_TABS.map((tab) => {
              const count =
                tab.value === "all"
                  ? workList.length
                  : workList.filter((w) => w.workStatus === tab.value).length;

              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  {tab.label}
                  <Badge
                    variant={activeTab === tab.value ? "default" : "secondary"}
                    className="ml-1.5 text-xs"
                  >
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activeTab}>
            <Card className="rounded-xl shadow-sm bg-white">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-orange-800 text-white">
                    <TableRow>
                      <TableHead className="text-white">SL</TableHead>
                      <TableHead className="text-white">NIT No</TableHead>
                      <TableHead className="text-white">Work Name</TableHead>
                      <TableHead className="text-white">
                        Commencement
                      </TableHead>
                      <TableHead className="text-white">
                        Completion
                      </TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-right text-white">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedWorks.map((work, index) => (
                      <TableRow key={work.id}>
                        <TableCell>
                          {(currentPage - 1) * PAGE_SIZE + index + 1}
                        </TableCell>

                        <TableCell>
                          <ShowNitDetails
                            nitdetails={work.nitDetails.memoNumber}
                            memoDate={work.nitDetails.memoDate}
                            workslno={work.workslno}
                          />
                        </TableCell>

                        <TableCell>
                          {work.ApprovedActionPlanDetails.activityDescription}
                        </TableCell>

                        <TableCell>
                          {work.workCommencementDate
                            ? formatDate(work.workCommencementDate)
                            : "-"}
                        </TableCell>

                        <TableCell>
                          {work.completionDate
                            ? formatDate(work.completionDate)
                            : "-"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={`px-3 py-1.5 ${getStatusColor(
                              work.workStatus
                            )}`}
                          >
                            {formatStatusLabel(work.workStatus)}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          {canUpdateStatus(work.workStatus) ? (
                            <WorkStatusForm
                              work={work}
                              updateWorkStatus={updateWorkStatus}
                              onSuccess={handleStatusUpdate}
                            />
                          ) : (
                            <Badge variant="secondary">Completed</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 bg-white border rounded-lg shadow-sm mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>

                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1)
                            setCurrentPage((p) => p - 1);
                        }}
                      />
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages)
                            setCurrentPage((p) => p + 1);
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

/* STATUS COLORS */
function getStatusColor(status: string) {
  switch (status) {
    case "approved":
      return "bg-slate-200 text-slate-900 border";
    case "tenderPublish":
      return "bg-orange-200 text-orange-900 border";
    case "workorder":
      return "bg-orange-200 text-orange-900 border";
    case "yettostart":
      return "bg-yellow-200 text-yellow-900 border";
    case "workinprogress":
      return "bg-orange-200 text-orange-900 border";
    case "workcompleted":
      return "bg-green-200 text-green-900 border font-semibold";
    case "billgenerated":
      return "bg-orange-200 text-orange-900 border";
    case "billpaid":
      return "bg-purple-200 text-purple-900 border font-semibold";
    default:
      return "bg-gray-200 text-gray-800 border";
  }
}

function formatStatusLabel(status: string) {
  return status
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
