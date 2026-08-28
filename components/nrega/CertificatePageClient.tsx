"use client";

import React, { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { saveVerifications } from "@/action/nrega/verification-actions";
import { updateCertificateStatus } from "@/action/nrega/certificate-actions";
import CertificatePreview from "./certificates/CertificatePreview";
import VerificationTable, { type VerificationRow } from "./certificates/VerificationTable";
import type { NregaWork, NregaCertificate, NregaCertificateVerification, NregaCertificateTemplate } from "@prisma/client";
import {
  Printer,
  Save,
  Eye,
  Edit,
  Loader2,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

interface CertificatePageProps {
  work: NregaWork;
  certificate: NregaCertificate;
  verifications: NregaCertificateVerification[];
  template: NregaCertificateTemplate | null;
}

export default function CertificatePageClient({
  work,
  certificate,
  verifications: initialVerifications,
  template,
}: CertificatePageProps) {
  const [mode, setMode] = useState<"edit" | "preview">(
    certificate.status === "DRAFT" ? "edit" : "preview"
  );
  const [verifications, setVerifications] = useState<VerificationRow[]>(
    initialVerifications.map((v) => ({
      parameterKey: v.parameterKey,
      parameter: v.parameter,
      status: v.status,
      remarks: v.remarks || "",
    }))
  );
  const [certText, setCertText] = useState(
    certificate.certificationText || template?.certificationText || ""
  );
  const [signatureDesignation, setSignatureDesignation] = useState(
    certificate.signatureDesignation || template?.signatureDesignation || "Block Development Officer"
  );
  const [signatureBlock, setSignatureBlock] = useState(
    certificate.signatureBlock || work.block
  );
  const [isPending, startTransition] = useTransition();
  const printRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Certificate-${certificate.certificateNumber}_${work.workId}`,
  });

  const handleSave = () => {
    startTransition(async () => {
      try {
        // Save verifications
        const result = await saveVerifications(
          work.id,
          certificate.certificateNumber,
          verifications
        );

        // Update certificate text and signature
        await updateCertificateStatus(
          work.id,
          certificate.certificateNumber,
          certificate.status as "DRAFT" | "COMPLETED" | "PRINTED" | "NOT_APPLICABLE",
          certText,
          signatureDesignation,
          signatureBlock
        );

        if (result.success) {
          toast.success("Verification data and certificate saved");
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error("An error occurred");
      }
    });
  };

  const handleMarkComplete = () => {
    const hasPending = verifications.some((v) => v.status === "PENDING");
    if (hasPending) {
      toast.warning("Please verify all applicable parameters before completing.");
      return;
    }

    startTransition(async () => {
      try {
        await saveVerifications(work.id, certificate.certificateNumber, verifications);
        await updateCertificateStatus(
          work.id,
          certificate.certificateNumber,
          "COMPLETED",
          certText,
          signatureDesignation,
          signatureBlock
        );
        toast.success("Certificate marked as completed");
        router.refresh();
        setMode("preview");
      } catch {
        toast.error("An error occurred");
      }
    });
  };

  const handleMarkPrinted = () => {
    startTransition(async () => {
      try {
        await updateCertificateStatus(work.id, certificate.certificateNumber, "PRINTED");
        toast.success("Certificate marked as printed");
        handlePrint();
        router.refresh();
      } catch {
        toast.error("An error occurred");
      }
    });
  };

  const certTitle = template?.title?.replace(/^CERTIFICATE-\d+:\s*/, "") || certificate.certificateName;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Certificates
          </button>
          <h2 className="text-xl font-bold">
            Certificate-{certificate.certificateNumber}
          </h2>
          <p className="text-sm text-muted-foreground">
            {certificate.certificateName} — {work.workId}
          </p>
        </div>
        <div className="flex gap-2">
          {mode === "edit" ? (
            <>
              <Button variant="outline" onClick={() => setMode("preview")} className="gap-2" size="sm">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button onClick={handleSave} disabled={isPending} className="gap-2" size="sm">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </Button>
              <Button onClick={handleMarkComplete} disabled={isPending} variant="default" className="gap-2" size="sm">
                <CheckCircle className="h-4 w-4" />
                Mark Complete
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setMode("edit")} className="gap-2" size="sm">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button onClick={handleMarkPrinted} disabled={isPending} className="gap-2" size="sm">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                Print
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Edit Mode */}
      {mode === "edit" && (
        <div className="space-y-6">
          {/* Verification Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verification Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <VerificationTable
                verifications={verifications}
                onChange={setVerifications}
                readOnly={false}
              />
            </CardContent>
          </Card>

          {/* Certification Text */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Certification Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Certification Paragraph (Editable)</Label>
                <Textarea
                  value={certText}
                  onChange={(e) => setCertText(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Signature Designation</Label>
                  <Input
                    value={signatureDesignation}
                    onChange={(e) => setSignatureDesignation(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Block</Label>
                  <Input
                    value={signatureBlock}
                    onChange={(e) => setSignatureBlock(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview / Print */}
      <div ref={printRef}>
        <CertificatePreview
          work={work}
          certificate={{
            ...certificate,
            certificationText: certText,
            signatureDesignation,
            signatureBlock,
          }}
          verifications={initialVerifications.map((v, i) => ({
            ...v,
            status: (verifications[i]?.status as NregaCertificateVerification["status"]) || v.status,
            remarks: verifications[i]?.remarks || v.remarks,
          }))}
          templateTitle={certTitle}
        />
      </div>
    </div>
  );
}
