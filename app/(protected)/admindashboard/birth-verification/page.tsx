"use client";

import { useState, useEffect, useTransition, useMemo, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, Search, FileText, Download, Edit2, Trash2, CheckCircle, XCircle,
  RotateCcw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Filter, Eye, FileCheck, AlertCircle, Archive, Clock, User, Hash,
  MoreHorizontal, LayoutGrid, List
} from "lucide-react";

import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import BirthVerificationForm from "./components/BirthVerificationForm";
import { getBirthVerificationReports, deleteBirthVerificationReport, updateBirthVerificationStatus } from "@/action/birth-verification-report";
import { generateBirthReportPDF } from "@/lib/generateBirthReportPDF";
import { formatDate } from "@/utils/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

// ----------------------------------------------------------------------
// Sub-components (extracted for readability)
// ----------------------------------------------------------------------

const StatsCards = ({ stats }: { stats: { total: number; pending: number; approved: number; rejected: number; genuine: number } }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
    {[
      { label: "Total", value: stats.total, icon: Archive, gradient: "from-blue-50 to-blue-100 border-blue-200", textColor: "text-blue-900", iconColor: "text-blue-400" },
      { label: "Pending", value: stats.pending, icon: Clock, gradient: "from-amber-50 to-amber-100 border-amber-200", textColor: "text-amber-900", iconColor: "text-amber-400" },
      { label: "Approved", value: stats.approved, icon: CheckCircle, gradient: "from-emerald-50 to-emerald-100 border-emerald-200", textColor: "text-emerald-900", iconColor: "text-emerald-400" },
      { label: "Rejected", value: stats.rejected, icon: XCircle, gradient: "from-red-50 to-red-100 border-red-200", textColor: "text-red-900", iconColor: "text-red-400" },
      { label: "Genuine", value: stats.genuine, icon: FileCheck, gradient: "from-purple-50 to-purple-100 border-purple-200", textColor: "text-purple-900", iconColor: "text-purple-400" },
    ].map(({ label, value, icon: Icon, gradient, textColor, iconColor }) => (
      <Card key={label} className={`bg-gradient-to-br ${gradient} shadow-md border`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
              <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
            </div>
            <Icon className={`h-8 w-8 opacity-50 ${iconColor}`} />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const FilterBar = ({
  holderFilter,
  setHolderFilter,
  regFilter,
  setRegFilter,
  statusFilter,
  setStatusFilter,
  onSearch,
  onReset,
  isPending,
}: {
  holderFilter: string;
  setHolderFilter: (v: string) => void;
  regFilter: string;
  setRegFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  onSearch: () => void;
  onReset: () => void;
  isPending: boolean;
}) => (
  <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
    <CardHeader className="py-4 px-6 bg-white border-b border-slate-100">
      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
        <Filter className="h-4 w-4 text-orange-500" />
        Filter & Search Reports
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <User className="h-3 w-3" />
              Holder Name
            </label>
            <Input
              placeholder="Search by name..."
              value={holderFilter}
              onChange={(e) => setHolderFilter(e.target.value)}
              className="rounded-xl border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Hash className="h-3 w-3" />
              Registration No.
            </label>
            <Input
              placeholder="e.g., 159/2024"
              value={regFilter}
              onChange={(e) => setRegFilter(e.target.value)}
              className="rounded-xl border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-xl border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all h-11 bg-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 items-end">
            <Button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 font-medium shadow-sm transition-colors"
              disabled={isPending}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              className="flex-1 border-slate-200 hover:bg-slate-50 rounded-xl h-11 font-medium transition-colors"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </form>
    </CardContent>
  </Card>
);

const TableSkeleton = ({ columnsCount }: { columnsCount: number }) => (
  <Table>
    <TableHeader className="bg-slate-50">
      <TableRow>
        {Array.from({ length: columnsCount }).map((_, i) => (
          <TableHead key={i} className="py-4 px-4">
            <Skeleton className="h-4 w-20" />
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: 5 }).map((_, rowIdx) => (
        <TableRow key={rowIdx} className="border-b border-slate-100">
          {Array.from({ length: columnsCount }).map((_, colIdx) => (
            <TableCell key={colIdx} className="py-4 px-4">
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

// Mobile card view for each report
const ReportCard = ({
  report,
  allowActions,
  onEdit,
  onDelete,
  onPrint,
  onStatusChange,
  isUpdating,
}: {
  report: any;
  allowActions: boolean;
  onEdit: (r: any) => void;
  onDelete: (id: string) => void;
  onPrint: (r: any) => void;
  onStatusChange: (id: string, status: "APPROVED" | "REJECTED") => void;
  isUpdating: boolean;
}) => {
  const resultBadge = () => {
    switch (report.verificationResult) {
      case "GENUINE":
        return { icon: CheckCircle, label: "Genuine", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "NOT_GENUINE":
        return { icon: XCircle, label: "Not Genuine", classes: "bg-red-50 text-red-700 border-red-200" };
      case "NOT_AVAILABLE":
        return { icon: AlertCircle, label: "Not Available", classes: "bg-amber-50 text-amber-700 border-amber-200" };
      default:
        return { icon: FileCheck, label: "Unknown", classes: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };
  const result = resultBadge();
  const ResultIcon = result.icon;
  return (
    <Card className="mb-4 border-slate-200 shadow-sm rounded-2xl overflow-hidden">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-bold text-slate-900">{report.certificateHolder}</div>
            <div className="text-xs text-slate-500 mt-1">
              Father: {report.fatherName}{" "}
              {report.motherName && <>| Mother: {report.motherName}</>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className={`${result.classes} gap-1 px-2 py-1 text-[11px] font-bold`}>
              <ResultIcon className="h-3 w-3" />
              {result.label}
            </Badge>
            <Badge
              variant="secondary"
              className={`
                ${report.status === "APPROVED" ? "bg-green-100 text-green-800" : ""}
                ${report.status === "REJECTED" ? "bg-red-100 text-red-800" : ""}
                ${report.status === "PENDING" ? "bg-amber-100 text-amber-800" : ""}
                text-[10px] font-bold px-2 py-1
              `}
            >
              {report.status}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div>
            <span className="font-bold text-slate-400">Reg No:</span> {report.registrationNo}
          </div>
          <div>
            <span className="font-bold text-slate-400">DOB:</span> {formatDate(new Date(report.dateOfBirth))}
          </div>
          <div>
            <span className="font-bold text-slate-400">GP Memo:</span> {report.gpMemoNo}
          </div>
          <div>
            <span className="font-bold text-slate-400">Memo Date:</span> {formatDate(new Date(report.gpMemoDate))}
          </div>
          {report.remarks && (
            <div className="col-span-2 italic text-slate-500 bg-slate-50 rounded p-2 mt-1">
              "{report.remarks}"
            </div>
          )}
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <div className="flex gap-2">
            {allowActions && report.status === "APPROVED" && (
              <Button
                size="sm"
                variant="outline"
                aria-label="Download PDF"
                className="h-8 px-3 rounded-lg"
                onClick={() => onPrint(report)}
              >
                <Download className="h-4 w-4 mr-1" /> PDF
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEdit(report)} disabled={report.status === "APPROVED"}>
                  <Edit2 className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(report.id)} disabled={report.status === "APPROVED"}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {report.status === "PENDING" && (
            <Select
              disabled={isUpdating}
              onValueChange={(v) => onStatusChange(report.id, v as "APPROVED" | "REJECTED")}
            >
              <SelectTrigger className="h-8 text-xs rounded-lg w-32">
                <SelectValue placeholder="Action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APPROVED">Approve</SelectItem>
                <SelectItem value="REJECTED">Reject</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ----------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------

export default function BirthVerificationPage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "superadmin";
  const isAdmin = session?.user?.role === "admin";
  const allowActions = isSuperAdmin || isAdmin;

  const [reports, setReports] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isUpdating, startUpdate] = useTransition();
  const [activeTab, setActiveTab] = useState("list");

  // Filters
  const [holderFilter, setHolderFilter] = useState("");
  const [regFilter, setRegFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingReport, setEditingReport] = useState<any>(null);

  // Debounced filter values
  const [debouncedHolder, setDebouncedHolder] = useState("");
  const [debouncedReg, setDebouncedReg] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounce effect for text inputs
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedHolder(holderFilter);
      setDebouncedReg(regFilter);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [holderFilter, regFilter]);

  // Fetch reports whenever debounced filters change
  const fetchReports = useCallback(() => {
    startTransition(async () => {
      try {
        const filters: any = {};
        if (statusFilter !== "all") filters.status = statusFilter;
        if (debouncedHolder.trim()) filters.certificateHolder = debouncedHolder;
        if (debouncedReg.trim()) filters.registrationNo = debouncedReg;

        const result = await getBirthVerificationReports(filters);
        if (result.success && result.data) {
          setReports(result.data);
        } else {
          toast.error("Failed to fetch reports");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Error loading reports");
      }
    });
  }, [statusFilter, debouncedHolder, debouncedReg]);

  // Trigger fetch on status or debounced changes
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleResetFilters = () => {
    setHolderFilter("");
    setRegFilter("");
    setStatusFilter("all");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this verification report?")) return;
    startTransition(async () => {
      try {
        const result = await deleteBirthVerificationReport(id);
        if (result.success) {
          toast.success(result.message);
          fetchReports();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Failed to delete report");
      }
    });
  };

  const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    startUpdate(async () => {
      try {
        const result = await updateBirthVerificationStatus(id, status);
        if (result.success) {
          toast.success(result.message);
          fetchReports();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Failed to update status");
      }
    });
  };

  const handleStartEdit = (report: any) => {
    setEditingReport(report);
    setActiveTab("edit");
  };

  const handleFormSuccess = () => {
    setEditingReport(null);
    setActiveTab("list");
    fetchReports();
  };

  const handlePrint = async (report: any) => {
    startTransition(async () => {
      try {
        await generateBirthReportPDF(report);
        toast.success("Opening PDF for printing...");
      } catch (error) {
        toast.error("Failed to generate PDF");
      }
    });
  };

  // Stats memoized
  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter(r => r.status === "PENDING").length,
    approved: reports.filter(r => r.status === "APPROVED").length,
    rejected: reports.filter(r => r.status === "REJECTED").length,
    genuine: reports.filter(r => r.verificationResult === "GENUINE").length,
  }), [reports]);

  // Table columns definition (with actions as dropdown)
  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      header: "#",
      id: "slNo",
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        return (
          <div className="font-mono text-sm font-semibold text-slate-400 w-8">
            {pageIndex * pageSize + row.index + 1}
          </div>
        );
      },
    },
    {
      header: "Reference Details",
      accessorKey: "memoDetails",
      cell: ({ row }) => {
        const report = row.original;
        return (
          <div className="space-y-2 min-w-[220px]">
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded-lg bg-orange-50">
                <FileText className="h-3 w-3 text-orange-500" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">GP Outgoing</div>
                <div className="font-bold text-slate-800 text-sm">{report.gpMemoNo}</div>
                <div className="text-[10px] text-slate-500">{formatDate(new Date(report.gpMemoDate))}</div>
              </div>
            </div>
            <div className="border-l-2 border-orange-200 pl-3 ml-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Incoming Ref</div>
              <div className="font-semibold text-slate-700 text-xs">{report.memoNo}</div>
              <div className="text-[10px] text-slate-500">{formatDate(new Date(report.memoDate))}</div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Certificate Holder",
      accessorKey: "certificateHolder",
      cell: ({ row }) => {
        const report = row.original;
        return (
          <div className="space-y-2 min-w-[200px]">
            <div className="font-bold text-slate-900 text-sm">{report.certificateHolder}</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 w-5">Father:</span>
                <span className="text-slate-600">{report.fatherName}</span>
              </div>
              {report.motherName && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 w-5">Mother:</span>
                  <span className="text-slate-600">{report.motherName}</span>
                </div>
              )}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-[11px] text-slate-500 bg-slate-50 rounded-lg p-2 truncate max-w-[200px] cursor-help">
                    {report.address}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{report.address}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
    {
      header: "Birth Register",
      accessorKey: "registrationNo",
      cell: ({ row }) => {
        const report = row.original;
        return (
          <div className="space-y-2 min-w-[180px]">
            <div className="bg-blue-50 rounded-lg p-2">
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Reg Number</div>
              <div className="font-mono font-bold text-slate-800 text-sm">{report.registrationNo}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-[10px] font-bold text-slate-400">DOB</div>
                <div className="font-semibold text-slate-700">{formatDate(new Date(report.dateOfBirth))}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400">Reg Date</div>
                <div className="font-semibold text-slate-700">{formatDate(new Date(report.dateOfRegistration))}</div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Verification",
      accessorKey: "verificationResult",
      cell: ({ row }) => {
        const report = row.original;
        const getResultBadge = () => {
          switch (report.verificationResult) {
            case "GENUINE":
              return { icon: CheckCircle, label: "Genuine", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" };
            case "NOT_GENUINE":
              return { icon: XCircle, label: "Not Genuine", classes: "bg-red-50 text-red-700 border-red-200" };
            case "NOT_AVAILABLE":
              return { icon: AlertCircle, label: "Not Available", classes: "bg-amber-50 text-amber-700 border-amber-200" };
            default:
              return { icon: FileCheck, label: "Unknown", classes: "bg-slate-50 text-slate-700 border-slate-200" };
          }
        };
        const result = getResultBadge();
        const ResultIcon = result.icon;
        return (
          <div className="space-y-2 min-w-[140px]">
            <Badge variant="outline" className={`${result.classes} gap-1.5 px-2 py-1 text-[11px] font-bold`}>
              <ResultIcon className="h-3 w-3" />
              {result.label}
            </Badge>
            <Badge variant="secondary" className={`
              ${report.status === "APPROVED" ? "bg-green-100 text-green-800" : ""}
              ${report.status === "REJECTED" ? "bg-red-100 text-red-800" : ""}
              ${report.status === "PENDING" ? "bg-amber-100 text-amber-800" : ""}
              text-[10px] font-bold px-2 py-1
            `}>
              {report.status}
            </Badge>
            {report.remarks && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-[10px] text-slate-500 italic bg-slate-50 rounded p-1.5 cursor-help line-clamp-2">
                      "{report.remarks}"
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{report.remarks}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => {
        const report = row.original;
        return (
          <div className="flex items-center gap-1 min-w-[100px]">
            {allowActions && report.status === "APPROVED" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      aria-label="Download PDF"
                      onClick={() => handlePrint(report)}
                      disabled={isPending}
                    >
                      <Download className="h-4 w-4 text-slate-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download PDF</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => handleStartEdit(report)} disabled={report.status === "APPROVED"}>
                  <Edit2 className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(report.id)} disabled={report.status === "APPROVED"}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {report.status === "PENDING" && (
              <Select
                disabled={isUpdating}
                onValueChange={(v) => handleUpdateStatus(report.id, v as "APPROVED" | "REJECTED")}
              >
                <SelectTrigger className="h-8 text-xs rounded-lg w-28 ml-1">
                  <SelectValue placeholder="Action..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">Approve</SelectItem>
                  <SelectItem value="REJECTED">Reject</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        );
      },
    },
  ], [allowActions, isPending, isUpdating, handlePrint, handleStartEdit, handleDelete, handleUpdateStatus]);

  // TanStack Table
  const table = useReactTable({
    data: reports,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50">
        <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8">
          <Toaster position="top-right" richColors />

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-500 text-white shadow-md">
                  <FileCheck className="h-5 w-5" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  Birth Verification Reports
                </h1>
              </div>
              <p className="text-sm text-slate-500 ml-12">
                Manage, verify, and track birth certificate verification requests
              </p>
            </div>
            <Button
              onClick={() => setActiveTab("create")}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 px-6 font-medium shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Verification Report
            </Button>
          </div>

          {/* Stats (only on list tab with data) */}
          {activeTab === "list" && reports.length > 0 && <StatsCards stats={stats} />}

          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v);
              if (v !== "edit") setEditingReport(null);
            }}
            className="space-y-6"
          >
            <TabsList className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1 inline-flex gap-1">
              <TabsTrigger
                value="list"
                className="rounded-xl px-5 py-2.5 text-sm font-medium data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                All Reports
              </TabsTrigger>
              <TabsTrigger
                value="create"
                className="rounded-xl px-5 py-2.5 text-sm font-medium data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New
              </TabsTrigger>
              {editingReport && (
                <TabsTrigger
                  value="edit"
                  className="rounded-xl px-5 py-2.5 text-sm font-medium data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Mode
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="list" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Filter Bar */}
              <FilterBar
                holderFilter={holderFilter}
                setHolderFilter={setHolderFilter}
                regFilter={regFilter}
                setRegFilter={setRegFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onSearch={fetchReports}
                onReset={handleResetFilters}
                isPending={isPending}
              />

              {/* Table for desktop, cards for mobile */}
              <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  {isPending ? (
                    <TableSkeleton columnsCount={columns.length} />
                  ) : (
                    <Table>
                      <TableHeader className="bg-slate-50 border-b border-slate-200">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id} className="hover:bg-transparent">
                            {headerGroup.headers.map((header) => (
                              <TableHead key={header.id} className="font-bold text-slate-700 py-4 px-4 text-xs uppercase tracking-wider">
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(header.column.columnDef.header, header.getContext())}
                              </TableHead>
                            ))}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {table.getRowModel().rows?.length ? (
                          table.getRowModel().rows.map((row) => (
                            <TableRow
                              key={row.id}
                              className="hover:bg-slate-50 transition-colors border-b border-slate-100"
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="py-4 px-4 align-top">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={columns.length} className="text-center py-20">
                              <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-slate-100 rounded-full">
                                  <Search className="h-12 w-12 text-slate-400" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-600 text-lg">No reports found</p>
                                  <p className="text-sm text-slate-400 mt-1">
                                    Try adjusting your filters or create a new report
                                  </p>
                                </div>
                                <Button onClick={() => setActiveTab("create")} variant="outline" className="mt-2">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Create New Report
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden p-4">
                  {isPending
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="mb-4 border-slate-200 shadow-sm rounded-2xl">
                          <CardContent className="p-5 space-y-3">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                          </CardContent>
                        </Card>
                      ))
                    : reports.length > 0
                    ? reports.map((report) => (
                        <ReportCard
                          key={report.id}
                          report={report}
                          allowActions={allowActions}
                          onEdit={handleStartEdit}
                          onDelete={handleDelete}
                          onPrint={handlePrint}
                          onStatusChange={handleUpdateStatus}
                          isUpdating={isUpdating}
                        />
                      ))
                    : (
                      <div className="flex flex-col items-center py-10 text-center">
                        <Search className="h-12 w-12 text-slate-400 mb-4" />
                        <p className="font-semibold text-slate-600">No reports found</p>
                        <Button onClick={() => setActiveTab("create")} variant="outline" className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Create New Report
                        </Button>
                      </div>
                    )}
                </div>

                {/* Pagination (both desktop & mobile) */}
                {reports.length > 0 && !isPending && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
                    <div className="text-sm text-slate-600">
                      Showing{" "}
                      <span className="font-bold text-slate-800">
                        {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{" "}
                        {Math.min(
                          (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                          reports.length
                        )}
                      </span>{" "}
                      of <span className="font-bold text-slate-800">{reports.length}</span> reports
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        aria-label="First page"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="px-3 py-1 text-sm font-medium text-slate-600">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                        aria-label="Last page"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="create" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-5xl mx-auto">
                <BirthVerificationForm onSuccess={handleFormSuccess} onCancel={() => setActiveTab("list")} />
              </div>
            </TabsContent>

            <TabsContent value="edit" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-5xl mx-auto">
                {editingReport && (
                  <BirthVerificationForm
                    initialData={editingReport}
                    onSuccess={handleFormSuccess}
                    onCancel={() => setActiveTab("list")}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}
