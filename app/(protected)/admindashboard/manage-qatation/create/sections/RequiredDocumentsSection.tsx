"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const requiredDocuments = [
  { id: "trade-license", label: "Self-attested copy of Trade License" },
  { id: "pan-card", label: "PAN Card (Permanent Account Number)" },
  { id: "gst-cert", label: "GST Registration Certificate (if applicable)" },
  { id: "bank-details", label: "Bank Account Details (with IFSC code)" },
  { id: "aadhaar", label: "Aadhaar Card (Proprietor/Director)" },
  { id: "experience", label: "Proof of Previous Experience (if required)" },
];

export default function RequiredDocumentsSection() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary border-b pb-2">
        Required Documents from Suppliers
      </h3>

      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <p className="text-sm text-purple-800 font-semibold mb-4">
          Suppliers must provide the following documents with their quotation:
        </p>

        <div className="space-y-3">
          {requiredDocuments.map((doc) => (
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
          <li>Submit quotation in sealed envelope superscribed with quotation title</li>
          <li>Quote rates inclusive of all taxes and transportation charges</li>
          <li>Valid for minimum 30 days from opening date</li>
          <li>Sign and stamp all pages of quotation</li>
          <li>Submit all required documents together with quotation</li>
        </ul>
      </div>
    </div>
  );
}
