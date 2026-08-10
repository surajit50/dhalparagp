"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  digitalCertificateApplicationSchema,
  type DigitalCertificateApplicationFormData,
} from "@/schema/digital-certificate";
import { createDigitalCertificateApplication } from "@/action/digital-certificate";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Baby,
  HeartCrack,
  CheckCircle2,
  Printer,
  Loader2,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  UploadCloud,
  FileCheck,
  ExternalLink,
  Trash2,
  AlertCircle,
  Users,
  Wallet,
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
  Phone,
  MapPin,
  Calendar,
  Hash,
  FileSignature,
} from "lucide-react";
import Link from "next/link";
import DigitalCertificatePrintTemplate from "./DigitalCertificatePrintTemplate";
import { printDocumentById } from "@/lib/print-certificate";

const MAX_PDF_SIZE_BYTES = 250 * 1024; // 250 KB

interface DigitalCertificateFormProps {
  isAdmin?: boolean;
  onSuccessRedirectUrl?: string;
}

interface UploadState {
  isUploading: boolean;
  fileName?: string;
  fileSize?: string;
  url?: string;
  publicId?: string;
  error?: string;
}

type StepKey = "applicant" | "event" | "documents" | "declaration";

const STEP_ORDER: StepKey[] = ["applicant", "event", "documents", "declaration"];
const STEP_LABELS: Record<StepKey, string> = {
  applicant: "Applicant",
  event: "Event Details",
  documents: "Documents",
  declaration: "Declaration",
};

export default function DigitalCertificateForm({
  isAdmin = false,
  onSuccessRedirectUrl = "/dashboard/digital-certificate/status",
}: DigitalCertificateFormProps) {
  const [currentStep, setCurrentStep] = useState<StepKey>("applicant");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

  // Upload States for Section C PDF files (under 250 KB)
  const [uploads, setUploads] = useState<Record<string, UploadState>>({
    proofOfIdentity: { isUploading: false },
    previousCertificate: { isUploading: false },
    generalDiary: { isUploading: false },
    registrationDetails: { isUploading: false },
    otherDocument: { isUploading: false },
    fatherAadhaar: { isUploading: false },
    fatherVoter: { isUploading: false },
    motherAadhaar: { isUploading: false },
    motherVoter: { isUploading: false },
    childAadhaar: { isUploading: false },
  });

  const form = useForm<DigitalCertificateApplicationFormData>({
    resolver: zodResolver(digitalCertificateApplicationSchema),
    defaultValues: {
      certificateType: "BIRTH",
      applicantName: "",
      relationshipWithPerson: "",
      fatherOrHusbandName: "",
      postalAddress:
        "Vill- , P.O.- , P.S.- Hili, Dist.- Dakshin Dinajpur, PIN- 733126",
      mobileNumber: "",
      personName: "",
      fatherName: "",
      motherName: "",
      deceasedFatherOrHusbandName: "",
      dateOfEvent: new Date(),
      placeOfEvent: "No. 3 Dhalpara Gram Panchayat",
      registrationYear: new Date().getFullYear().toString(),
      registrationNumber: "",
      purpose: "Official / Educational Verification",
      docProofOfIdentity: true,
      docProofOfIdentityUrl: "",
      docProofOfIdentityPublicId: "",
      docPreviousCertificate: false,
      docPreviousCertificateUrl: "",
      docPreviousCertificatePublicId: "",
      docGeneralDiary: false,
      docGeneralDiaryUrl: "",
      docGeneralDiaryPublicId: "",
      docRegistrationDetails: false,
      docRegistrationDetailsUrl: "",
      docRegistrationDetailsPublicId: "",
      docOtherDocument: false,
      docOtherDetails: "",
      docOtherDocumentUrl: "",
      docOtherDocumentPublicId: "",
      docFatherAadhaar: false,
      docFatherAadhaarUrl: "",
      docFatherAadhaarPublicId: "",
      docFatherVoter: false,
      docFatherVoterUrl: "",
      docFatherVoterPublicId: "",
      docMotherAadhaar: false,
      docMotherAadhaarUrl: "",
      docMotherAadhaarPublicId: "",
      docMotherVoter: false,
      docMotherVoterUrl: "",
      docMotherVoterPublicId: "",
      docChildAadhaar: false,
      docChildAadhaarUrl: "",
      docChildAadhaarPublicId: "",
      declarationPlace: "Dhalpara",
      declarationDate: new Date(),
      applicantSignatureName: "",
      declarationAgreed: true,
    },
  });

  const certificateType = form.watch("certificateType");
  const isBirth = certificateType === "BIRTH";
  const isDeath = certificateType === "DEATH";
  const docOtherDocument = form.watch("docOtherDocument");

  // Handle PDF upload to Cloudinary under 250 KB
  const handlePdfUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docKey:
      | "proofOfIdentity"
      | "previousCertificate"
      | "generalDiary"
      | "registrationDetails"
      | "otherDocument"
      | "fatherAadhaar"
      | "fatherVoter"
      | "motherAadhaar"
      | "motherVoter"
      | "childAadhaar",
    urlField:
      | "docProofOfIdentityUrl"
      | "docPreviousCertificateUrl"
      | "docGeneralDiaryUrl"
      | "docRegistrationDetailsUrl"
      | "docOtherDocumentUrl"
      | "docFatherAadhaarUrl"
      | "docFatherVoterUrl"
      | "docMotherAadhaarUrl"
      | "docMotherVoterUrl"
      | "docChildAadhaarUrl",
    publicIdField:
      | "docProofOfIdentityPublicId"
      | "docPreviousCertificatePublicId"
      | "docGeneralDiaryPublicId"
      | "docRegistrationDetailsPublicId"
      | "docOtherDocumentPublicId"
      | "docFatherAadhaarPublicId"
      | "docFatherVoterPublicId"
      | "docMotherAadhaarPublicId"
      | "docMotherVoterPublicId"
      | "docChildAadhaarPublicId",
    checkboxField:
      | "docProofOfIdentity"
      | "docPreviousCertificate"
      | "docGeneralDiary"
      | "docRegistrationDetails"
      | "docOtherDocument"
      | "docFatherAadhaar"
      | "docFatherVoter"
      | "docMotherAadhaar"
      | "docMotherVoter"
      | "docChildAadhaar"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Invalid file format. Only PDF files are allowed.");
      setUploads((prev) => ({
        ...prev,
        [docKey]: { ...prev[docKey], error: "Only PDF files are allowed" },
      }));
      e.target.value = "";
      return;
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      const sizeInKb = (file.size / 1024).toFixed(1);
      toast.error(
        `File size (${sizeInKb} KB) exceeds the 250 KB limit. Please upload a compressed PDF under 250 KB.`
      );
      setUploads((prev) => ({
        ...prev,
        [docKey]: {
          ...prev[docKey],
          error: `File size is ${sizeInKb} KB (Max allowed is 250 KB)`,
        },
      }));
      e.target.value = "";
      return;
    }

    setUploads((prev) => ({
      ...prev,
      [docKey]: {
        isUploading: true,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        error: undefined,
      },
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", docKey);

      const res = await fetch("/api/digital-certificate/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success && data.url) {
        form.setValue(urlField, data.url);
        form.setValue(publicIdField, data.public_id);
        form.setValue(checkboxField, true);

        setUploads((prev) => ({
          ...prev,
          [docKey]: {
            isUploading: false,
            fileName: file.name,
            fileSize: `${(file.size / 1024).toFixed(1)} KB`,
            url: data.url,
            publicId: data.public_id,
            error: undefined,
          },
        }));

        toast.success(`${file.name} uploaded successfully to Cloudinary!`);
      } else {
        throw new Error(data.message || "Failed to upload file");
      }
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
      setUploads((prev) => ({
        ...prev,
        [docKey]: {
          isUploading: false,
          error: err?.message || "Upload failed",
        },
      }));
    } finally {
      e.target.value = "";
    }
  };

  const removeUploadedPdf = (
    docKey: string,
    urlField: any,
    publicIdField: any,
    checkboxField: any
  ) => {
    form.setValue(urlField, "");
    form.setValue(publicIdField, "");
    setUploads((prev) => ({
      ...prev,
      [docKey]: { isUploading: false, url: undefined, publicId: undefined, fileName: undefined, error: undefined },
    }));
    toast.info("Document removed");
  };

  // Helper component for document upload sections
  const DocumentUploadField = ({
    docKey,
    urlField,
    publicIdField,
    checkboxField,
    label,
    color = "gray",
  }: {
    docKey: string;
    urlField: any;
    publicIdField: any;
    checkboxField: any;
    label: string;
    color?: string;
  }) => {
    const colorClasses: Record<
      string,
      { border: string; bg: string; text: string; hover: string }
    > = {
      blue: {
        border: "border-dashed border-blue-300",
        bg: "hover:bg-blue-50",
        text: "text-blue-600",
        hover: "hover:border-blue-500",
      },
      green: {
        border: "border-dashed border-green-300",
        bg: "hover:bg-green-50",
        text: "text-green-600",
        hover: "hover:border-green-500",
      },
      purple: {
        border: "border-dashed border-purple-300",
        bg: "hover:bg-purple-50",
        text: "text-purple-600",
        hover: "hover:border-purple-500",
      },
      gray: {
        border: "border-dashed border-gray-300",
        bg: "hover:bg-gray-50",
        text: "text-primary",
        hover: "hover:border-gray-500",
      },
    };

    const colors = colorClasses[color] || colorClasses.gray;
    const uploadState = uploads[docKey as keyof typeof uploads];
    const isUploaded = !!uploadState?.url;
    const isLoading = uploadState?.isUploading || false;
    const error = uploadState?.error;
    const fileSize = uploadState?.fileSize;

    return (
      <div className="border rounded-xl p-3.5 bg-card hover:bg-muted/10 transition-all space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={checkboxField}
              checked={form.watch(checkboxField)}
              onCheckedChange={(c) => form.setValue(checkboxField, Boolean(c))}
            />
            <Label htmlFor={checkboxField} className="text-xs font-bold cursor-pointer">
              {label}
            </Label>
          </div>
          {isUploaded && (
            <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 flex items-center gap-1">
              <FileCheck className="w-3 h-3 text-green-600" /> Uploaded ({fileSize})
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <input
            type="file"
            id={`file-${docKey}`}
            accept="application/pdf,.pdf"
            className="hidden"
            disabled={isLoading}
            onChange={(e) =>
              handlePdfUpload(
                e,
                docKey as any,
                urlField,
                publicIdField,
                checkboxField
              )
            }
          />

          {!isUploaded ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => document.getElementById(`file-${docKey}`)?.click()}
              className={`text-xs gap-1.5 ${colors.border} ${colors.hover} ${colors.bg}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className={`w-3.5 h-3.5 animate-spin ${colors.text}`} /> Uploading PDF...
                </>
              ) : (
                <>
                  <UploadCloud className={`w-3.5 h-3.5 ${colors.text}`} /> Upload PDF (≤ 250 KB)
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                asChild
                className="text-xs gap-1.5 h-8 bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <a href={uploadState.url || "#"} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-3.5 h-3.5" /> View PDF
                </a>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  removeUploadedPdf(
                    docKey,
                    urlField,
                    publicIdField,
                    checkboxField
                  )
                }
                className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {error}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Step navigation
  const currentStepIndex = STEP_ORDER.indexOf(currentStep);
  const totalSteps = STEP_ORDER.length;

  const goToNextStep = async () => {
    // Validate fields on current step before proceeding
    let fieldsToValidate: (keyof DigitalCertificateApplicationFormData)[] = [];
    switch (currentStep) {
      case "applicant":
        fieldsToValidate = [
          "applicantName",
          "fatherOrHusbandName",
          "mobileNumber",
          "postalAddress",
        ];
        if (isDeath) fieldsToValidate.push("relationshipWithPerson");
        break;
      case "event":
        fieldsToValidate = [
          "personName",
          "dateOfEvent",
          "placeOfEvent",
          "registrationYear",
          "registrationNumber",
          "purpose",
        ];
        break;
      case "documents":
        // No mandatory fields in documents (optional uploads), but we might check if any required? The schema doesn't require any doc upload. So skip.
        break;
      case "declaration":
        fieldsToValidate = ["declarationAgreed"];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate as any);
    if (!isValid) return;

    if (currentStepIndex < totalSteps - 1) {
      setCurrentStep(STEP_ORDER[currentStepIndex + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEP_ORDER[currentStepIndex - 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (values: DigitalCertificateApplicationFormData) => {
    setIsSubmitting(true);
    try {
      const res = await createDigitalCertificateApplication(values);
      if (res.success && res.data) {
        toast.success(res.message || "Application submitted successfully!");
        setSubmittedData(res.data);
        setIsPrintDialogOpen(true);
      } else {
        toast.error(res.message || "Failed to submit application");
        if (res.errors) {
          Object.entries(res.errors).forEach(([field, msg]: [string, any]) => {
            form.setError(field as any, { message: typeof msg === "string" ? msg : msg?.message });
          });
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "applicant":
        return (
          <Card className="shadow-sm border-t-4 border-t-primary">
            <CardHeader className="bg-muted/20 border-b pb-3">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" /> A. Applicant's Details
              </CardTitle>
              <CardDescription className="text-xs">
                Particulars of the person submitting this application.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="applicantName">
                  Name of Applicant <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="applicantName"
                  placeholder="Full name of applicant"
                  {...form.register("applicantName")}
                />
                {form.formState.errors.applicantName && (
                  <p className="text-xs text-red-500">{form.formState.errors.applicantName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mobileNumber">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mobileNumber"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  {...form.register("mobileNumber")}
                />
                {form.formState.errors.mobileNumber && (
                  <p className="text-xs text-red-500">{form.formState.errors.mobileNumber.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fatherOrHusbandName">
                  Father's / Husband's Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fatherOrHusbandName"
                  placeholder="Father's or Husband's name"
                  {...form.register("fatherOrHusbandName")}
                />
                {form.formState.errors.fatherOrHusbandName && (
                  <p className="text-xs text-red-500">{form.formState.errors.fatherOrHusbandName.message}</p>
                )}
              </div>

              {isDeath ? (
                <div className="space-y-1.5">
                  <Label htmlFor="relationshipWithPerson">
                    Relationship with the Deceased <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={form.watch("relationshipWithPerson") || ""}
                    onValueChange={(val) => form.setValue("relationshipWithPerson", val)}
                  >
                    <SelectTrigger id="relationshipWithPerson">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Son">Son</SelectItem>
                      <SelectItem value="Daughter">Daughter</SelectItem>
                      <SelectItem value="Wife">Wife</SelectItem>
                      <SelectItem value="Husband">Husband</SelectItem>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Brother">Brother</SelectItem>
                      <SelectItem value="Sister">Sister</SelectItem>
                      <SelectItem value="Legal Heir">Legal Heir</SelectItem>
                      <SelectItem value="Other Relative">Other Relative</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.relationshipWithPerson && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.relationshipWithPerson.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5 opacity-60">
                  <Label htmlFor="rel-disabled">Relationship with Person</Label>
                  <Input id="rel-disabled" disabled value="Not applicable for Birth Certificate" />
                </div>
              )}

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="postalAddress">
                  Complete Postal Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="postalAddress"
                  rows={2}
                  placeholder="Village, Post Office, Police Station, District, Pin Code"
                  {...form.register("postalAddress")}
                />
                {form.formState.errors.postalAddress && (
                  <p className="text-xs text-red-500">{form.formState.errors.postalAddress.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case "event":
        return (
          <Card className="shadow-sm border-t-4 border-t-blue-500">
            <CardHeader className="bg-muted/20 border-b pb-3">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" /> B. Particulars of {isBirth ? "Birth" : "Death"}
              </CardTitle>
              <CardDescription className="text-xs">
                Information regarding the registered {isBirth ? "birth" : "death"} event.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="personName">
                  Name of the Person <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="personName"
                  placeholder={`Name of the ${isBirth ? "child / person" : "deceased person"}`}
                  {...form.register("personName")}
                />
                {form.formState.errors.personName && (
                  <p className="text-xs text-red-500">{form.formState.errors.personName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dateOfEvent">
                  Date of {isBirth ? "Birth" : "Death"} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dateOfEvent"
                  type="date"
                  value={
                    form.watch("dateOfEvent")
                      ? format(new Date(form.watch("dateOfEvent")), "yyyy-MM-dd")
                      : ""
                  }
                  onChange={(e) => {
                    if (e.target.value) form.setValue("dateOfEvent", new Date(e.target.value));
                  }}
                />
                {form.formState.errors.dateOfEvent && (
                  <p className="text-xs text-red-500">{form.formState.errors.dateOfEvent.message}</p>
                )}
              </div>

              {isBirth && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="fatherName">Father's Name (For Birth)</Label>
                    <Input
                      id="fatherName"
                      placeholder="Father's full name"
                      {...form.register("fatherName")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="motherName">Mother's Name (For Birth)</Label>
                    <Input
                      id="motherName"
                      placeholder="Mother's full name"
                      {...form.register("motherName")}
                    />
                  </div>
                </>
              )}

              {isDeath && (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="deceasedFatherOrHusbandName">
                    Father's / Husband's Name (For Death)
                  </Label>
                  <Input
                    id="deceasedFatherOrHusbandName"
                    placeholder="Father's or Husband's name of deceased"
                    {...form.register("deceasedFatherOrHusbandName")}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="placeOfEvent">
                  Place of {isBirth ? "Birth" : "Death"} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="placeOfEvent"
                  placeholder="Hospital / Village / Home address"
                  {...form.register("placeOfEvent")}
                />
                {form.formState.errors.placeOfEvent && (
                  <p className="text-xs text-red-500">{form.formState.errors.placeOfEvent.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="registrationYear">
                  Registration Year <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="registrationYear"
                  placeholder="e.g., 2024"
                  maxLength={4}
                  {...form.register("registrationYear")}
                />
                {form.formState.errors.registrationYear && (
                  <p className="text-xs text-red-500">{form.formState.errors.registrationYear.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="registrationNumber">
                  Registration Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="registrationNumber"
                  placeholder="e.g., 123/2024 or Old Reg No."
                  {...form.register("registrationNumber")}
                />
                {form.formState.errors.registrationNumber && (
                  <p className="text-xs text-red-500">{form.formState.errors.registrationNumber.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="purpose">
                  Purpose for Obtaining Certificate <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="purpose"
                  placeholder="e.g., School Admission, Passport, Legal Heir, Bank"
                  {...form.register("purpose")}
                />
                {form.formState.errors.purpose && (
                  <p className="text-xs text-red-500">{form.formState.errors.purpose.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case "documents":
        return (
          <div className="space-y-4">
            {/* Section C: Documents Enclosed */}
            <Card className="shadow-sm border-t-4 border-t-blue-500">
              <CardHeader className="bg-blue-50/40 border-b pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" /> C. Documents Enclosed (Upload PDF ≤ 250 KB)
                  </CardTitle>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1 w-fit">
                    <UploadCloud className="w-3.5 h-3.5" /> PDF file under 250 KB in Cloudinary
                  </span>
                </div>
                <CardDescription className="text-xs">
                  Tick the applicable documents and upload the supporting PDF file (Maximum 250 KB per document).
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <DocumentUploadField
                    docKey="proofOfIdentity"
                    urlField="docProofOfIdentityUrl"
                    publicIdField="docProofOfIdentityPublicId"
                    checkboxField="docProofOfIdentity"
                    label="Proof of applicant Identity (Aadhaar / Voter ID / PAN / Passport)"
                    color="blue"
                  />
                  <DocumentUploadField
                    docKey="previousCertificate"
                    urlField="docPreviousCertificateUrl"
                    publicIdField="docPreviousCertificatePublicId"
                    checkboxField="docPreviousCertificate"
                    label="Previous Birth / Death Certificate (If Available)"
                    color="gray"
                  />
                  <DocumentUploadField
                    docKey="generalDiary"
                    urlField="docGeneralDiaryUrl"
                    publicIdField="docGeneralDiaryPublicId"
                    checkboxField="docGeneralDiary"
                    label="General Diary (GD) Copy (If Applicable)"
                    color="gray"
                  />
                  <DocumentUploadField
                    docKey="registrationDetails"
                    urlField="docRegistrationDetailsUrl"
                    publicIdField="docRegistrationDetailsPublicId"
                    checkboxField="docRegistrationDetails"
                    label="Registration Details (If Available)"
                    color="gray"
                  />
                  <div className="border rounded-xl p-3.5 bg-card hover:bg-muted/10 transition-all space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="docOtherDocument"
                          checked={docOtherDocument}
                          onCheckedChange={(c) => form.setValue("docOtherDocument", Boolean(c))}
                        />
                        <Label htmlFor="docOtherDocument" className="text-xs font-bold cursor-pointer">
                          Any Other Supporting Document
                        </Label>
                      </div>
                      {uploads.otherDocument.url && (
                        <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 flex items-center gap-1">
                          <FileCheck className="w-3 h-3 text-green-600" /> Uploaded ({uploads.otherDocument.fileSize})
                        </span>
                      )}
                    </div>

                    {docOtherDocument && (
                      <Input
                        placeholder="Specify other supporting document details..."
                        className="text-xs"
                        {...form.register("docOtherDetails")}
                      />
                    )}

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                      <input
                        type="file"
                        id="file-otherDocument"
                        accept="application/pdf,.pdf"
                        className="hidden"
                        disabled={uploads.otherDocument.isUploading}
                        onChange={(e) =>
                          handlePdfUpload(
                            e,
                            "otherDocument",
                            "docOtherDocumentUrl",
                            "docOtherDocumentPublicId",
                            "docOtherDocument"
                          )
                        }
                      />

                      {!uploads.otherDocument.url ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploads.otherDocument.isUploading}
                          onClick={() => document.getElementById("file-otherDocument")?.click()}
                          className="text-xs gap-1.5 border-dashed border-gray-300 hover:border-gray-500 hover:bg-gray-50"
                        >
                          {uploads.otherDocument.isUploading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Uploading PDF...
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-3.5 h-3.5 text-primary" /> Upload Supporting PDF (≤ 250 KB)
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            asChild
                            className="text-xs gap-1.5 h-8 bg-blue-50 text-blue-700 hover:bg-blue-100"
                          >
                            <a href={uploads.otherDocument.url} target="_blank" rel="noreferrer">
                              <ExternalLink className="w-3.5 h-3.5" /> View PDF
                            </a>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeUploadedPdf(
                                "otherDocument",
                                "docOtherDocumentUrl",
                                "docOtherDocumentPublicId",
                                "docOtherDocument"
                              )
                            }
                            className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}

                      {uploads.otherDocument.error && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {uploads.otherDocument.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section C-2: Identity Documents for Verification */}
            <Card className="shadow-sm border-t-4 border-t-green-500">
              <CardHeader className="bg-green-50/40 border-b pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" /> C2. Identity Documents for Verification (Optional)
                  </CardTitle>
                  <span className="text-xs font-semibold text-green-700 bg-green-100/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1 w-fit">
                    <Wallet className="w-3.5 h-3.5" /> Aadhaar & Voter ID
                  </span>
                </div>
                <CardDescription className="text-xs">
                  Upload identity proof documents of family members for faster verification. All documents must be PDF under 250 KB.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <DocumentUploadField
                    docKey="fatherAadhaar"
                    urlField="docFatherAadhaarUrl"
                    publicIdField="docFatherAadhaarPublicId"
                    checkboxField="docFatherAadhaar"
                    label="Father's Aadhaar (If Available)"
                    color="green"
                  />
                  <DocumentUploadField
                    docKey="fatherVoter"
                    urlField="docFatherVoterUrl"
                    publicIdField="docFatherVoterPublicId"
                    checkboxField="docFatherVoter"
                    label="Father's Voter ID (If Available)"
                    color="green"
                  />
                  <DocumentUploadField
                    docKey="motherAadhaar"
                    urlField="docMotherAadhaarUrl"
                    publicIdField="docMotherAadhaarPublicId"
                    checkboxField="docMotherAadhaar"
                    label="Mother's Aadhaar (If Available)"
                    color="purple"
                  />
                  <DocumentUploadField
                    docKey="motherVoter"
                    urlField="docMotherVoterUrl"
                    publicIdField="docMotherVoterPublicId"
                    checkboxField="docMotherVoter"
                    label="Mother's Voter ID (If Available)"
                    color="purple"
                  />
                  {isBirth && (
                    <DocumentUploadField
                      docKey="childAadhaar"
                      urlField="docChildAadhaarUrl"
                      publicIdField="docChildAadhaarPublicId"
                      checkboxField="docChildAadhaar"
                      label="Child's Aadhaar (If Available)"
                      color="blue"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "declaration":
        return (
          <Card className="shadow-sm border-t-4 border-t-primary">
            <CardHeader className="bg-muted/20 border-b pb-3">
              <CardTitle className="text-base font-bold text-foreground">D. Declaration</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg text-xs leading-relaxed text-muted-foreground border">
                <p className="mb-2 font-medium text-foreground">
                  I hereby declare that the information furnished above is true and correct to the best of my knowledge and belief. I understand that if any information is found to be false or incorrect, my application may be rejected and I may face legal consequences.
                </p>
                <p>
                  I therefore request the Sub-Registrar of Births & Deaths, No. 3 Dhalpara Gram Panchayat, to kindly verify the records maintained in your office and issue the Digital Birth / Death Certificate as per my application.
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="declarationAgreed"
                  checked={form.watch("declarationAgreed")}
                  onCheckedChange={(c) => form.setValue("declarationAgreed", Boolean(c))}
                />
                <Label htmlFor="declarationAgreed" className="text-xs font-semibold cursor-pointer">
                  I agree to the declaration and certify that all details provided are true <span className="text-red-500">*</span>
                </Label>
              </div>
              {form.formState.errors.declarationAgreed && (
                <p className="text-xs text-red-500">{form.formState.errors.declarationAgreed.message}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="declarationPlace" className="text-xs">Place of Application</Label>
                  <Input
                    id="declarationPlace"
                    defaultValue="Dhalpara"
                    {...form.register("declarationPlace")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="applicantSignatureName" className="text-xs">Applicant Signature Name</Label>
                  <Input
                    id="applicantSignatureName"
                    placeholder="Full name for signature"
                    {...form.register("applicantSignatureName")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  // Compute progress
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 pb-32">
      {/* Header */}
      <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-xl">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">Digital Certificate Application</h1>
            <p className="text-xs text-muted-foreground">
              No. 3 Dhalpara Gram Panchayat • Sub-Registrar, Births & Deaths
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs bg-white/70 px-3 py-1.5 rounded-full border shadow-sm">
          <span className="font-medium">Step {currentStepIndex + 1} of {totalSteps}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          <span className="text-muted-foreground">{STEP_LABELS[currentStep]}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-primary h-2.5 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stepper Labels */}
      <div className="flex justify-between text-xs font-medium text-muted-foreground px-1">
        {STEP_ORDER.map((step, idx) => (
          <div
            key={step}
            className={`flex items-center gap-1.5 ${
              idx <= currentStepIndex ? "text-primary" : "text-muted-foreground/50"
            }`}
          >
            <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${
              idx < currentStepIndex
                ? "bg-primary text-white"
                : idx === currentStepIndex
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-muted text-muted-foreground"
            }`}>
              {idx < currentStepIndex ? <Check className="w-3 h-3" /> : idx + 1}
            </span>
            <span className="hidden sm:inline">{STEP_LABELS[step]}</span>
          </div>
        ))}
      </div>

      {/* Certificate Type Selector (shown on all steps) */}
      <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Select Certificate Type
          </CardTitle>
          <CardDescription>
            Choose whether you are applying for a Digital Birth Certificate or Digital Death Certificate.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <RadioGroup
            value={certificateType}
            onValueChange={(val: "BIRTH" | "DEATH") => form.setValue("certificateType", val)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem value="BIRTH" id="type-birth" className="peer sr-only" />
              <Label
                htmlFor="type-birth"
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isBirth
                    ? "border-blue-600 bg-blue-50/70 text-blue-950 shadow-sm"
                    : "border-border hover:border-gray-300 hover:bg-muted/30"
                }`}
              >
                <div className={`p-2.5 rounded-lg ${isBirth ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"}`}>
                  <Baby className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-base">Birth Certificate</p>
                  <p className="text-xs text-muted-foreground">Digital copy for registered births</p>
                </div>
              </Label>
            </div>

            <div>
              <RadioGroupItem value="DEATH" id="type-death" className="peer sr-only" />
              <Label
                htmlFor="type-death"
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isDeath
                    ? "border-amber-600 bg-amber-50/70 text-amber-950 shadow-sm"
                    : "border-border hover:border-gray-300 hover:bg-muted/30"
                }`}
              >
                <div className={`p-2.5 rounded-lg ${isDeath ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground"}`}>
                  <HeartCrack className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-base">Death Certificate</p>
                  <p className="text-xs text-muted-foreground">Digital copy for registered deaths</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Step Content */}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {renderStepContent()}
      </form>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t shadow-lg p-4 z-50">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium">Step {currentStepIndex + 1} of {totalSteps}</span>
            <span className="w-px h-4 bg-border" />
            <span>{STEP_LABELS[currentStep]}</span>
            <span className="w-px h-4 bg-border" />
            <span>{Math.round(progress)}% complete</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={goToPrevStep}
              disabled={currentStepIndex === 0 || isSubmitting}
              className="gap-1.5 flex-1 sm:flex-initial"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>

            {currentStepIndex === totalSteps - 1 ? (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 flex-1 sm:flex-initial bg-primary hover:bg-primary/90 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Submit Application
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={goToNextStep}
                disabled={isSubmitting}
                className="gap-1.5 flex-1 sm:flex-initial bg-primary hover:bg-primary/90 text-white"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Post-Submission Success & Print Dialog */}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700 text-xl">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              Application Submitted Successfully!
            </DialogTitle>
            <DialogDescription>
              Your application has been registered. You can print the official application form now or check its status later.
            </DialogDescription>
          </DialogHeader>

          {submittedData && (
            <div className="space-y-6 pt-2">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-xs text-green-700 font-semibold uppercase tracking-wider">
                    Acknowledgement Number
                  </p>
                  <p className="text-2xl font-mono font-bold text-green-950">
                    {submittedData.acknowledgementNo}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Submitted on {format(new Date(submittedData.createdAt || new Date()), "dd MMMM yyyy, hh:mm a")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    onClick={() =>
                      printDocumentById(
                        "digital-certificate-printable",
                        `Application_Digital_Certificate_${submittedData.acknowledgementNo}`
                      )
                    }
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    <Printer className="w-4 h-4" /> Print Application
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                  >
                    <Link
                      href={
                        isAdmin
                          ? `/admindashboard/manage-digital-certificate/print/${submittedData.id}`
                          : `/dashboard/digital-certificate/print/${submittedData.id}`
                      }
                      target="_blank"
                    >
                      <ExternalLink className="w-4 h-4 mr-1.5" /> Full Page View
                    </Link>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link href={onSuccessRedirectUrl}>
                      View Status <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Printable Template Preview */}
              <div className="border rounded-lg p-2 bg-gray-50 overflow-x-auto">
                <DigitalCertificatePrintTemplate
                  data={submittedData}
                  showPrintButton={false}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
