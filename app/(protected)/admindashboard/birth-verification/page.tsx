"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Plus, Search, FileText, Download, Edit2, Trash2, CheckCircle, XCircle, 
  RotateCcw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, 
  Filter, Eye, FileCheck, AlertCircle, Archive, LayoutGrid, List ,Clock, User, Hash
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

export default function BirthVerificationPage() {
  const { data: session } = useSession();
  //superadmin and admin allow this
  const isSuperAdmin = session?.user?.role === "superadmin";
  const isAdmin = session?.user?.role === "admin";
  const allowActions = isSuperAdmin || isAdmin;
  
  const [reports, setReports] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("list");
  
  // Filters
  const [holderFilter, setHolderFilter] = useState("");
  const [regFilter, setRegFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Edit mode
  const [editingReport, setEditingReport] = useState<any>(null);

  const fetchReports = () => {
    startTransition(async () => {
      try {
        const filters: any = {};
        if (statusFilter !== "all") filters.status = statusFilter;
        if (holderFilter.trim()) filters.certificateHolder = holderFilter;
        if (regFilter.trim()) filters.registrationNo = regFilter;

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
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  const handleResetFilters = () => {
    setHolderFilter("");
    setRegFilter("");
    setStatusFilter("all");
    setTimeout(() => fetchReports(), 50);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this verification report?")) return;
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
  };

  const handleUpdateStatus = async (id: string, status: "PENDING" | "APPROVED" | "REJECTED") => {
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
    try {
      await generateBirthReportPDF(report);
      toast.success("Opening PDF for printing...");
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  // Statistics calculations
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === "PENDING").length,
    approved: reports.filter(r => r.status === "APPROVED").length,
    rejected: reports.filter(r => r.status === "REJECTED").length,
    genuine: reports.filter(r => r.verificationResult === "GENUINE").length,
  };

  const columns: ColumnDef<any>[] = [
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
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50">
                <FileText className="h-3 w-3 text-orange-500" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">GP Outgoing</div>
                <div className="font-bold text-slate-800 text-sm">{report.gpMemoNo}</div>
                <div className="text-[10px] text-slate-400">{formatDate(new Date(report.gpMemoDate))}</div>
              </div>
            </div>
            <div className="border-l-2 border-orange-200 pl-3 ml-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Incoming Ref</div>
              <div className="font-semibold text-slate-700 text-xs">{report.memoNo}</div>
              <div className="text-[10px] text-slate-400">{formatDate(new Date(report.memoDate))}</div>
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
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2">
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
              return { icon: CheckCircle, label: "Genuine", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
            case "NOT_GENUINE":
              return { icon: XCircle, label: "Not Genuine", className: "bg-red-50 text-red-700 border-red-200" };
            case "NOT_AVAILABLE":
              return { icon: AlertCircle, label: "Not Available", className: "bg-amber-50 text-amber-700 border-amber-200" };
            default:
              return { icon: FileCheck, label: "Unknown", className: "bg-slate-50 text-slate-700 border-slate-200" };
          }
        };
        const result = getResultBadge();
        const ResultIcon = result.icon;
        
        return (
          <div className="space-y-2 min-w-[140px]">
            <Badge variant="outline" className={`${result.className} gap-1.5 px-2 py-1 text-[11px] font-bold`}>
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
          <div className="space-y-2 min-w-[160px]">
            <div className="flex items-center gap-1">
              {/* show if approved */}
              {allowActions && report.status === "APPROVED" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100" onClick={() => handlePrint(report)}>
                        <Download className="h-4 w-4 text-slate-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download PDF</TooltipContent>
                  </Tooltip>
                </TooltipProvider>  
              )}
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-50" onClick={() => handleStartEdit(report)} disabled={report.status === "APPROVED"}>
                      <Edit2 className="h-4 w-4 text-blue-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit Report</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50" onClick={() => handleDelete(report.id)} disabled={report.status === "APPROVED"}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete Report</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {report.status === "PENDING" && (
              <div className="flex items-center gap-1">
                <Button 
                  size="sm" 
                  className="h-7 px-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold" 
                  onClick={() => handleUpdateStatus(report.id, "APPROVED")}
                >
                  <CheckCircle className="h-3 w-3 mr-1" /> Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="h-7 px-2 text-[10px] font-bold" 
                  onClick={() => handleUpdateStatus(report.id, "REJECTED")}
                >
                  <XCircle className="h-3 w-3 mr-1" /> Reject
                </Button>
              </div>
            )}

            {allowActions && report.status === "APPROVED" && (
              <div className="flex items-center gap-1 mt-1">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-7 px-2 border-orange-200 text-orange-600 text-[10px] font-bold hover:bg-orange-50 w-full" 
                  onClick={() => handleUpdateStatus(report.id, "PENDING")}
                >
                  <RotateCcw className="h-3 w-3 mr-1" /> Enable Edit
                </Button>
              </div>
            )}
          </div>
        );
      },
    },
  ];

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/20">
        <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8">
          <Toaster position="top-right" richColors />

          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-200">
                  <FileCheck className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Birth Verification Reports
                </h1>
              </div>
              <p className="text-sm text-slate-500 ml-12">
                Manage, verify, and track birth certificate verification requests
              </p>
            </div>
            
            <Button 
              onClick={() => setActiveTab("create")}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-200 rounded-xl h-11 px-6 font-semibold transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Verification Report
            </Button>
          </div>

          {/* Stats Cards */}
          {activeTab === "list" && reports.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase">Total</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                    </div>
                    <Archive className="h-8 w-8 text-blue-400 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-amber-600 uppercase">Pending</p>
                      <p className="text-2xl font-bold text-amber-900">{stats.pending}</p>
                    </div>
                    <Clock className="h-8 w-8 text-amber-400 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-600 uppercase">Approved</p>
                      <p className="text-2xl font-bold text-emerald-900">{stats.approved}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-emerald-400 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-red-600 uppercase">Rejected</p>
                      <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-400 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-purple-600 uppercase">Genuine</p>
                      <p className="text-2xl font-bold text-purple-900">{stats.genuine}</p>
                    </div>
                    <FileCheck className="h-8 w-8 text-purple-400 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={(v) => {
            setActiveTab(v);
            if (v !== "edit") setEditingReport(null);
          }} className="space-y-6">
            <TabsList className="bg-white/80 backdrop-blur-sm p-1 rounded-2xl border border-slate-200 shadow-sm inline-flex gap-1">
              <TabsTrigger 
                value="list" 
                className="rounded-xl px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                All Reports
              </TabsTrigger>
              <TabsTrigger 
                value="create" 
                className="rounded-xl px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New
              </TabsTrigger>
              {editingReport && (
                <TabsTrigger 
                  value="edit" 
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Mode
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="list" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Filters Bar */}
              <Card className="border-slate-200 shadow-xl shadow-slate-100 rounded-2xl overflow-hidden">
                <CardHeader className="py-4 px-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700">
                    <Filter className="h-4 w-4 text-orange-500" />
                    Filter & Search Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSearchSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                          <User className="h-3 w-3" />
                          Holder Name
                        </label>
                        <Input 
                          placeholder="Search by name..." 
                          value={holderFilter}
                          onChange={(e) => setHolderFilter(e.target.value)}
                          className="rounded-xl border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all h-11 bg-white/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                          <Hash className="h-3 w-3" />
                          Registration No.
                        </label>
                        <Input 
                          placeholder="e.g., 159/2024" 
                          value={regFilter}
                          onChange={(e) => setRegFilter(e.target.value)}
                          className="rounded-xl border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all h-11 bg-white/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="rounded-xl border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all h-11 bg-white/50">
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
                        <Button type="submit" className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl h-11 font-semibold shadow-lg shadow-orange-200 transition-all" disabled={isPending}>
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </Button>
                        <Button type="button" variant="outline" onClick={handleResetFilters} className="flex-1 border-slate-200 hover:bg-slate-50 rounded-xl h-11 font-medium transition-all">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Reports Table */}
              <Card className="border-slate-200 shadow-xl shadow-slate-100 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="hover:bg-transparent">
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} className="font-bold text-slate-700 py-4 px-4 text-xs uppercase tracking-wider">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {isPending ? (
                        <TableRow>
                          <TableCell colSpan={columns.length} className="text-center py-16">
                            <div className="flex flex-col items-center gap-3">
                              <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
                              <p className="text-slate-500 font-medium">Loading reports...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            className="hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-transparent transition-all duration-200 border-b border-slate-100 group"
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
                              <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full">
                                <Search className="h-12 w-12 text-slate-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-600 text-lg">No reports found</p>
                                <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or create a new report</p>
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
                </div>
                
                {/* Pagination */}
                {reports.length > 0 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                    <div className="text-sm text-slate-600">
                      Showing <span className="font-bold text-slate-800">
                        {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} - {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, reports.length)}
                      </span> of <span className="font-bold text-slate-800">{reports.length}</span> reports
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0 rounded-lg border-slate-200 hover:border-orange-300 hover:bg-orange-50"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0 rounded-lg border-slate-200 hover:border-orange-300 hover:bg-orange-50"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="px-3 py-1 text-sm font-medium text-slate-600">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0 rounded-lg border-slate-200 hover:border-orange-300 hover:bg-orange-50"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0 rounded-lg border-slate-200 hover:border-orange-300 hover:bg-orange-50"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
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
                  <BirthVerificationForm initialData={editingReport} onSuccess={handleFormSuccess} onCancel={() => setActiveTab("list")} />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}

