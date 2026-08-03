"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  getMyDigitalCertificateApplications,
  getDigitalCertificateApplication,
} from "@/action/digital-certificate";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Printer,
  FileBadge2,
  Baby,
  HeartCrack,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  RefreshCw,
  Eye,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DigitalCertificatePrintTemplate from "@/components/digital-certificate/DigitalCertificatePrintTemplate";

export default function DigitalCertificateStatusPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchAck, setSearchAck] = useState("");
  const [searchedApp, setSearchedApp] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [previewApp, setPreviewApp] = useState<any | null>(null);

  const fetchMyApps = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getMyDigitalCertificateApplications();
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyApps();
  }, [fetchMyApps]);

  const handleTrackAck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchAck.trim()) {
      toast.error("Please enter an Acknowledgement Number");
      return;
    }

    setIsSearching(true);
    try {
      const res = await getDigitalCertificateApplication(searchAck.trim());
      if (res.success && res.data) {
        setSearchedApp(res.data);
        toast.success("Application details found");
      } else {
        setSearchedApp(null);
        toast.error(res.message || "No application found with this Acknowledgement Number");
      }
    } catch (err: any) {
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1 font-semibold text-xs py-1 px-2.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 flex items-center gap-1 font-semibold text-xs py-1 px-2.5">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </Badge>
        );
      case "UNDER_REVIEW":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 flex items-center gap-1 font-semibold text-xs py-1 px-2.5">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 flex items-center gap-1 font-semibold text-xs py-1 px-2.5">
            <Clock className="w-3.5 h-3.5" /> Submitted
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileBadge2 className="w-7 h-7 text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Certificate Applications & Status
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Track status and print official application forms for Digital Birth & Death Certificates.
            </p>
          </div>

          <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Link href="/dashboard/digital-certificate/apply">
              <PlusCircle className="w-4 h-4" /> Apply for Certificate
            </Link>
          </Button>
        </div>

        {/* Quick Search Card */}
        <Card className="shadow-md border-blue-100 bg-white">
          <CardHeader className="bg-blue-50/40 border-b pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" /> Track Application by Acknowledgement Number
            </CardTitle>
            <CardDescription className="text-xs">
              Enter your acknowledgement number (e.g., DBC/2026/0001 or DDC/2026/0001) to look up status.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleTrackAck} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Input
                  placeholder="Enter Acknowledgement No (e.g. DBC/2026/0001)..."
                  value={searchAck}
                  onChange={(e) => setSearchAck(e.target.value)}
                  className="font-mono text-sm uppercase"
                />
              </div>
              <Button
                type="submit"
                disabled={isSearching}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSearching ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Track Application
              </Button>
            </form>

            {/* Search Result Card */}
            {searchedApp && (
              <div className="mt-6 p-4 rounded-xl border-2 border-blue-200 bg-blue-50/30 space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
                  <div>
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                      Tracking Result
                    </span>
                    <h3 className="text-lg font-mono font-bold text-foreground">
                      {searchedApp.acknowledgementNo}
                    </h3>
                  </div>
                  <div>{getStatusBadge(searchedApp.status)}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-bold">{searchedApp.certificateType} Certificate</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Person Name</p>
                    <p className="font-bold">{searchedApp.personName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Applicant Name</p>
                    <p className="font-bold">{searchedApp.applicantName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Registration No / Year</p>
                    <p className="font-mono font-semibold">{searchedApp.registrationNumber} / {searchedApp.registrationYear}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date of Event</p>
                    <p className="font-semibold">{format(new Date(searchedApp.dateOfEvent), "dd/MM/yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submitted On</p>
                    <p className="font-semibold">{format(new Date(searchedApp.createdAt), "dd/MM/yyyy")}</p>
                  </div>
                </div>

                {searchedApp.rejectionReason && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                    <span className="font-bold">Rejection Reason:</span> {searchedApp.rejectionReason}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewApp(searchedApp)}
                    className="text-xs gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview Form
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Link
                      href={`/dashboard/digital-certificate/print/${searchedApp.id}`}
                      target="_blank"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Application Form
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Applications List */}
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/20 border-b pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">My Submitted Applications</CardTitle>
              <CardDescription className="text-xs">
                History of Digital Birth and Death certificate applications submitted by your account.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMyApps}
              disabled={isLoading}
              className="text-xs gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading your applications...
              </div>
            ) : applications.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <FileBadge2 className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
                <p className="text-sm font-semibold text-foreground">No applications found</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  You haven't submitted any Digital Birth or Death certificate applications yet.
                </p>
                <Button asChild size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white mt-2">
                  <Link href="/dashboard/digital-certificate/apply">
                    <PlusCircle className="w-3.5 h-3.5" /> Apply Now
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border bg-card hover:bg-muted/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-sm text-foreground">
                          {app.acknowledgementNo}
                        </span>
                        {app.certificateType === "BIRTH" ? (
                          <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 text-[11px]">
                            <Baby className="w-3 h-3 mr-1" /> Birth
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 text-[11px]">
                            <HeartCrack className="w-3 h-3 mr-1" /> Death
                          </Badge>
                        )}
                        {getStatusBadge(app.status)}
                      </div>

                      <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
                        <p><span className="font-semibold text-foreground">{app.personName}</span></p>
                        <p>Date: {format(new Date(app.dateOfEvent), "dd/MM/yyyy")}</p>
                        <p>Reg: <span className="font-mono">{app.registrationNumber} / {app.registrationYear}</span></p>
                        <p>Applied: {format(new Date(app.createdAt), "dd/MM/yyyy")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewApp(app)}
                        className="text-xs gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </Button>
                      <Button
                        size="sm"
                        asChild
                        className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Link
                          href={`/dashboard/digital-certificate/print/${app.id}`}
                          target="_blank"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print Application
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewApp} onOpenChange={(open) => !open && setPreviewApp(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Application Preview - {previewApp?.acknowledgementNo}
            </DialogTitle>
          </DialogHeader>
          {previewApp && (
            <div className="border rounded-lg p-2 bg-gray-50 overflow-x-auto">
              <DigitalCertificatePrintTemplate
                data={previewApp}
                showPrintButton={true}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
