"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";

const commonDocuments = [
  { id: "trade-license", label: "Self-attested copy of Trade License" },
  { id: "pan-card", label: "PAN Card (Permanent Account Number)" },
  { id: "bank-details", label: "Bank Account Details (with IFSC code)" },
  { id: "aadhaar", label: "Aadhaar Card (Proprietor/Director)" },
];

const supplyDocuments = [
  { id: "gst-cert", label: "GST Registration Certificate (if applicable)" },
  { id: "experience", label: "Proof of Previous Supply Experience" },
];

const workDocuments = [
  { id: "gst-cert", label: "GST Registration Certificate (if applicable)" },
  { id: "experience", label: "Proof of Previous Work Experience" },
  { id: "tech-capacity", label: "Technical Capacity & Equipment List" },
];

const serviceDocuments = [
  { id: "gst-cert", label: "GST Registration Certificate (if applicable)" },
  { id: "equipment-reg", label: "Equipment/Vehicle Registration Certificate" },
  { id: "insurance", label: "Insurance Certificate (Valid)" },
  { id: "driving-license", label: "Valid Driving License (if vehicle/machinery)" },
  { id: "experience", label: "Proof of Previous Service Experience" },
  { id: "operator-cert", label: "Operator Certification/License" },
];

export default function RequiredDocumentsSection() {
  const form = useFormContext();
  const quotationType = form.watch("quotationType");

  const getDocuments = () => {
    switch (quotationType) {
      case "SUPPLY":
        return [...commonDocuments, ...supplyDocuments];
      case "WORK":
        return [...commonDocuments, ...workDocuments];
      case "SERVICE":
        return [...commonDocuments, ...serviceDocuments];
      default:
        return commonDocuments;
    }
  };

  const getDescription = () => {
    switch (quotationType) {
      case "SUPPLY":
        return "Suppliers must provide the following documents with their quotation:";
      case "WORK":
        return "Contractors must provide the following documents with their quotation:";
      case "SERVICE":
        return "Service providers/Equipment owners must provide the following documents with their quotation:";
      default:
        return "Suppliers must provide the following documents with their quotation:";
    }
  };

  const getSubmissionInstructions = () => {
    switch (quotationType) {
      case "SERVICE":
        return [
          "Submit quotation in sealed envelope superscribed with quotation title",
          "Quote rates inclusive of all taxes and operational charges",
          "Valid for minimum 30 days from opening date",
          "Sign and stamp all pages of quotation",
          "Submit all required documents together with quotation",
          "Equipment/Vehicle registration and insurance proof mandatory",
        ];
      default:
        return [
          "Submit quotation in sealed envelope superscribed with quotation title",
          "Quote rates inclusive of all taxes and transportation charges",
          "Valid for minimum 30 days from opening date",
          "Sign and stamp all pages of quotation",
          "Submit all required documents together with quotation",
        ];
    }
  };

  const documents = getDocuments();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary border-b pb-2">
        Required Documents from {quotationType === "WORK" ? "Contractors" : quotationType === "SERVICE" ? "Service Providers" : "Suppliers"}
      </h3>

      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <p className="text-sm text-purple-800 font-semibold mb-4">
          {getDescription()}
        </p>

        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center space-x-2">
              <Checkbox id={doc.id} disabled defaultChecked />
              <Label
                htmlFor={doc.id}
                className="text-sm text-purple-800 cursor-pointer font-normal"
              >
                {doc.label}
              </Label>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-purple-200">
          <p className="text-xs text-purple-700">
            <strong>Note:</strong> Incomplete quotations without required documents 
            will be rejected at opening stage itself.
          </p>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-sm text-green-800 font-semibold mb-3">
          ✓ Submission Instructions:
        </p>
        <ul className="text-sm text-green-800 space-y-2 list-disc list-inside">
          {getSubmissionInstructions().map((instruction, idx) => (
            <li key={idx}>{instruction}</li>
          ))}
        </ul>
      </div>

      {quotationType === "SERVICE" && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-semibold mb-3">
            📋 Service Provider Specific Requirements:
          </p>
          <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
            <li>Equipment/Machinery must be roadworthy and in good working condition</li>
            <li>Valid insurance coverage (third-party minimum) is mandatory</li>
            <li>Operator/Staff must be trained and experienced</li>
            <li>Availability as per requirement (working hours and days)</li>
            <li>Fuel, maintenance, and repair liability must be clearly stated</li>
            <li>Mobilization and de-mobilization charges (if any) to be separately quoted</li>
          </ul>
        </div>
      )}
    </div>
  );
}
