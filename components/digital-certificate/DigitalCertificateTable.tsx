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
import {
  Search,
  Printer,
  ShieldCheck,
  Baby,
  HeartCrack,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  FilePlus,
} from "lucide-react";
import Link from "next/link";
import {
  getAllDigitalCertificateApplications,
  deleteDigitalCertificateApplication,
} from "@/action/digital-certificate";
import OfficeVerificationModal from "./OfficeVerificationModal";

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

  const [search, setSearch] = useState("");
  const [certificateType, setCertificateType] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");
  const [year, setYear] = useState<string>("");

  const [selectedAppForVerification, setSelectedAppForVerification] = useState<any | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1);
    }, 300);
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

  const getStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 flex items-center gap-1 font-semibold">
            <XCircle className="w-3 h-3" /> Rejected
          </Badge>
        );
      case "UNDER_REVIEW":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 flex items-center gap-1 font-semibold">
            <Clock className="w-3 h-3" /> Under Review
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 flex items-center gap-1 font-semibold">
            <Clock className="w-3 h-3" /> Submitted
          </Badge>
        );
    }
  };

  const getTypeBadge = (typeStr: string) => {
    if (typeStr === "BIRTH") {
      return (
        <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 flex items-center gap-1 font-semibold">
          <Baby className="w-3 h-3" /> Birth
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 flex items-center gap-1 font-semibold">
        <HeartCrack className="w-3 h-3" /> Death
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Ack No, Name, Mobile, Reg No..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          {/* Certificate Type Filter */}
          <Select value={certificateType} onValueChange={setCertificateType}>
            <SelectTrigger className="w-full sm:w-[150px] text-xs">
              <SelectValue placeholder="Certificate Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="BIRTH">Birth Certificate</SelectItem>
              <SelectItem value="DEATH">Death Certificate</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[150px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(page)}
            disabled={isLoading}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>

          {isAdmin && (
            <Button size="sm" asChild className="gap-1.5 bg-primary text-white text-xs">
              <Link href="/admindashboard/manage-digital-certificate/new">
                <FilePlus className="w-3.5 h-3.5" /> New Application
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs font-bold uppercase py-3">Ack No & Date</TableHead>
              <TableHead className="text-xs font-bold uppercase py-3">Type</TableHead>
              <TableHead className="text-xs font-bold uppercase py-3">Person Details</TableHead>
              <TableHead className="text-xs font-bold uppercase py-3">Applicant</TableHead>
              <TableHead className="text-xs font-bold uppercase py-3">Reg Details</TableHead>
              <TableHead className="text-xs font-bold uppercase py-3">Status</TableHead>
              <TableHead className="text-xs font-bold uppercase py-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading applications...
                  </div>
                </TableCell>
              </TableRow>
            ) : applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-sm">
                  No applications found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow key={app.id} className="hover:bg-muted/30 transition-colors">
                  {/* Ack & Date */}
                  <TableCell className="py-3">
                    <div className="space-y-0.5">
                      <p className="font-mono font-bold text-xs text-foreground">{app.acknowledgementNo}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {format(new Date(app.createdAt), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </TableCell>

                  {/* Type */}
                  <TableCell className="py-3">
                    {getTypeBadge(app.certificateType)}
                  </TableCell>

                  {/* Person Details */}
                  <TableCell className="py-3">
                    <div className="space-y-0.5">
                      <p className="font-bold text-xs text-foreground">{app.personName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Event Date: {format(new Date(app.dateOfEvent), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </TableCell>

                  {/* Applicant */}
                  <TableCell className="py-3">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-xs text-foreground">{app.applicantName}</p>
                      <p className="text-[11px] text-muted-foreground">Mob: {app.mobileNumber}</p>
                    </div>
                  </TableCell>

                  {/* Registration Details */}
                  <TableCell className="py-3">
                    <div className="space-y-0.5 text-[11px]">
                      <p><span className="text-muted-foreground">Year:</span> <span className="font-mono font-semibold">{app.registrationYear}</span></p>
                      <p><span className="text-muted-foreground">No:</span> <span className="font-mono font-semibold">{app.registrationNumber}</span></p>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3">
                    {getStatusBadge(app.status)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Office Verification Modal Trigger */}
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10 border-primary/30"
                          onClick={() => {
                            setSelectedAppForVerification(app);
                            setIsVerificationModalOpen(true);
                          }}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Verify / Order
                        </Button>
                      )}

                      {/* Print Application */}
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 px-2.5 text-xs gap-1 hover:bg-muted"
                      >
                        <Link
                          href={
                            isAdmin
                              ? `/admindashboard/manage-digital-certificate/print/${app.id}`
                              : `/dashboard/digital-certificate/print/${app.id}`
                          }
                          target="_blank"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print
                        </Link>
                      </Button>

                      {/* Delete (Admin only) */}
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(app.id, app.acknowledgementNo)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Showing Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span> ({total} total records)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => fetchData(page - 1)}
              className="text-xs h-8"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => fetchData(page + 1)}
              className="text-xs h-8"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      <OfficeVerificationModal
        application={selectedAppForVerification}
        isOpen={isVerificationModalOpen}
        onClose={() => {
          setIsVerificationModalOpen(false);
          setSelectedAppForVerification(null);
        }}
        onSuccess={() => fetchData(page)}
      />
    </div>
  );
}
