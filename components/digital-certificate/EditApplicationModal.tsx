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
      });
    }
  }, [application]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                Edit Certificate Application Data
              </DialogTitle>
              <DialogDescription className="text-xs mt-1">
                Acknowledgement No:{" "}
                <span className="font-mono font-bold text-foreground">
                  {application.acknowledgementNo}
                </span>{" "}
                | Update applicant or event details if required.
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
                  <CheckCircle2 className="w-4 h-4" /> Save Field Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
