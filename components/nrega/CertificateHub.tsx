"use client";

import React, { useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { initializeCertificates } from "@/action/nrega/certificate-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn, toTitleCase } from "@/lib/utils";
import type { NregaCertificateStatus } from "@prisma/client";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Ban,
  Loader2,
  RefreshCw,
  ExternalLink,
  ListChecks,
} from "lucide-react";
import {
  CERTIFICATE_STATUS_CONFIG,
  CERTIFICATE_DESCRIPTIONS,
  calculateCertificateProgress,
} from "@/lib/utils/nrega";

interface CertificateInfo {
  certificateNumber: number;
  certificateName: string;
  status: NregaCertificateStatus | string;
}

interface CertificateHubProps {
  workId: string;
  workDbId: string;
  workName: string;
  certificates: CertificateInfo[];
}

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

  const summary = calculateCertificateProgress(certificates);

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
        <Card className={cn(
          "bg-gradient-to-r overflow-hidden",
          summary.progress === 100
            ? "from-green-50 via-emerald-50 to-green-50 border-green-200"
            : summary.progress > 50
              ? "from-blue-50 via-indigo-50 to-blue-50 border-blue-200"
              : "from-amber-50 via-orange-50 to-amber-50 border-amber-200"
        )}>
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-green-100">
                  <CheckCircle className="h-4 w-4 text-green-700" />
                </div>
                <span className="text-muted-foreground">Completed</span>
                <strong className="text-base text-green-700 tabular-nums">{summary.completed}</strong>
              </span>
              <span className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-100">
                  <AlertCircle className="h-4 w-4 text-amber-700" />
                </div>
                <span className="text-muted-foreground">Pending</span>
                <strong className="text-base text-amber-700 tabular-nums">{summary.pending}</strong>
              </span>
              {summary.na > 0 && (
                <span className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-orange-100">
                    <Ban className="h-4 w-4 text-orange-700" />
                  </div>
                  <span className="text-muted-foreground">N/A</span>
                  <strong className="text-base text-orange-700 tabular-nums">{summary.na}</strong>
                </span>
              )}
              {summary.applicable > 0 && (
                <span className="ml-auto flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong className={cn(
                      "text-lg tabular-nums",
                      summary.progress === 100 ? "text-green-700" : "text-foreground"
                    )}>{summary.progress}%</strong>
                    <span className="text-muted-foreground ml-1 text-xs">
                      ({summary.completed}/{summary.applicable} applicable)
                    </span>
                  </span>
                </span>
              )}
            </div>
            {/* Progress bar */}
            {summary.applicable > 0 && (
              <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-700",
                    summary.progress === 100
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : summary.progress > 50
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                        : "bg-gradient-to-r from-amber-500 to-orange-500"
                  )}
                  style={{ width: `${summary.progress}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Certificate Cards */}
      {certificates.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 p-4 bg-muted/50 rounded-full w-fit">
              <FileText className="h-12 w-12 opacity-40" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No certificates initialized yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Click &quot;Initialize Certificates&quot; to create all 8 certificate records from the templates with auto-detected applicability.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => {
            const statusKey = (cert.status as NregaCertificateStatus) in CERTIFICATE_STATUS_CONFIG
              ? (cert.status as NregaCertificateStatus)
              : "DRAFT";
            const config = CERTIFICATE_STATUS_CONFIG[statusKey];
            const isNA = cert.status === "NOT_APPLICABLE";
            const isDone = cert.status === "COMPLETED" || cert.status === "PRINTED";

            return (
              <Card
                key={cert.certificateNumber}
                className={cn(
                  "group transition-all duration-200",
                  isNA ? "opacity-60" : "hover:shadow-md hover:-translate-y-0.5",
                  isDone && "ring-1 ring-green-200"
                )}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold",
                        isDone ? "bg-green-100 text-green-700" :
                        isNA ? "bg-orange-100 text-orange-700" :
                        "bg-primary/10 text-primary"
                      )}>
                        {cert.certificateNumber}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("text-[11px] gap-1 px-2 py-0.5", config.color)}
                    >
                      {config.icon}
                      {config.label}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold leading-snug">
                    {cert.certificateName}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed min-h-[48px]">
                    {CERTIFICATE_DESCRIPTIONS[cert.certificateNumber] || "—"}
                  </p>
                  {!isNA && (
                    <Link
                      href={`/employeedashboard/nrega/works/${workDbId}/certificates/${cert.certificateNumber}`}
                    >
                      <Button
                        variant={isDone ? "secondary" : "default"}
                        size="sm"
                        className={cn(
                          "w-full text-xs transition-all",
                          !isDone && "bg-primary hover:bg-primary/90"
                        )}
                      >
                        {cert.status === "DRAFT" ? "Enter Verification" :
                         cert.status === "COMPLETED" ? "View / Print" : "View"}
                        <ExternalLink className="ml-1.5 h-3 w-3" />
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
        <Card className="bg-muted/20">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Certificate Checklist Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {certificates.map((cert) => {
                const isDone = cert.status === "COMPLETED" || cert.status === "PRINTED";
                const isNA = cert.status === "NOT_APPLICABLE";
                return (
                  <div
                    key={cert.certificateNumber}
                    className={cn(
                      "flex items-center gap-3 text-sm px-3 py-2 rounded-lg transition-colors",
                      isDone ? "bg-green-50" : isNA ? "bg-orange-50/50" : "bg-white/60"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                    ) : isNA ? (
                      <Ban className="h-4 w-4 text-orange-500 shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                    )}
                    <span className={cn(
                      "flex-1 truncate",
                      isNA && "line-through text-muted-foreground"
                    )}>
                      <span className="font-medium mr-1">C{cert.certificateNumber}:</span>
                      {cert.certificateName}
                    </span>
                    <span className="text-[11px] font-semibold shrink-0">
                      {isDone
                        ? toTitleCase(cert.status as string)
                        : isNA
                        ? ""
                        : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
