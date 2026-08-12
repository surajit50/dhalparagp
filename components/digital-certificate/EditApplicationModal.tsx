"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { updateDigitalCertificateApplication } from "@/action/digital-certificate";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pencil,
  CheckCircle2,
  Loader2,
  User,
  FileText,
  Building2,
  Clock,
  ShieldCheck,
  UploadCloud,
  ExternalLink,
  Trash2,
  Users,
} from "lucide-react";

interface EditApplicationModalProps {
  application: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditApplicationModal({
  application,
  isOpen,
  onClose,
  onSuccess,
}: EditApplicationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    certificateType: "BIRTH",
    status: "SUBMITTED",
    applicantName: "",
    relationshipWithPerson: "",
    fatherOrHusbandName: "",
    postalAddress: "",
    mobileNumber: "",
    personName: "",
    fatherName: "",
    motherName: "",
    deceasedFatherOrHusbandName: "",
    dateOfEvent: "",
    placeOfEvent: "",
    registrationYear: "",
    registrationNumber: "",
    purpose: "",
    declarationPlace: "",
    applicantSignatureName: "",
    // Section C & C2 Document Flags & URLs
    docProofOfIdentity: false,
    docProofOfIdentityUrl: "",
    docPreviousCertificate: false,
    docPreviousCertificateUrl: "",
    docGeneralDiary: false,
    docGeneralDiaryUrl: "",
    docRegistrationDetails: false,
    docRegistrationDetailsUrl: "",
    docOtherDocument: false,
    docOtherDetails: "",
    docOtherDocumentUrl: "",
    docFatherAadhaar: false,
    docFatherAadhaarUrl: "",
    docFatherVoter: false,
    docFatherVoterUrl: "",
    docMotherAadhaar: false,
    docMotherAadhaarUrl: "",
    docMotherVoter: false,
    docMotherVoterUrl: "",
    docChildAadhaar: false,
    docChildAadhaarUrl: "",
  });

  useEffect(() => {
    if (application) {
      setFormData({
        certificateType: application.certificateType || "BIRTH",
        status: application.status || "SUBMITTED",
        applicantName: application.applicantName || "",
        relationshipWithPerson: application.relationshipWithPerson || "",
        fatherOrHusbandName: application.fatherOrHusbandName || "",
        postalAddress: application.postalAddress || "",
        mobileNumber: application.mobileNumber || "",
        personName: application.personName || "",
        fatherName: application.fatherName || "",
        motherName: application.motherName || "",
        deceasedFatherOrHusbandName: application.deceasedFatherOrHusbandName || "",
        dateOfEvent: application.dateOfEvent
          ? format(new Date(application.dateOfEvent), "yyyy-MM-dd")
          : "",
        placeOfEvent: application.placeOfEvent || "",
        registrationYear: application.registrationYear || "",
        registrationNumber: application.registrationNumber || "",
        purpose: application.purpose || "",
        declarationPlace: application.declarationPlace || "Dhalpara",
        applicantSignatureName: application.applicantSignatureName || "",
        // Section C & C2 Document Flags & URLs
        docProofOfIdentity: Boolean(application.docProofOfIdentity),
        docProofOfIdentityUrl: application.docProofOfIdentityUrl || "",
        docPreviousCertificate: Boolean(application.docPreviousCertificate),
        docPreviousCertificateUrl: application.docPreviousCertificateUrl || "",
        docGeneralDiary: Boolean(application.docGeneralDiary),
        docGeneralDiaryUrl: application.docGeneralDiaryUrl || "",
        docRegistrationDetails: Boolean(application.docRegistrationDetails),
        docRegistrationDetailsUrl: application.docRegistrationDetailsUrl || "",
        docOtherDocument: Boolean(application.docOtherDocument),
        docOtherDetails: application.docOtherDetails || "",
        docOtherDocumentUrl: application.docOtherDocumentUrl || "",
        docFatherAadhaar: Boolean(application.docFatherAadhaar),
        docFatherAadhaarUrl: application.docFatherAadhaarUrl || "",
        docFatherVoter: Boolean(application.docFatherVoter),
        docFatherVoterUrl: application.docFatherVoterUrl || "",
        docMotherAadhaar: Boolean(application.docMotherAadhaar),
        docMotherAadhaarUrl: application.docMotherAadhaarUrl || "",
        docMotherVoter: Boolean(application.docMotherVoter),
        docMotherVoterUrl: application.docMotherVoterUrl || "",
        docChildAadhaar: Boolean(application.docChildAadhaar),
        docChildAadhaarUrl: application.docChildAadhaarUrl || "",
      });
    }
  }, [application]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handlePdfUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    urlField: string,
    checkboxField: string,
    docKey: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 250 * 1024) {
      const sizeInKb = (file.size / 1024).toFixed(1);
      toast.error(`File size (${sizeInKb} KB) exceeds the 250 KB limit.`);
      e.target.value = "";
      return;
    }

    setUploadingField(urlField);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("documentType", docKey);

      const res = await fetch("/api/digital-certificate/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();

      if (res.ok && data.success && data.url) {
        handleChange(urlField, data.url);
        handleChange(checkboxField, true);
        toast.success(`${file.name} uploaded successfully!`);
      } else {
        throw new Error(data.message || "Failed to upload file");
      }
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploadingField(null);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application?.id) return;

    if (!formData.applicantName?.trim()) {
      toast.error("Applicant name is required");
      return;
    }
    if (!formData.personName?.trim()) {
      toast.error("Person name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateDigitalCertificateApplication(application.id, formData);
      if (res.success) {
        toast.success(res.message || "Application details updated successfully!");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.message || "Failed to update application");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!application) return null;

  const isDeath = formData.certificateType === "DEATH";

  const renderDocUploadRow = (
    label: string,
    urlField: string,
    checkboxField: string,
    docKey: string
  ) => {
    const isUploading = uploadingField === urlField;
    const url = formData[urlField];
    const isChecked = formData[checkboxField];

    return (
      <div className="border rounded-xl p-3 bg-card hover:bg-muted/10 transition-all space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`edit-${checkboxField}`}
              checked={isChecked}
              onCheckedChange={(c) => handleChange(checkboxField, Boolean(c))}
            />
            <Label htmlFor={`edit-${checkboxField}`} className="text-xs font-bold cursor-pointer">
              {label}
            </Label>
          </div>
          {url ? (
            <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
              PDF Attached
            </span>
          ) : isChecked ? (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Enclosed (Hardcopy)
            </span>
          ) : null}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <input
            type="file"
            id={`file-input-${urlField}`}
            accept="application/pdf,.pdf"
            className="hidden"
            disabled={isUploading}
            onChange={(e) => handlePdfUpload(e, urlField, checkboxField, docKey)}
          />

          {url ? (
            <div className="flex flex-wrap items-center gap-2 w-full">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                asChild
                className="text-xs gap-1.5 h-8 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
              >
                <a href={url} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-3.5 h-3.5" /> View / Download PDF
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => document.getElementById(`file-input-${urlField}`)?.click()}
                className="text-xs gap-1.5 h-8 border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 hover:text-amber-900"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" /> Replace / Edit File
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleChange(urlField, "");
                  toast.info(`${label} PDF removed`);
                }}
                className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => document.getElementById(`file-input-${urlField}`)?.click()}
              className="text-xs gap-1.5 border-dashed border-gray-300 hover:border-gray-500 hover:bg-gray-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5 text-primary" /> Upload PDF (≤ 250 KB)
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                Edit Certificate Application & Attached Documents
              </DialogTitle>
              <DialogDescription className="text-xs mt-1">
                Acknowledgement No:{" "}
                <span className="font-mono font-bold text-foreground">
                  {application.acknowledgementNo}
                </span>{" "}
                | Update applicant, event details, or attached document PDFs.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Certificate Type & Status */}
          <div className="bg-muted/20 p-3.5 rounded-xl border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" /> Application Overview & Status
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-certificateType" className="text-xs font-bold">
                  Certificate Type
                </Label>
                <Select
                  value={formData.certificateType}
                  onValueChange={(val) => handleChange("certificateType", val)}
                >
                  <SelectTrigger id="edit-certificateType" className="text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BIRTH">Birth Certificate</SelectItem>
                    <SelectItem value="DEATH">Death Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-status" className="text-xs font-bold">
                  Application Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => handleChange("status", val)}
                >
                  <SelectTrigger id="edit-status" className="text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section A: Applicant's Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-1">
              <User className="w-3.5 h-3.5" /> A. Applicant's Particulars
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-applicantName" className="text-xs">
                  Applicant Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-applicantName"
                  value={formData.applicantName}
                  onChange={(e) => handleChange("applicantName", e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-mobileNumber" className="text-xs">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-mobileNumber"
                  value={formData.mobileNumber}
                  onChange={(e) => handleChange("mobileNumber", e.target.value)}
                  maxLength={10}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-fatherOrHusbandName" className="text-xs">
                  Father's / Husband's Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-fatherOrHusbandName"
                  value={formData.fatherOrHusbandName}
                  onChange={(e) => handleChange("fatherOrHusbandName", e.target.value)}
                  className="text-xs"
                />
              </div>

              {isDeath && (
                <div className="space-y-1.5">
                  <Label htmlFor="edit-relationshipWithPerson" className="text-xs">
                    Relationship with Deceased
                  </Label>
                  <Input
                    id="edit-relationshipWithPerson"
                    value={formData.relationshipWithPerson}
                    onChange={(e) => handleChange("relationshipWithPerson", e.target.value)}
                    placeholder="Son / Daughter / Wife / Legal Heir..."
                    className="text-xs"
                  />
                </div>
              )}

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="edit-postalAddress" className="text-xs">
                  Complete Postal Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="edit-postalAddress"
                  rows={2}
                  value={formData.postalAddress}
                  onChange={(e) => handleChange("postalAddress", e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section B: Particulars of Event */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5 border-b pb-1">
              <FileText className="w-3.5 h-3.5" /> B. Particulars of {isDeath ? "Death" : "Birth"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-personName" className="text-xs">
                  Name of Person / Child <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-personName"
                  value={formData.personName}
                  onChange={(e) => handleChange("personName", e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-dateOfEvent" className="text-xs">
                  Date of {isDeath ? "Death" : "Birth"} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-dateOfEvent"
                  type="date"
                  value={formData.dateOfEvent}
                  onChange={(e) => handleChange("dateOfEvent", e.target.value)}
                  className="text-xs"
                />
              </div>

              {!isDeath && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-fatherName" className="text-xs">
                      Father's Name
                    </Label>
                    <Input
                      id="edit-fatherName"
                      value={formData.fatherName}
                      onChange={(e) => handleChange("fatherName", e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-motherName" className="text-xs">
                      Mother's Name
                    </Label>
                    <Input
                      id="edit-motherName"
                      value={formData.motherName}
                      onChange={(e) => handleChange("motherName", e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </>
              )}

              {isDeath && (
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="edit-deceasedFatherOrHusbandName" className="text-xs">
                    Father's / Husband's Name of Deceased
                  </Label>
                  <Input
                    id="edit-deceasedFatherOrHusbandName"
                    value={formData.deceasedFatherOrHusbandName}
                    onChange={(e) => handleChange("deceasedFatherOrHusbandName", e.target.value)}
                    className="text-xs"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="edit-placeOfEvent" className="text-xs">
                  Place of Event <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-placeOfEvent"
                  value={formData.placeOfEvent}
                  onChange={(e) => handleChange("placeOfEvent", e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-purpose" className="text-xs">
                  Purpose for Certificate <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-purpose"
                  value={formData.purpose}
                  onChange={(e) => handleChange("purpose", e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-registrationYear" className="text-xs">
                  Registration Year <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-registrationYear"
                  value={formData.registrationYear}
                  onChange={(e) => handleChange("registrationYear", e.target.value)}
                  maxLength={4}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-registrationNumber" className="text-xs">
                  Registration Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) => handleChange("registrationNumber", e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section C: Enclosed Documents Upload/View */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5 border-b pb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> C. Enclosed Application Documents (PDF ≤ 250 KB)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderDocUploadRow("Proof of Applicant Identity", "docProofOfIdentityUrl", "docProofOfIdentity", "proofOfIdentity")}
              {renderDocUploadRow("Previous Birth / Death Certificate", "docPreviousCertificateUrl", "docPreviousCertificate", "previousCertificate")}
              {renderDocUploadRow("General Diary (GD) Copy", "docGeneralDiaryUrl", "docGeneralDiary", "generalDiary")}
              {renderDocUploadRow("Registration Details", "docRegistrationDetailsUrl", "docRegistrationDetails", "registrationDetails")}
              {renderDocUploadRow("Other Supporting Document", "docOtherDocumentUrl", "docOtherDocument", "otherDocument")}
            </div>
          </div>

          {/* Section C2: Family Identity Verification Documents Upload/View */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-green-700 flex items-center gap-1.5 border-b pb-1">
              <Users className="w-3.5 h-3.5 text-green-600" /> C2. Verification Identity Documents (Family Aadhaar & Voter IDs)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderDocUploadRow("Father's Aadhaar", "docFatherAadhaarUrl", "docFatherAadhaar", "fatherAadhaar")}
              {renderDocUploadRow("Father's Voter ID", "docFatherVoterUrl", "docFatherVoter", "fatherVoter")}
              {renderDocUploadRow("Mother's Aadhaar", "docMotherAadhaarUrl", "docMotherAadhaar", "motherAadhaar")}
              {renderDocUploadRow("Mother's Voter ID", "docMotherVoterUrl", "docMotherVoter", "motherVoter")}
              {!isDeath && renderDocUploadRow("Child's Aadhaar", "docChildAadhaarUrl", "docChildAadhaar", "childAadhaar")}
            </div>
          </div>

          {/* Section D: Declaration Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b pb-1">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" /> Declaration Particulars
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-declarationPlace" className="text-xs">
                  Place of Application
                </Label>
                <Input
                  id="edit-declarationPlace"
                  value={formData.declarationPlace}
                  onChange={(e) => handleChange("declarationPlace", e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-applicantSignatureName" className="text-xs">
                  Applicant Signature Name
                </Label>
                <Input
                  id="edit-applicantSignatureName"
                  value={formData.applicantSignatureName}
                  onChange={(e) => handleChange("applicantSignatureName", e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Save All Changes & Documents
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
