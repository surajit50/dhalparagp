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
    },
  });

  useEffect(() => {
    if (application) {
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
      });
    }
  }, [application, form]);

  const subRegistrarOrder = form.watch("subRegistrarOrder");

  const onSubmit = async (values: OfficeVerificationFormData) => {
    if (!application?.id) return;
    setIsSubmitting(true);
    try {
      const res = await updateOfficeVerification(application.id, values);
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
          <div className="space-y-2 border rounded-xl p-3 bg-muted/15">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Enclosed Documents & Attached PDFs (≤ 250 KB)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg border bg-background">
                <span>Proof of Identity:</span>
                {application.docProofOfIdentityUrl ? (
                  <a
                    href={application.docProofOfIdentityUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    View PDF &rarr;
                  </a>
                ) : application.docProofOfIdentity ? (
                  <span className="text-amber-600 font-medium">Enclosed (Hardcopy)</span>
                ) : (
                  <span className="text-muted-foreground">Not enclosed</span>
                )}
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg border bg-background">
                <span>Previous Certificate:</span>
                {application.docPreviousCertificateUrl ? (
                  <a
                    href={application.docPreviousCertificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    View PDF &rarr;
                  </a>
                ) : application.docPreviousCertificate ? (
                  <span className="text-amber-600 font-medium">Enclosed (Hardcopy)</span>
                ) : (
                  <span className="text-muted-foreground">Not enclosed</span>
                )}
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg border bg-background">
                <span>General Diary (GD) Copy:</span>
                {application.docGeneralDiaryUrl ? (
                  <a
                    href={application.docGeneralDiaryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    View PDF &rarr;
                  </a>
                ) : application.docGeneralDiary ? (
                  <span className="text-amber-600 font-medium">Enclosed (Hardcopy)</span>
                ) : (
                  <span className="text-muted-foreground">Not enclosed</span>
                )}
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg border bg-background">
                <span>Registration Details:</span>
                {application.docRegistrationDetailsUrl ? (
                  <a
                    href={application.docRegistrationDetailsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    View PDF &rarr;
                  </a>
                ) : application.docRegistrationDetails ? (
                  <span className="text-amber-600 font-medium">Enclosed (Hardcopy)</span>
                ) : (
                  <span className="text-muted-foreground">Not enclosed</span>
                )}
              </div>

              {application.docOtherDocument && (
                <div className="sm:col-span-2 flex items-center justify-between p-2 rounded-lg border bg-background">
                  <span>Other: {application.docOtherDetails || "Supporting Document"}</span>
                  {application.docOtherDocumentUrl ? (
                    <a
                      href={application.docOtherDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      View PDF &rarr;
                    </a>
                  ) : (
                    <span className="text-amber-600 font-medium">Enclosed (Hardcopy)</span>
                  )}
                </div>
              )}
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
