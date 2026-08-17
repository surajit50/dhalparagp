"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Printer,
  ShieldCheck,
  Baby,
  HeartCrack,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  FilePlus,
  Pencil,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  UploadCloud,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  getAllDigitalCertificateApplications,
  deleteDigitalCertificateApplication,
  uploadIssuedCertificate,
} from "@/action/digital-certificate";
import OfficeVerificationModal from "./OfficeVerificationModal";
import EditApplicationModal from "./EditApplicationModal";

interface DigitalCertificateTableProps {
  initialData?: any[];
  initialTotal?: number;
  initialPage?: number;
  initialTotalPages?: number;
  isAdmin?: boolean;
}

export default function DigitalCertificateTable({
  initialData = [],
  initialTotal = 0,
  initialPage = 1,
  initialTotalPages = 1,
  isAdmin = true,
}: DigitalCertificateTableProps) {
  const [applications, setApplications] = useState<any[]>(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAppId, setUploadingAppId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [certificateType, setCertificateType] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");
  const [year, setYear] = useState<string>("");

  const [selectedAppForVerification, setSelectedAppForVerification] = useState<any | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const [selectedAppForEdit, setSelectedAppForEdit] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchData = useCallback(async (newPage = 1) => {
    setIsLoading(true);
    try {
      const res = await getAllDigitalCertificateApplications({
        page: newPage,
        limit: 10,
        search,
        certificateType: certificateType as any,
        status: status as any,
        year,
      });

      if (res.success && res.data) {
        setApplications(res.data.applications);
        setTotal(res.data.total);
        setPage(res.data.page);
        setTotalPages(res.data.totalPages);
      } else {
        toast.error(res.message || "Failed to load applications");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch applications");
    } finally {
      setIsLoading(false);
    }
  }, [search, certificateType, status, year]);

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleDelete = async (id: string, ack: string) => {
    if (!confirm(`Are you sure you want to delete application ${ack}?`)) return;
    try {
      const res = await deleteDigitalCertificateApplication(id);
      if (res.success) {
        toast.success("Application deleted successfully");
        fetchData(page);
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    }
  };

  const handleUploadCertificate = async (e: React.ChangeEvent<HTMLInputElement>, appId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      const sizeInKb = (file.size / 1024).toFixed(1);
      toast.error(`File size (${sizeInKb} KB) exceeds the 1 MB limit.`);
      e.target.value = "";
      return;
    }

    setUploadingAppId(appId);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("documentType", "issuedCertificate");

      const res = await fetch("/api/digital-certificate/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        const updateRes = await uploadIssuedCertificate(appId, data.url, data.public_id);
        if (updateRes.success) {
          toast.success("Certificate uploaded successfully!");
          fetchData(page);
        } else {
          throw new Error(updateRes.message || "Failed to save certificate URL");
        }
      } else {
        throw new Error(data.message || "Failed to upload file");
      }
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploadingAppId(null);
      e.target.value = "";
    }
  };

  // --- Badge renderers (enhanced) ---
  const getStatusBadge = (statusStr: string) => {
    const baseClass = "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm";
    switch (statusStr) {
      case "APPROVED":
        return (
          <Badge className={`${baseClass} bg-emerald-50 text-emerald-700 border-emerald-200`}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className={`${baseClass} bg-rose-50 text-rose-700 border-rose-200`}>
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </Badge>
        );
      case "UNDER_ENQUIRY":
        return (
          <Badge className={`${baseClass} bg-amber-50 text-amber-700 border-amber-200`}>
            <Clock className="w-3.5 h-3.5" /> Under Enquiry
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Badge className={`${baseClass} bg-sky-50 text-sky-700 border-sky-200`}>
            <AlertCircle className="w-3.5 h-3.5" /> Submitted
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            {statusStr || "Unknown"}
          </Badge>
        );
    }
  };

  const getTypeBadge = (typeStr: string) => {
    if (typeStr === "BIRTH") {
      return (
        <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
          <Baby className="w-3.5 h-3.5" /> Birth
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
        <HeartCrack className="w-3.5 h-3.5" /> Death
      </Badge>
    );
  };

  // --- Pagination helpers ---
  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchData(newPage);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === page ? "default" : "outline"}
          size="sm"
          className="h-8 w-8 p-0 text-xs"
          onClick={() => goToPage(i)}
          disabled={isLoading}
        >
          {i}
        </Button>
      );
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {isAdmin && (
        <Tabs 
          value={status === "UPLOAD_PENDING" ? "pending" : "all"} 
          onValueChange={(val) => {
            setStatus(val === "pending" ? "UPLOAD_PENDING" : "ALL");
            setPage(1);
          }}
        >
          <TabsList className="grid w-full sm:w-[400px] grid-cols-2 h-11 p-1">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All Applications</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm">Upload Pending</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* ===== FILTERS ===== */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-card p-5 rounded-2xl border shadow-sm">
        <div className="flex flex-1 flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Ack, Name, Mobile, Reg No..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-sm bg-muted/30 border-muted focus:bg-background transition"
            />
          </div>

          <Select value={certificateType} onValueChange={setCertificateType}>
            <SelectTrigger className="w-full sm:w-[160px] h-10 text-sm bg-muted/30 border-muted focus:bg-background">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="BIRTH">Birth</SelectItem>
              <SelectItem value="DEATH">Death</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[160px] h-10 text-sm bg-muted/30 border-muted focus:bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="UNDER_ENQUIRY">Under Enquiry</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="UPLOAD_PENDING">Upload Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(page)}
            disabled={isLoading}
            className="h-10 px-4 text-sm gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {isAdmin && (
            <Button size="sm" asChild className="h-10 px-4 text-sm gap-2 shadow-sm">
              <Link href="/admindashboard/manage-digital-certificate/new">
                <FilePlus className="w-4 h-4" /> New
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/60 border-b">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-3.5 px-4">
                  Ack & Date
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-3.5 px-4">
                  Type
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-3.5 px-4">
                  Person
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-3.5 px-4">
                  Applicant
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-3.5 px-4">
                  Registration
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-3.5 px-4">
                  Status
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-3.5 px-4 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx} className="animate-pulse">
                    <TableCell colSpan={7} className="px-4 py-5">
                      <div className="flex flex-col gap-2">
                        <div className="h-4 bg-muted/60 rounded w-3/4"></div>
                        <div className="h-3 bg-muted/40 rounded w-1/2"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <FileText className="w-12 h-12 text-muted-foreground/30" />
                      <p className="text-sm font-medium">No applications found</p>
                      <p className="text-xs">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => (
                  <TableRow
                    key={app.id}
                    className="group hover:bg-muted/30 transition-colors border-b border-muted/30 last:border-0"
                  >
                    <TableCell className="py-4 px-4 align-top">
                      <div className="space-y-0.5">
                        <p className="font-mono font-bold text-sm text-foreground">
                          {app.acknowledgementNo}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(app.createdAt), "dd MMM yyyy")}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-4 align-top">
                      {getTypeBadge(app.certificateType)}
                    </TableCell>

                    <TableCell className="py-4 px-4 align-top">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-sm text-foreground">
                          {app.personName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(app.dateOfEvent), "dd MMM yyyy")}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-4 align-top">
                      <div className="space-y-0.5">
                        <p className="font-medium text-sm text-foreground">
                          {app.applicantName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {app.mobileNumber}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-4 align-top">
                      <div className="space-y-0.5 text-xs">
                        <p>
                          <span className="text-muted-foreground">Year: </span>
                          <span className="font-mono font-semibold">
                            {app.registrationYear}
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">No: </span>
                          <span className="font-mono font-semibold">
                            {app.registrationNumber}
                          </span>
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-4 align-top">
                      {getStatusBadge(app.status)}
                    </TableCell>

                    <TableCell className="py-4 px-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Certificate Download */}
                        {app.issuedCertificateUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            title="Download Certificate"
                          >
                            <a href={app.issuedCertificateUrl} target="_blank" rel="noreferrer">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        )}

                        {/* Upload Certificate (Admin) */}
                        {isAdmin && app.status === "APPROVED" && (
                          <div className="relative inline-block">
                            <input
                              type="file"
                              id={`upload-cert-${app.id}`}
                              accept="application/pdf,.pdf"
                              className="hidden"
                              disabled={uploadingAppId === app.id}
                              onChange={(e) => handleUploadCertificate(e, app.id)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              onClick={() => document.getElementById(`upload-cert-${app.id}`)?.click()}
                              title={app.issuedCertificateUrl ? "Replace Certificate" : "Upload Certificate"}
                              disabled={uploadingAppId === app.id}
                            >
                              {uploadingAppId === app.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <UploadCloud className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        )}

                        {/* Edit (Admin) */}
                        {isAdmin && app.status !== "APPROVED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => {
                              setSelectedAppForEdit(app);
                              setIsEditModalOpen(true);
                            }}
                            title="Edit Application"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        )}

                        {/* Verify / Order (Admin) */}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => {
                              setSelectedAppForVerification(app);
                              setIsVerificationModalOpen(true);
                            }}
                            title="Verify / Order Certificate"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </Button>
                        )}

                        {/* Print */}
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title="Print Application"
                        >
                          <Link
                            href={
                              isAdmin
                                ? `/admindashboard/manage-digital-certificate/print/${app.id}`
                                : `/dashboard/digital-certificate/print/${app.id}`
                            }
                            target="_blank"
                          >
                            <Printer className="w-4 h-4" />
                          </Link>
                        </Button>


                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ===== PAGINATION ===== */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-muted-foreground">
            Showing page <span className="font-semibold text-foreground">{page}</span> of{" "}
            <span className="font-semibold text-foreground">{totalPages}</span> ·{" "}
            <span className="font-medium">{total}</span> total records
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={page <= 1 || isLoading}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {renderPageNumbers()}

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={page >= totalPages || isLoading}
              onClick={() => goToPage(page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ===== MODALS ===== */}
      <OfficeVerificationModal
        application={selectedAppForVerification}
        isOpen={isVerificationModalOpen}
        onClose={() => {
          setIsVerificationModalOpen(false);
          setSelectedAppForVerification(null);
        }}
        onSuccess={() => fetchData(page)}
      />

      <EditApplicationModal
        application={selectedAppForEdit}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAppForEdit(null);
        }}
        onSuccess={() => fetchData(page)}
      />
    </div>
  );
}
