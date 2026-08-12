"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  officeVerificationSchema,
  type OfficeVerificationFormData,
} from "@/schema/digital-certificate";
import { updateOfficeVerification } from "@/action/digital-certificate";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Printer,
  ExternalLink,
  FileCheck,
  Users,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";

interface OfficeVerificationModalProps {
  application: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function OfficeVerificationModal({
  application,
  isOpen,
  onClose,
  onSuccess,
}: OfficeVerificationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedPdfUrl, setIssuedPdfUrl] = useState<string>("");
  const [isUploadingIssuedPdf, setIsUploadingIssuedPdf] = useState<boolean>(false);

  const form = useForm<OfficeVerificationFormData>({
    resolver: zodResolver(officeVerificationSchema),
    defaultValues: {
      applicationReceivedOn: new Date(),
      registerNoPageNoSerialNo: "",
      officeRegistrationYear: "",
      officeRegistrationNo: "",
      dateOfVerification: new Date(),
      recordAvailable: true,
      registrationVerified: true,
      subRegistrarOrder: "APPROVED",
      rejectionReason: "",
      dataEntryOperatorName: "Staff / DEO",
      dataEntryOperatorSignature: "Verified by DEO",
      dataEntryOperatorDate: new Date(),
      subRegistrarName: "Sub-Registrar of Births & Deaths",
      subRegistrarSignature: "Sub-Registrar, Dhalpara GP",
      subRegistrarDate: new Date(),
      issuedCertificateUrl: "",
    },
  });

  useEffect(() => {
    if (application) {
      setIssuedPdfUrl(application.issuedCertificateUrl || "");
      form.reset({
        applicationReceivedOn: application.applicationReceivedOn
          ? new Date(application.applicationReceivedOn)
          : application.createdAt ? new Date(application.createdAt) : new Date(),
        registerNoPageNoSerialNo: application.registerNoPageNoSerialNo || "",
        officeRegistrationYear: application.officeRegistrationYear || application.registrationYear || "",
        officeRegistrationNo: application.officeRegistrationNo || application.registrationNumber || "",
        dateOfVerification: application.dateOfVerification
          ? new Date(application.dateOfVerification)
          : new Date(),
        recordAvailable: application.recordAvailable !== null ? application.recordAvailable : true,
        registrationVerified: application.registrationVerified !== null ? application.registrationVerified : true,
        subRegistrarOrder: (application.subRegistrarOrder as any) || (application.status === "REJECTED" ? "REJECTED" : "APPROVED"),
        rejectionReason: application.rejectionReason || "",
        dataEntryOperatorName: application.dataEntryOperatorName || "Staff / DEO",
        dataEntryOperatorSignature: application.dataEntryOperatorSignature || "Verified by DEO",
        dataEntryOperatorDate: application.dataEntryOperatorDate
          ? new Date(application.dataEntryOperatorDate)
          : new Date(),
        subRegistrarName: application.subRegistrarName || "Sub-Registrar of Births & Deaths",
        subRegistrarSignature: application.subRegistrarSignature || "Sub-Registrar, Dhalpara GP",
        subRegistrarDate: application.subRegistrarDate
          ? new Date(application.subRegistrarDate)
          : new Date(),
        issuedCertificateUrl: application.issuedCertificateUrl || "",
      });
    }
  }, [application, form]);

  const subRegistrarOrder = form.watch("subRegistrarOrder");

  const onSubmit = async (values: OfficeVerificationFormData) => {
    if (!application?.id) return;
    setIsSubmitting(true);
    try {
      const res = await updateOfficeVerification(application.id, {
        ...values,
        issuedCertificateUrl: issuedPdfUrl || null,
      });
      if (res.success) {
        toast.success(res.message || "Office verification updated successfully");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.message || "Failed to update verification");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Office Verification & Sub-Registrar Order
              </DialogTitle>
              <DialogDescription className="text-xs mt-1">
                Acknowledgement No:{" "}
                <span className="font-mono font-bold text-foreground">
                  {application.acknowledgementNo}
                </span>{" "}
                | Person: <span className="font-bold">{application.personName}</span> (
                {application.certificateType})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
          {/* Enclosed Documents & Uploaded PDFs */}
          <div className="space-y-4 border rounded-xl p-4 bg-muted/15">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" /> C. Enclosed Application Documents (PDF ≤ 250 KB)
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Review attached PDF files or hardcopy documents provided by the applicant.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Proof of Identity */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border bg-background shadow-xs">
                <span className="font-medium text-foreground">Proof of Identity:</span>
                {application.docProofOfIdentityUrl ? (
                  <a
                    href={application.docProofOfIdentityUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md inline-flex items-center gap-1 transition-all"
                  >
                    <ExternalLink className="w-3 h-3 text-blue-600" /> View PDF
                  </a>
                ) : application.docProofOfIdentity ? (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    Enclosed (Hardcopy)
                  </span>
                ) : (
                  <span className="text-muted-foreground text-[11px]">Not enclosed</span>
                )}
              </div>

              {/* Previous Certificate */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border bg-background shadow-xs">
                <span className="font-medium text-foreground">Previous Certificate:</span>
                {application.docPreviousCertificateUrl ? (
                  <a
                    href={application.docPreviousCertificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md inline-flex items-center gap-1 transition-all"
                  >
                    <ExternalLink className="w-3 h-3 text-blue-600" /> View PDF
                  </a>
                ) : application.docPreviousCertificate ? (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    Enclosed (Hardcopy)
                  </span>
                ) : (
                  <span className="text-muted-foreground text-[11px]">Not enclosed</span>
                )}
              </div>

              {/* General Diary Copy */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border bg-background shadow-xs">
                <span className="font-medium text-foreground">General Diary (GD) Copy:</span>
                {application.docGeneralDiaryUrl ? (
                  <a
                    href={application.docGeneralDiaryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md inline-flex items-center gap-1 transition-all"
                  >
                    <ExternalLink className="w-3 h-3 text-blue-600" /> View PDF
                  </a>
                ) : application.docGeneralDiary ? (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    Enclosed (Hardcopy)
                  </span>
                ) : (
                  <span className="text-muted-foreground text-[11px]">Not enclosed</span>
                )}
              </div>

              {/* Registration Details */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border bg-background shadow-xs">
                <span className="font-medium text-foreground">Registration Details:</span>
                {application.docRegistrationDetailsUrl ? (
                  <a
                    href={application.docRegistrationDetailsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md inline-flex items-center gap-1 transition-all"
                  >
                    <ExternalLink className="w-3 h-3 text-blue-600" /> View PDF
                  </a>
                ) : application.docRegistrationDetails ? (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    Enclosed (Hardcopy)
                  </span>
                ) : (
                  <span className="text-muted-foreground text-[11px]">Not enclosed</span>
                )}
              </div>

              {/* Other Document */}
              {(application.docOtherDocument || application.docOtherDocumentUrl) && (
                <div className="sm:col-span-2 flex items-center justify-between p-2.5 rounded-lg border bg-background shadow-xs">
                  <span className="font-medium text-foreground">
                    Other: {application.docOtherDetails || "Supporting Document"}
                  </span>
                  {application.docOtherDocumentUrl ? (
                    <a
                      href={application.docOtherDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md inline-flex items-center gap-1 transition-all"
                    >
                      <ExternalLink className="w-3 h-3 text-blue-600" /> View PDF
                    </a>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      Enclosed (Hardcopy)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Section C2: Family Identity Verification Documents */}
            <div className="pt-3 border-t space-y-2">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-green-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-green-600" /> C2. Verification Identity Documents (Family Aadhaar & Voter IDs)
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Father's Aadhaar */}
                <div className="flex items-center justify-between p-2 rounded-lg border bg-green-50/30">
                  <span>Father's Aadhaar:</span>
                  {application.docFatherAadhaarUrl ? (
                    <a
                      href={application.docFatherAadhaarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-xs bg-green-100 text-green-800 hover:bg-green-200 border border-green-300 px-2 py-0.5 rounded inline-flex items-center gap-1 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" /> View PDF
                    </a>
                  ) : application.docFatherAadhaar ? (
                    <span className="text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                      Available
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-[11px]">Not uploaded</span>
                  )}
                </div>

                {/* Father's Voter */}
                <div className="flex items-center justify-between p-2 rounded-lg border bg-green-50/30">
                  <span>Father's Voter ID:</span>
                  {application.docFatherVoterUrl ? (
                    <a
                      href={application.docFatherVoterUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-xs bg-green-100 text-green-800 hover:bg-green-200 border border-green-300 px-2 py-0.5 rounded inline-flex items-center gap-1 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" /> View PDF
                    </a>
                  ) : application.docFatherVoter ? (
                    <span className="text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                      Available
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-[11px]">Not uploaded</span>
                  )}
                </div>

                {/* Mother's Aadhaar */}
                <div className="flex items-center justify-between p-2 rounded-lg border bg-purple-50/30">
                  <span>Mother's Aadhaar:</span>
                  {application.docMotherAadhaarUrl ? (
                    <a
                      href={application.docMotherAadhaarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-xs bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-300 px-2 py-0.5 rounded inline-flex items-center gap-1 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" /> View PDF
                    </a>
                  ) : application.docMotherAadhaar ? (
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                      Available
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-[11px]">Not uploaded</span>
                  )}
                </div>

                {/* Mother's Voter */}
                <div className="flex items-center justify-between p-2 rounded-lg border bg-purple-50/30">
                  <span>Mother's Voter ID:</span>
                  {application.docMotherVoterUrl ? (
                    <a
                      href={application.docMotherVoterUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-xs bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-300 px-2 py-0.5 rounded inline-flex items-center gap-1 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" /> View PDF
                    </a>
                  ) : application.docMotherVoter ? (
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                      Available
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-[11px]">Not uploaded</span>
                  )}
                </div>

                {/* Child's Aadhaar (for Birth Certificate) */}
                {application.certificateType === "BIRTH" && (
                  <div className="sm:col-span-2 flex items-center justify-between p-2 rounded-lg border bg-blue-50/30">
                    <span>Child's Aadhaar:</span>
                    {application.docChildAadhaarUrl ? (
                      <a
                        href={application.docChildAadhaarUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300 px-2 py-0.5 rounded inline-flex items-center gap-1 transition-all"
                      >
                        <ExternalLink className="w-3 h-3" /> View PDF
                      </a>
                    ) : application.docChildAadhaar ? (
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                        Available
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">Not uploaded</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Office Records Table Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              1. Receipt & Official Record Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="applicationReceivedOn" className="text-xs">Application Received Date</Label>
                <Input
                  id="applicationReceivedOn"
                  type="date"
                  value={
                    form.watch("applicationReceivedOn")
                      ? format(new Date(form.watch("applicationReceivedOn")!), "yyyy-MM-dd")
                      : ""
                  }
                  onChange={(e) => {
                    if (e.target.value) form.setValue("applicationReceivedOn", new Date(e.target.value));
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="registerNoPageNoSerialNo" className="text-xs">
                  Register No. & Page No. & Serial No.
                </Label>
                <Input
                  id="registerNoPageNoSerialNo"
                  placeholder="e.g., Vol 2, Page 14, Sl 08"
                  {...form.register("registerNoPageNoSerialNo")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="officeRegistrationYear" className="text-xs">Registration Year (Office)</Label>
                <Input
                  id="officeRegistrationYear"
                  placeholder="e.g., 2024"
                  {...form.register("officeRegistrationYear")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="officeRegistrationNo" className="text-xs">Registration No. (Office)</Label>
                <Input
                  id="officeRegistrationNo"
                  placeholder="e.g., 145/2024"
                  {...form.register("officeRegistrationNo")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dateOfVerification" className="text-xs">Date of Verification</Label>
                <Input
                  id="dateOfVerification"
                  type="date"
                  value={
                    form.watch("dateOfVerification")
                      ? format(new Date(form.watch("dateOfVerification")!), "yyyy-MM-dd")
                      : ""
                  }
                  onChange={(e) => {
                    if (e.target.value) form.setValue("dateOfVerification", new Date(e.target.value));
                  }}
                />
              </div>
            </div>

            {/* Verification Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="border p-3 rounded-lg space-y-2 bg-muted/20">
                <Label className="text-xs font-bold">Record Available in GP Office?</Label>
                <RadioGroup
                  value={form.watch("recordAvailable") ? "true" : "false"}
                  onValueChange={(val) => form.setValue("recordAvailable", val === "true")}
                  className="flex items-center gap-6 pt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="rec-yes" />
                    <Label htmlFor="rec-yes" className="text-xs cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="rec-no" />
                    <Label htmlFor="rec-no" className="text-xs cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="border p-3 rounded-lg space-y-2 bg-muted/20">
                <Label className="text-xs font-bold">Registration Verified & Matched?</Label>
                <RadioGroup
                  value={form.watch("registrationVerified") ? "true" : "false"}
                  onValueChange={(val) => form.setValue("registrationVerified", val === "true")}
                  className="flex items-center gap-6 pt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="reg-yes" />
                    <Label htmlFor="reg-yes" className="text-xs cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="reg-no" />
                    <Label htmlFor="reg-no" className="text-xs cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Sub-Registrar Decision */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              2. Order of the Sub-Registrar
            </h4>

            <div className="space-y-2">
              <Label className="text-xs font-bold">Sub-Registrar Decision</Label>
              <RadioGroup
                value={subRegistrarOrder || "APPROVED"}
                onValueChange={(val: any) => form.setValue("subRegistrarOrder", val)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <Label
                  htmlFor="order-approve"
                  className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    subRegistrarOrder === "APPROVED"
                      ? "border-green-600 bg-green-50 text-green-950 font-bold"
                      : "border-border hover:bg-muted/20"
                  }`}
                >
                  <RadioGroupItem value="APPROVED" id="order-approve" />
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Approved for Issue of Certificate</span>
                </Label>

                <Label
                  htmlFor="order-reject"
                  className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    subRegistrarOrder === "REJECTED"
                      ? "border-red-600 bg-red-50 text-red-950 font-bold"
                      : "border-border hover:bg-muted/20"
                  }`}
                >
                  <RadioGroupItem value="REJECTED" id="order-reject" />
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Rejected</span>
                </Label>
              </RadioGroup>
            </div>

            {subRegistrarOrder === "REJECTED" && (
              <div className="space-y-1.5">
                <Label htmlFor="rejectionReason" className="text-xs text-red-600 font-bold">
                  Reason for Rejection <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="rejectionReason"
                  rows={2}
                  placeholder="State the reason why the application cannot be approved..."
                  {...form.register("rejectionReason")}
                />
              </div>
            )}

            {subRegistrarOrder === "APPROVED" && (
              <div className="p-3.5 rounded-xl border-2 border-emerald-300 bg-emerald-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" /> Official Issued Certificate PDF (For Applicant Download)
                  </h5>
                  {issuedPdfUrl && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                      Ready for Download
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-800">
                  Upload the official signed Digital Birth/Death Certificate PDF file so the applicant can download it directly from their tracking dashboard.
                </p>

                <input
                  type="file"
                  id="issued-cert-pdf-input"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  disabled={isUploadingIssuedPdf}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
                      toast.error("Only PDF files are allowed.");
                      e.target.value = "";
                      return;
                    }
                    setIsUploadingIssuedPdf(true);
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
                        setIssuedPdfUrl(data.url);
                        form.setValue("issuedCertificateUrl", data.url);
                        toast.success("Official Certificate PDF uploaded successfully!");
                      } else {
                        throw new Error(data.message || "Failed to upload file");
                      }
                    } catch (err: any) {
                      toast.error(err?.message || "Upload failed");
                    } finally {
                      setIsUploadingIssuedPdf(false);
                      e.target.value = "";
                    }
                  }}
                />

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {issuedPdfUrl ? (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        asChild
                        className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      >
                        <a href={issuedPdfUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="w-3.5 h-3.5" /> View / Download Issued Certificate
                        </a>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploadingIssuedPdf}
                        onClick={() => document.getElementById("issued-cert-pdf-input")?.click()}
                        className="text-xs gap-1.5 border-emerald-300 text-emerald-900 bg-white hover:bg-emerald-100"
                      >
                        {isUploadingIssuedPdf ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5" /> Replace Certificate PDF
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploadingIssuedPdf}
                      onClick={() => document.getElementById("issued-cert-pdf-input")?.click()}
                      className="text-xs gap-1.5 border-dashed border-emerald-400 bg-white text-emerald-900 hover:bg-emerald-100 font-bold"
                    >
                      {isUploadingIssuedPdf ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5 text-emerald-700" /> Upload Official Issued Certificate (PDF)
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Signatures & Authority */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              3. Signatures & Authorities
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* DEO */}
              <div className="border p-3 rounded-lg space-y-3 bg-muted/10">
                <p className="text-xs font-bold uppercase text-primary">Data Entry Operator</p>
                <div className="space-y-1">
                  <Label htmlFor="dataEntryOperatorName" className="text-xs">Operator Name</Label>
                  <Input
                    id="dataEntryOperatorName"
                    {...form.register("dataEntryOperatorName")}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dataEntryOperatorSignature" className="text-xs">Signature / Remark</Label>
                  <Input
                    id="dataEntryOperatorSignature"
                    {...form.register("dataEntryOperatorSignature")}
                  />
                </div>
              </div>

              {/* Sub-Registrar */}
              <div className="border p-3 rounded-lg space-y-3 bg-muted/10">
                <p className="text-xs font-bold uppercase text-primary">Sub-Registrar</p>
                <div className="space-y-1">
                  <Label htmlFor="subRegistrarName" className="text-xs">Sub-Registrar Name</Label>
                  <Input
                    id="subRegistrarName"
                    {...form.register("subRegistrarName")}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="subRegistrarSignature" className="text-xs">Signature / Designation</Label>
                  <Input
                    id="subRegistrarSignature"
                    {...form.register("subRegistrarSignature")}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              asChild
            >
              <Link
                href={`/admindashboard/manage-digital-certificate/print/${application.id}`}
                target="_blank"
              >
                <Printer className="w-4 h-4 mr-2" /> Print Official Form
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 bg-primary hover:bg-primary/90 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Save Verification & Order
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
