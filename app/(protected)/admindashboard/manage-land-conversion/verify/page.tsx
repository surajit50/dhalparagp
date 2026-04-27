"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Search, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  getApplicationsForVerification,
  verifyApplication,
} from "@/action/land-conversion-actions";
import type { LandConversionStatus } from "@prisma/client";

interface ApplicationSummary {
  id: string;
  applicantName: string;
  khatianNo: string;
  plotNo: string;
  mouza: string;
  status: LandConversionStatus;
}

const statusBadgeClass: Record<LandConversionStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-800",
  VERIFICATION_PENDING: "bg-blue-100 text-blue-800",
  VERIFIED: "bg-green-100 text-green-800",
  VERIFICATION_REJECTED: "bg-red-100 text-red-800",
  INSPECTION_PENDING: "bg-amber-100 text-amber-800",
  INSPECTION_COMPLETED: "bg-green-100 text-green-800",
  INSPECTION_REJECTED: "bg-red-100 text-red-800",
  APPROVAL_PENDING: "bg-indigo-100 text-indigo-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  ISSUED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function DocumentVerificationPage() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [selected, setSelected] = useState<ApplicationSummary | null>(null);
  const [remarks, setRemarks] = useState("");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await getApplicationsForVerification();
      if (result.success && result.data) {
        setApplications(result.data);
      } else if (!result.success) {
        toast({
          title: "Failed to load applications",
          description: result.error ?? "Please try again.",
          variant: "destructive",
        });
      }
    });
  }, [toast]);

  const filtered = applications.filter((a) =>
    [a.applicantName, a.khatianNo, a.plotNo, a.mouza].some((f) => f.toLowerCase().includes(search.toLowerCase()))
  );

  const takeAction = (action: "verify" | "reject") => {
    if (!selected) return;
    if (action === "reject" && !remarks.trim()) {
      toast({
        title: "Remarks required",
        description: "Please provide rejection remarks before rejecting.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await verifyApplication(selected.id, remarks, action);
      if (!result.success) {
        toast({
          title: "Failed to update application",
          description: result.error ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: action === "verify" ? "Documents Verified" : "Application Rejected",
        description:
          action === "verify"
            ? "Application moved to Site Inspection."
            : "Remarks recorded and applicant notified.",
      });

      setRemarks("");
      setSelected(null);

      const refreshed = await getApplicationsForVerification();
      if (refreshed.success && refreshed.data) {
        setApplications(refreshed.data);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <div className="bg-[#1e40af] text-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <FileText className="h-7 w-7" />
          <div>
            <h1 className="text-lg font-semibold">
              Land Conversion Management System
            </h1>
            <p className="text-xs text-blue-100">
              Government of West Bengal
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white border border-gray-300 shadow-sm">
          <div className="bg-[#e2e8f0] px-4 py-3 border-b">
            <h2 className="text-gray-700 font-semibold">
              Document Verification
            </h2>
            <p className="text-sm text-gray-600">
              Verify uploaded records and validate ownership and land details.
            </p>
          </div>
          <div className="p-4 space-y-6">
            <Card>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by applicant, khatian, plot or mouza"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((app) => (
                    <Card
                      key={app.id}
                      className={`cursor-pointer ${
                        selected?.id === app.id
                          ? "border-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelected(app)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          {app.applicantName}
                        </CardTitle>
                        <CardDescription>
                          Khatian: {app.khatianNo} • Plot: {app.plotNo}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Badge>{app.mouza}</Badge>
                          <Badge className={statusBadgeClass[app.status]}>
                            {app.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Verification Panel
                </CardTitle>
                <CardDescription>Select an application to proceed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selected ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Applicant</Label>
                        <p className="text-sm">{selected.applicantName}</p>
                      </div>
                      <div>
                        <Label>Khatian / Plot</Label>
                        <p className="text-sm">
                          {selected.khatianNo} / {selected.plotNo}
                        </p>
                      </div>
                      <div>
                        <Label>Mouza</Label>
                        <p className="text-sm">{selected.mouza}</p>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="remarks">Remarks</Label>
                      <Textarea
                        id="remarks"
                        rows={3}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add verification remarks..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={() => takeAction("verify")} disabled={isPending}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => takeAction("reject")}
                        disabled={isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    No application selected.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
