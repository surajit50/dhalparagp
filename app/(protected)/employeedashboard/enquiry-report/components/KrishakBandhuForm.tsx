"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

type HeirRow = {
  name: string;
  relation: string;
  address: string;
  remarks: string;
};

type FormState = {
  applicationId: string;
  userId: string;
  deceasedName: string;
  fatherOrHusbandName: string;
  village: string;
  postOffice: string;
  policeStation: string;
  block: string;
  district: string;
  dateOfDeath: string;
  heirs: HeirRow[];
  docs: {
    deathCertificate: boolean;
    identityProof: boolean;
    landRecordNo: string;
    otherDocuments: string;
  };
  findings: {
    verifiedDetails: boolean;
    applicantsGenuine: boolean;
    noObjection: boolean;
    recommendation: "Eligible" | "Not Eligible";
    notEligibleReason: string;
    notes: string;
  };
  certification: {
    date: string;
    place: string;
    officerName: string;
  };
};

export function KrishakBandhuForm() {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    applicationId: "",
    userId: "",
    deceasedName: "",
    fatherOrHusbandName: "",
    village: "",
    postOffice: "",
    policeStation: "",
    block: "",
    district: "",
    dateOfDeath: "",
    heirs: [
      { name: "", relation: "", address: "", remarks: "" },
    ],
    docs: {
      deathCertificate: true,
      identityProof: true,
      landRecordNo: "",
      otherDocuments: "",
    },
    findings: {
      verifiedDetails: true,
      applicantsGenuine: true,
      noObjection: true,
      recommendation: "Eligible",
      notEligibleReason: "",
      notes: "",
    },
    certification: {
      date: "",
      place: "",
      officerName: "",
    },
  });

  const handleRootChange = (key: keyof FormState, value: unknown) => {
    setFormData((prev: FormState) => ({ ...prev, [key]: value as any }));
  };

  const updateDocs = (key: keyof FormState["docs"], value: unknown) => {
    setFormData((prev: FormState) => ({ ...prev, docs: { ...prev.docs, [key]: value as any } }));
  };

  const updateFindings = (key: keyof FormState["findings"], value: unknown) => {
    setFormData((prev: FormState) => ({ ...prev, findings: { ...prev.findings, [key]: value as any } }));
  };

  const updateCertification = (key: keyof FormState["certification"], value: unknown) => {
    setFormData((prev: FormState) => ({ ...prev, certification: { ...prev.certification, [key]: value as any } }));
  };

  const addHeir = () => {
    setFormData((prev: FormState) => {
      if (prev.heirs.length >= 5) return prev; // limit to 5 as per template
      return { ...prev, heirs: [...prev.heirs, { name: "", relation: "", address: "", remarks: "" }] };
    });
  };

  const removeHeir = (index: number) => {
    setFormData((prev: FormState) => ({ ...prev, heirs: prev.heirs.filter((_: HeirRow, i: number) => i !== index) }));
  };

  const updateHeir = (index: number, key: keyof HeirRow, value: string) => {
    setFormData((prev: FormState) => ({
      ...prev,
      heirs: prev.heirs.map((row: HeirRow, i: number) => (i === index ? { ...row, [key]: value } : row)),
    }));
  };

  const buildReportText = (): string => {
    const lines: string[] = [];
    lines.push("Krishak Bandhu (Death Benefit) Scheme");
    lines.push("");
    lines.push("1. Details of the Deceased Farmer");
    lines.push(`Name of the Deceased Farmer: ${formData.deceasedName || ""}`);
    lines.push(`Father’s / Husband’s Name: ${formData.fatherOrHusbandName || ""}`);
    lines.push("Full Address:");
    lines.push(
      `Village: ${formData.village || ""}, P.O: ${formData.postOffice || ""}, P.S: ${formData.policeStation || ""}`
    );
    lines.push(`Block: ${formData.block || ""}, District: ${formData.district || ""}`);
    lines.push(`Date of Death (as per certificate): ${formData.dateOfDeath || ""}`);
    lines.push("");
    lines.push("2. Details of the Applicant(s) / Legal Heirs");
    lines.push("Sl. No.\tName of Applicant\tRelation with Deceased\tFull Address\tRemarks");
    formData.heirs.forEach((h: HeirRow, idx: number) => {
      if (!h.name && !h.relation && !h.address && !h.remarks) return;
      lines.push(`${idx + 1}\t${h.name}\t${h.relation}\t${h.address}\t${h.remarks}`);
    });
    lines.push("");
    lines.push("3. Documents Verified");
    lines.push(`${formData.docs.deathCertificate ? "☑" : "☐"} Death Certificate of the deceased farmer`);
    lines.push(`${formData.docs.identityProof ? "☑" : "☐"} Identity proof of applicant(s)`);
    lines.push(`☑ Land Record / Khatian No.: ${formData.docs.landRecordNo || ""}`);
    lines.push(`☑ Other Documents: ${formData.docs.otherDocuments || ""}`);
    lines.push("");
    lines.push("4. Field Enquiry Findings");
    lines.push(
      formData.findings.verifiedDetails
        ? "The above details have been verified through local enquiry and documents."
        : "The above details could not be fully verified."
    );
    lines.push(
      formData.findings.applicantsGenuine
        ? "Applicant(s) are genuine legal heirs of the deceased farmer."
        : "Applicant(s) could not be established as genuine legal heirs."
    );
    lines.push(
      formData.findings.noObjection
        ? "No objection has been received from Gram Sabha / local residents."
        : "Objection(s) have been received from Gram Sabha / local residents."
    );
    if (formData.findings.notes) lines.push(`Notes: ${formData.findings.notes}`);
    if (formData.findings.recommendation === "Eligible") {
      lines.push("Recommendation: Eligible for Krishak Bandhu (Death Benefit) Assistance");
    } else {
      lines.push(
        `Recommendation: Not Eligible (Reason: ${formData.findings.notEligibleReason || ""})`
      );
    }
    lines.push("");
    lines.push("5. Enquiry Officer’s Certification");
    lines.push(
      "I hereby certify that the enquiry has been conducted properly, and the information given above is true to the best of my knowledge."
    );
    lines.push(`Date: ${formData.certification.date || ""}`);
    lines.push(`Place: ${formData.certification.place || ""}`);
    lines.push(`Signature of Enquiry Officer: ${formData.certification.officerName || ""}`);
    return lines.join("\n");
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.applicationId) {
      alert("Application ID is required to submit the enquiry.");
      return;
    }
    setSubmitting(true);
    try {
      const reportText = buildReportText();
      const fd = new FormData();
      fd.append("report", reportText);
      fd.append("applicationId", formData.applicationId);
      if (formData.userId) fd.append("userId", formData.userId);

      const res = await fetch("/api/enquiry-reports", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to submit enquiry report");
      }
      alert("Enquiry report submitted successfully.");
    } catch (err: any) {
      alert(err?.message || "Something went wrong while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  const clearForm = () => {
    setFormData({
      applicationId: "",
      userId: "",
      deceasedName: "",
      fatherOrHusbandName: "",
      village: "",
      postOffice: "",
      policeStation: "",
      block: "",
      district: "",
      dateOfDeath: "",
      heirs: [{ name: "", relation: "", address: "", remarks: "" }],
      docs: { deathCertificate: true, identityProof: true, landRecordNo: "", otherDocuments: "" },
      findings: {
        verifiedDetails: true,
        applicantsGenuine: true,
        noObjection: true,
        recommendation: "Eligible",
        notEligibleReason: "",
        notes: "",
      },
      certification: { date: "", place: "", officerName: "" },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Krishak Bandhu (Death Benefit) Enquiry Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={onSubmit}>
            {/* Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="applicationId">Application ID</Label>
                <Input
                  id="applicationId"
                  value={formData.applicationId}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleRootChange("applicationId", e.target.value)}
                  placeholder="Enter related application ID"
                />
              </div>
              <div>
                <Label htmlFor="userId">User ID (optional)</Label>
                <Input
                  id="userId"
                  value={formData.userId}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleRootChange("userId", e.target.value)}
                  placeholder="Enter your user ID"
                />
              </div>
            </div>

            {/* 1. Details of the Deceased Farmer */}
            <div className="space-y-4">
              <div className="text-sm font-semibold">1. Details of the Deceased Farmer</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="deceasedName">Name of the Deceased Farmer</Label>
                  <Input
                    id="deceasedName"
                    value={formData.deceasedName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleRootChange("deceasedName", e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="fatherOrHusbandName">Father’s / Husband’s Name</Label>
                  <Input
                    id="fatherOrHusbandName"
                    value={formData.fatherOrHusbandName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleRootChange("fatherOrHusbandName", e.target.value)}
                    placeholder="Enter father's or husband's name"
                  />
                </div>
                <div>
                  <Label htmlFor="village">Village</Label>
                  <Input id="village" value={formData.village} onChange={(e: ChangeEvent<HTMLInputElement>) => handleRootChange("village", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="postOffice">P.O</Label>
                  <Input id="postOffice" value={formData.postOffice} onChange={(e: ChangeEvent<HTMLInputElement>) => handleRootChange("postOffice", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="policeStation">P.S</Label>
                  <Input id="policeStation" value={formData.policeStation} onChange={(e: ChangeEvent<HTMLInputElement>) => handleRootChange("policeStation", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="block">Block</Label>
                  <Input id="block" value={formData.block} onChange={(e: ChangeEvent<HTMLInputElement>) => handleRootChange("block", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Input id="district" value={formData.district} onChange={(e: ChangeEvent<HTMLInputElement>) => handleRootChange("district", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="dateOfDeath">Date of Death (as per certificate)</Label>
                  <Input
                    id="dateOfDeath"
                    type="date"
                    value={formData.dateOfDeath}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleRootChange("dateOfDeath", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 2. Details of the Applicant(s) / Legal Heirs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">2. Details of the Applicant(s) / Legal Heirs</div>
                <Button type="button" variant="outline" onClick={addHeir} disabled={formData.heirs.length >= 5}>
                  Add Applicant
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {formData.heirs.map((row: HeirRow, idx: number) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-3">
                      <Label>Name of Applicant</Label>
                      <Input value={row.name} onChange={(e: ChangeEvent<HTMLInputElement>) => updateHeir(idx, "name", e.target.value)} placeholder="Full name" />
                    </div>
                    <div className="md:col-span-3">
                      <Label>Relation with Deceased</Label>
                      <Input value={row.relation} onChange={(e: ChangeEvent<HTMLInputElement>) => updateHeir(idx, "relation", e.target.value)} placeholder="Relation" />
                    </div>
                    <div className="md:col-span-4">
                      <Label>Full Address</Label>
                      <Input value={row.address} onChange={(e: ChangeEvent<HTMLInputElement>) => updateHeir(idx, "address", e.target.value)} placeholder="Address" />
                    </div>
                    <div className="md:col-span-1">
                      <Label>Remarks</Label>
                      <Input value={row.remarks} onChange={(e: ChangeEvent<HTMLInputElement>) => updateHeir(idx, "remarks", e.target.value)} placeholder="" />
                    </div>
                    <div className="md:col-span-1 flex gap-2">
                      <Button type="button" variant="ghost" onClick={() => removeHeir(idx)} disabled={formData.heirs.length <= 1}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Documents Verified */}
            <div className="space-y-4">
              <div className="text-sm font-semibold">3. Documents Verified</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.docs.deathCertificate}
                    onCheckedChange={(v: boolean | "indeterminate") => updateDocs("deathCertificate", Boolean(v))}
                    id="deathCertificate"
                  />
                  <Label htmlFor="deathCertificate">Death Certificate of the deceased farmer</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.docs.identityProof}
                    onCheckedChange={(v: boolean | "indeterminate") => updateDocs("identityProof", Boolean(v))}
                    id="identityProof"
                  />
                  <Label htmlFor="identityProof">Identity proof of applicant(s)</Label>
                </div>
                <div>
                  <Label htmlFor="landRecordNo">Land Record / Khatian No.</Label>
                  <Input
                    id="landRecordNo"
                    value={formData.docs.landRecordNo}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateDocs("landRecordNo", e.target.value)}
                    placeholder="Enter Khatian No."
                  />
                </div>
                <div>
                  <Label htmlFor="otherDocuments">Other Documents</Label>
                  <Input
                    id="otherDocuments"
                    value={formData.docs.otherDocuments}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateDocs("otherDocuments", e.target.value)}
                    placeholder="Specify other documents"
                  />
                </div>
              </div>
            </div>

            {/* 4. Field Enquiry Findings */}
            <div className="space-y-4">
              <div className="text-sm font-semibold">4. Field Enquiry Findings</div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.findings.verifiedDetails}
                    onCheckedChange={(v: boolean | "indeterminate") => updateFindings("verifiedDetails", Boolean(v))}
                    id="verifiedDetails"
                  />
                  <Label htmlFor="verifiedDetails">Details verified through local enquiry and documents</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.findings.applicantsGenuine}
                    onCheckedChange={(v: boolean | "indeterminate") => updateFindings("applicantsGenuine", Boolean(v))}
                    id="applicantsGenuine"
                  />
                  <Label htmlFor="applicantsGenuine">Applicant(s) are genuine legal heirs</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.findings.noObjection}
                    onCheckedChange={(v: boolean | "indeterminate") => updateFindings("noObjection", Boolean(v))}
                    id="noObjection"
                  />
                  <Label htmlFor="noObjection">No objection from Gram Sabha / local residents</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Recommendation</Label>
                    <div className="flex gap-4 mt-2">
                      <Button
                        type="button"
                        variant={formData.findings.recommendation === "Eligible" ? "default" : "outline"}
                        onClick={() => updateFindings("recommendation", "Eligible")}
                      >
                        Eligible
                      </Button>
                      <Button
                        type="button"
                        variant={formData.findings.recommendation === "Not Eligible" ? "default" : "outline"}
                        onClick={() => updateFindings("recommendation", "Not Eligible")}
                      >
                        Not Eligible
                      </Button>
                    </div>
                  </div>
                  {formData.findings.recommendation === "Not Eligible" && (
                    <div>
                      <Label htmlFor="notEligibleReason">Reason (if Not Eligible)</Label>
                      <Input
                        id="notEligibleReason"
                        value={formData.findings.notEligibleReason}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => updateFindings("notEligibleReason", e.target.value)}
                        placeholder="Enter reason"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.findings.notes}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateFindings("notes", e.target.value)}
                    placeholder="Any other findings or remarks"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* 5. Enquiry Officer’s Certification */}
            <div className="space-y-4">
              <div className="text-sm font-semibold">5. Enquiry Officer’s Certification</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="certDate">Date</Label>
                  <Input
                    id="certDate"
                    type="date"
                    value={formData.certification.date}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateCertification("date", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="certPlace">Place</Label>
                  <Input
                    id="certPlace"
                    value={formData.certification.place}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateCertification("place", e.target.value)}
                    placeholder="Enter place"
                  />
                </div>
                <div>
                  <Label htmlFor="officerName">Signature of Enquiry Officer (Name)</Label>
                  <Input
                    id="officerName"
                    value={formData.certification.officerName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateCertification("officerName", e.target.value)}
                    placeholder="Officer's name"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Enquiry Report"}
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={clearForm}>
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
