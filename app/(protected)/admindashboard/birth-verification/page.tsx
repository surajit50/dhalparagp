"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, Download, Edit2, Trash2, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import BirthVerificationForm from "./components/BirthVerificationForm";
import { getBirthVerificationReports, deleteBirthVerificationReport, updateBirthVerificationStatus } from "@/action/birth-verification-report";
import { generateBirthReportPDF } from "@/lib/generateBirthReportPDF";
import { formatDate } from "@/utils/utils";

export default function BirthVerificationPage() {
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

  const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
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

  const handlePrint = (report: any) => {
    try {
      generateBirthReportPDF(report);
      toast.success("Opening PDF for printing...");
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
            Birth Verification Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage, verify, and generate official verification reports for birth certificates.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v);
        if (v !== "edit") setEditingReport(null);
      }} className="space-y-6">
        <TabsList className="bg-slate-100 p-1 border border-slate-200">
          <TabsTrigger value="list">All Verification Reports</TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Report
          </TabsTrigger>
          {editingReport && (
            <TabsTrigger value="edit" disabled>
              Editing: {editingReport.memoNo}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Filters Bar */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="py-3 px-4 bg-slate-50 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                <Search className="h-4 w-4" /> Filter Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Holder Name</label>
                  <Input 
                    placeholder="Search by holder name" 
                    value={holderFilter}
                    onChange={(e) => setHolderFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Registration No.</label>
                  <Input 
                    placeholder="e.g. 159/June 06" 
                    value={regFilter}
                    onChange={(e) => setRegFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white" disabled={isPending}>
                    Search
                  </Button>
                  <Button type="button" variant="outline" onClick={handleResetFilters} className="flex-1 border-slate-200 hover:bg-slate-50">
                    <RotateCcw className="h-4 w-4 mr-2" /> Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Table list */}
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Ref/Memo Details</TableHead>
                  <TableHead className="font-semibold text-slate-700">Holder Details</TableHead>
                  <TableHead className="font-semibold text-slate-700">Birth Register Details</TableHead>
                  <TableHead className="font-semibold text-slate-700">Verification Result</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                      <div className="flex justify-center items-center gap-2">
                        <span className="animate-spin h-5 w-5 border-2 border-orange-500 rounded-full border-t-transparent" />
                        <span>Loading reports...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                      No birth verification reports found.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-slate-50/50">
                      <TableCell className="align-top py-4">
                        <div className="font-medium text-slate-800">{report.memoNo}</div>
                        <div className="text-xs text-slate-500 mt-1">Date: {formatDate(new Date(report.memoDate))}</div>
                        <div className="text-[10px] text-slate-400 mt-1 uppercase">Created: {formatDate(new Date(report.createdAt))}</div>
                      </TableCell>
                      
                      <TableCell className="align-top py-4">
                        <div className="font-semibold text-slate-800">{report.certificateHolder}</div>
                        <div className="text-xs text-slate-600 mt-1">F: {report.fatherName}</div>
                        <div className="text-xs text-slate-600">M: {report.motherName}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px] mt-1" title={report.address}>{report.address}</div>
                      </TableCell>
                      
                      <TableCell className="align-top py-4">
                        <div className="text-xs font-mono text-slate-700 font-medium">Reg No: {report.registrationNo}</div>
                        <div className="text-xs text-slate-600 mt-1">DOB: {formatDate(new Date(report.dateOfBirth))}</div>
                        <div className="text-xs text-slate-600">Reg Date: {formatDate(new Date(report.dateOfRegistration))}</div>
                      </TableCell>
                      
                      <TableCell className="align-top py-4">
                        <div className="flex flex-col gap-2">
                          <div>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                              report.isGenuine 
                                ? "bg-green-50 text-green-700 border border-green-200" 
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}>
                              {report.isGenuine ? "Genuine & Authentic" : "Not Genuine"}
                            </span>
                          </div>
                          <div>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                              report.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : report.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {report.status}
                            </span>
                          </div>
                          {report.remarks && (
                            <p className="text-[11px] text-slate-500 italic max-w-[150px] truncate" title={report.remarks}>
                              &ldquo;{report.remarks}&rdquo;
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="align-top text-right space-y-1.5 py-4">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Button size="sm" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => handlePrint(report)}>
                            <Download className="h-3.5 w-3.5 mr-1" /> PDF
                          </Button>
                          <Button size="sm" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => handleStartEdit(report)}>
                            <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleDelete(report.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        
                        {report.status === "PENDING" && (
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-[10px] h-6 px-2" onClick={() => handleUpdateStatus(report.id, "APPROVED")}>
                              <CheckCircle className="h-3 w-3 mr-1" /> Approve
                            </Button>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-[10px] h-6 px-2" onClick={() => handleUpdateStatus(report.id, "REJECTED")}>
                              <XCircle className="h-3 w-3 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <BirthVerificationForm onSuccess={handleFormSuccess} onCancel={() => setActiveTab("list")} />
        </TabsContent>

        <TabsContent value="edit">
          {editingReport && (
            <BirthVerificationForm initialData={editingReport} onSuccess={handleFormSuccess} onCancel={() => setActiveTab("list")} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
