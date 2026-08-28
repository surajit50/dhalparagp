"use client";

import React, { useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { initializeCertificates } from "@/action/nrega/certificate-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  FileText,
  CheckCircle,
  Printer,
  AlertCircle,
  Ban,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface CertificateInfo {
  certificateNumber: number;
  certificateName: string;
  status: string;
}

interface CertificateHubProps {
  workId: string;
  workDbId: string;
  workName: string;
  certificates: CertificateInfo[];
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  DRAFT: {
    icon: <FileText className="h-4 w-4" />,
    color: "bg-gray-100 text-gray-800 border-gray-200",
    label: "Draft",
  },
  COMPLETED: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Completed",
  },
  PRINTED: {
    icon: <Printer className="h-4 w-4" />,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Printed",
  },
  NOT_APPLICABLE: {
    icon: <Ban className="h-4 w-4" />,
    color: "bg-orange-50 text-orange-600 border-orange-200",
    label: "N/A",
  },
};

const certDescriptions: Record<number, string> = {
  1: "Certification of Pre-Estimation, Feasibility, Expected Outcome & Utility Report.",
  2: "Verify that the proposed work does not duplicate any existing work.",
  3: "Verify that the work has not been artificially split into smaller works.",
  4: "Verify that the work is permissible as per the applicable work list.",
  5: "Verify beneficiary eligibility under Individual Benefit Scheme.",
  6: "Verify that the DPR has been prepared as per prescribed format.",
  7: "Verify clearance obtained from the converging department.",
  8: "Verify adherence to all non-negotiable conditions.",
};

export default function CertificateHub({
  workId,
  workDbId,
  workName,
  certificates,
}: CertificateHubProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleInitialize = () => {
    startTransition(async () => {
      const result = await initializeCertificates(workDbId);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  // Certificate checklist summary
  const completed = certificates.filter(
    (c) => c.status === "COMPLETED" || c.status === "PRINTED"
  ).length;
  const pending = certificates.filter((c) => c.status === "DRAFT").length;
  const na = certificates.filter((c) => c.status === "NOT_APPLICABLE").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Generate Certificates</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Work: {workName} ({workId})
          </p>
        </div>
        {certificates.length < 8 && (
          <Button onClick={handleInitialize} disabled={isPending} className="gap-2">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {certificates.length === 0 ? "Initialize Certificates" : "Add Missing Certificates"}
          </Button>
        )}
      </div>

      {/* Summary Bar */}
      {certificates.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <strong>{completed}</strong> Completed
              </span>
              <span className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <strong>{pending}</strong> Pending
              </span>
              {na > 0 && (
                <span className="flex items-center gap-1.5">
                  <Ban className="h-4 w-4 text-orange-500" />
                  <strong>{na}</strong> N/A
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate Cards */}
      {certificates.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No certificates initialized yet.</p>
            <p className="text-xs mt-1">Click &quot;Initialize Certificates&quot; to create all certificate records from templates.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => {
            const config = statusConfig[cert.status] || statusConfig.DRAFT;
            const isNA = cert.status === "NOT_APPLICABLE";

            return (
              <Card
                key={cert.certificateNumber}
                className={`hover:shadow-md transition-shadow ${isNA ? "opacity-60" : ""}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase">
                        Certificate-{cert.certificateNumber}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs gap-1 ${config.color}`}
                    >
                      {config.icon}
                      {config.label}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold mb-2 leading-tight">
                    {cert.certificateName}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    {certDescriptions[cert.certificateNumber]}
                  </p>
                  {!isNA && (
                    <Link
                      href={`/employeedashboard/nrega/works/${workDbId}/certificates/${cert.certificateNumber}`}
                    >
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        {cert.status === "DRAFT"
                          ? "Enter Verification"
                          : cert.status === "COMPLETED"
                          ? "View / Print"
                          : "View"}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Checklist */}
      {certificates.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">Certificate Checklist</h3>
            <div className="space-y-1.5">
              {certificates.map((cert) => (
                <div key={cert.certificateNumber} className="flex items-center gap-2 text-sm">
                  {cert.status === "COMPLETED" || cert.status === "PRINTED" ? (
                    <span className="text-green-600">✓</span>
                  ) : cert.status === "NOT_APPLICABLE" ? (
                    <span className="text-orange-500">N/A</span>
                  ) : (
                    <span className="text-gray-400">○</span>
                  )}
                  <span className={cert.status === "NOT_APPLICABLE" ? "line-through text-muted-foreground" : ""}>
                    Certificate-{cert.certificateNumber}: {cert.certificateName}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {cert.status === "COMPLETED"
                      ? "Completed"
                      : cert.status === "PRINTED"
                      ? "Printed"
                      : cert.status === "NOT_APPLICABLE"
                      ? ""
                      : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
