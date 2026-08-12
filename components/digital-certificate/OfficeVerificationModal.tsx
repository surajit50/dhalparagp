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
import { Badge } from "@/components/ui/badge";
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
  FileText,
  Calendar,
  Hash,
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
      subRegistrarOrder: "UNDER_ENQUIRY", // New default
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
        subRegistrarOrder: application.subRegistrarOrder || "UNDER_ENQUIRY",
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Office Verification & Order
              </DialogTitle>
              <DialogDescription className="text-sm mt-1 flex items-center gap-3 flex-wrap">
                <span>
                  Acknowledgement:{" "}
                  <span className="font-mono font-bold text-foreground">
                    {application.acknowledgementNo}
                  </span>
                </span>
                <span className="text-muted-foreground">|</span>
                <span>
                  Person: <span className="font-bold">{application.personName}</span>
                </span>
                <span className="text-muted-foreground">|</span>
                <span>
                  Type:{" "}
                  <span className="font-semibold">
                    {application.certificateType === "BIRTH" ? "Birth" : "Death"}
                  </span>
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-4 space-y-6">
          {/* Status Flow Indicator */}
          <div className="flex items-center justify-between gap-2 bg-muted/20 p-3 rounded-lg border">
            <div className="flex items-center gap-1 text-xs font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> Submitted
              </span>
              <span className="text-muted-foreground mx-1">→</span>
              <span
                className={`flex items-center gap-1 ${
                  subRegistrarOrder === "UNDER_ENQUIRY"
                    ? "text-amber-600 font-bold"
                    : "text-muted-foreground"
                }`}
              >
                <Clock className="w-4 h-4" /> Under Enquiry
              </span>
              <span className="text-muted-foreground mx-1">→</span>
              <span
                className={`flex items-center gap-1 ${
                  subRegistrarOrder === "APPROVED"
                    ? "text-green-600 font-bold"
                    : subRegistrarOrder === "REJECTED"
                    ? "text-red-600 font-bold"
                    : "text-muted-foreground"
                }`}
              >
                {subRegistrarOrder === "APPROVED" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : subRegistrarOrder === "REJECTED" ? (
                  <XCircle className="w-4 h-4" />
                ) : null}
                {subRegistrarOrder === "APPROVED"
                  ? "Approved"
                  : subRegistrarOrder === "REJECTED"
                  ? "Rejected"
                  : "Decision Pending"}
              </span>
            </div>
            {subRegistrarOrder === "APPROVED" && issuedPdfUrl && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                <FileCheck className="w-3 h-3 mr-1" /> Certificate Ready
              </Badge>
            )}
          </div>

          {/* Section 1: Review Documents */}
          <div className="space-y-3 border rounded-xl p-4 bg-muted/10">
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <FileText className="w-4 h-4" /> 1. Enclosed Application Documents
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
              {[
                {
                  label: "Proof of Identity",
                  url: application.docProofOfIdentityUrl,
                  hard: application.docProofOfIdentity,
                },
                {
                  label: "Previous Certificate",
                  url: application.docPreviousCertificateUrl,
                  hard: application.docPreviousCertificate,
                },
                {
                  label: "General Diary Copy",
                  url: application.docGeneralDiaryUrl,
                  hard: application.docGeneralDiary,
                },
                {
                  label: "Registration Details",
                  url: application.docRegistrationDetailsUrl,
                  hard: application.docRegistrationDetails,
                },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg border bg-background shadow-sm"
                >
                  <span className="font-medium text-foreground">{doc.label}</span>
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> View PDF
                    </a>
                  ) : doc.hard ? (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      Hardcopy
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not enclosed</span>
                  )}
                </div>
              ))}
              {(application.docOtherDocument || application.docOtherDocumentUrl) && (
                <div className="sm:col-span-2 flex items-center justify-between p-2 rounded-lg border bg-background shadow-sm">
                  <span className="font-medium text-foreground">
                    Other: {application.docOtherDetails || "Supporting Document"}
                  </span>
                  {application.docOtherDocumentUrl ? (
                    <a
                      href={application.docOtherDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> View PDF
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      Hardcopy
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Family verification docs */}
            <div className="pt-3 border-t">
              <h5 className="text-xs font-bold uppercase tracking-wider text-green-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Family Identity Documents
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {[
                  { label: "Father Aadhaar", url: application.docFatherAadhaarUrl, hard: application.docFatherAadhaar },
                  { label: "Father Voter", url: application.docFatherVoterUrl, hard: application.docFatherVoter },
                  { label: "Mother Aadhaar", url: application.docMotherAadhaarUrl, hard: application.docMotherAadhaar },
                  { label: "Mother Voter", url: application.docMotherVoterUrl, hard: application.docMotherVoter },
                  application.certificateType === "BIRTH" && {
                    label: "Child Aadhaar",
                    url: application.docChildAadhaarUrl,
                    hard: application.docChildAadhaar,
                  },
                ]
                  .filter(Boolean)
                  .map((doc: any, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg border bg-green-50/30"
                    >
                      <span className="text-xs text-foreground">{doc.label}</span>
                      {doc.url ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> View PDF
                        </a>
                      ) : doc.hard ? (
                        <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                          Available
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not uploaded</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Section 2: Office Records */}
          <div className="space-y-4 border rounded-xl p-4 bg-muted/10">
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Calendar className="w-4 h-4" /> 2. Receipt & Official Record Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="applicationReceivedOn" className="text-xs font-medium">
                  Application Received Date
                </Label>
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
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="registerNoPageNoSerialNo" className="text-xs font-medium">
                  Register No. & Page & Serial
                </Label>
                <Input
                  id="registerNoPageNoSerialNo"
                  placeholder="e.g., Vol 2, Page 14, Sl 08"
                  {...form.register("registerNoPageNoSerialNo")}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="officeRegistrationYear" className="text-xs font-medium">
                  Registration Year (Office)
                </Label>
                <Input
                  id="officeRegistrationYear"
                  placeholder="e.g., 2024"
                  {...form.register("officeRegistrationYear")}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="officeRegistrationNo" className="text-xs font-medium">
                  Registration No. (Office)
                </Label>
                <Input
                  id="officeRegistrationNo"
                  placeholder="e.g., 145/2024"
                  {...form.register("officeRegistrationNo")}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dateOfVerification" className="text-xs font-medium">
                  Date of Verification
                </Label>
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
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="border p-3 rounded-lg bg-background">
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
              <div className="border p-3 rounded-lg bg-background">
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

          {/* Section 3: Sub-Registrar Decision */}
          <div className="border rounded-xl p-4 bg-muted/10 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Hash className="w-4 h-4" /> 3. Order of the Sub-Registrar
            </h4>
            <div className="space-y-2">
              <Label className="text-xs font-bold">Decision</Label>
              <RadioGroup
                value={subRegistrarOrder || "UNDER_ENQUIRY"}
                onValueChange={(val: any) => form.setValue("subRegistrarOrder", val)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                <Label
                  htmlFor="order-enquiry"
                  className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    subRegistrarOrder === "UNDER_ENQUIRY"
                      ? "border-amber-500 bg-amber-50 text-amber-900 font-bold"
                      : "border-border hover:bg-muted/20"
                  }`}
                >
                  <RadioGroupItem value="UNDER_ENQUIRY" id="order-enquiry" />
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Under Enquiry</span>
                </Label>
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
                  <span>Approved</span>
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
                  placeholder="Provide detailed reason for rejection..."
                  {...form.register("rejectionReason")}
                  className="text-xs"
                />
              </div>
            )}

            {subRegistrarOrder === "APPROVED" && (
              <div className="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" /> Upload Issued Certificate (PDF)
                  </h5>
                  {issuedPdfUrl && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
                      Ready for Download
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-800">
                  Upload the official signed Digital Certificate PDF file. Applicant will be able to download it from their dashboard.
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
                        toast.success("Certificate PDF uploaded successfully!");
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
                          <ExternalLink className="w-3.5 h-3.5" /> View / Download
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
                            <UploadCloud className="w-3.5 h-3.5" /> Replace PDF
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
                          <UploadCloud className="w-3.5 h-3.5 text-emerald-700" /> Upload Official Certificate (PDF)
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Signatures */}
          <div className="border rounded-xl p-4 bg-muted/10 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Users className="w-4 h-4" /> 4. Signatures & Authorities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border p-3 rounded-lg bg-background space-y-3">
                <p className="text-xs font-bold uppercase text-primary">Data Entry Operator</p>
                <div className="space-y-1">
                  <Label htmlFor="dataEntryOperatorName" className="text-xs">Name</Label>
                  <Input id="dataEntryOperatorName" {...form.register("dataEntryOperatorName")} className="text-xs" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dataEntryOperatorSignature" className="text-xs">Signature / Remark</Label>
                  <Input id="dataEntryOperatorSignature" {...form.register("dataEntryOperatorSignature")} className="text-xs" />
                </div>
              </div>
              <div className="border p-3 rounded-lg bg-background space-y-3">
                <p className="text-xs font-bold uppercase text-primary">Sub-Registrar</p>
                <div className="space-y-1">
                  <Label htmlFor="subRegistrarName" className="text-xs">Name</Label>
                  <Input id="subRegistrarName" {...form.register("subRegistrarName")} className="text-xs" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="subRegistrarSignature" className="text-xs">Signature / Designation</Label>
                  <Input id="subRegistrarSignature" {...form.register("subRegistrarSignature")} className="text-xs" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t">
            <Button type="button" variant="outline" asChild>
              <Link
                href={`/admindashboard/manage-digital-certificate/print/${application.id}`}
                target="_blank"
              >
                <Printer className="w-4 h-4 mr-2" /> Print Form
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
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
