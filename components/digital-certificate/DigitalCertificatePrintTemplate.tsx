"use client";

import React, { forwardRef } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { printDocumentById } from "@/lib/print-certificate";

export interface DigitalCertificateApplicationData {
  id?: string;
  acknowledgementNo: string;
  certificateType: "BIRTH" | "DEATH" | string;
  status?: string;
  createdAt?: Date | string;

  // Section A
  applicantName: string;
  relationshipWithPerson?: string | null;
  fatherOrHusbandName: string;
  postalAddress: string;
  mobileNumber: string;

  // Section B
  personName: string;
  fatherName?: string | null;
  motherName?: string | null;
  deceasedFatherOrHusbandName?: string | null;
  dateOfEvent: Date | string;
  placeOfEvent: string;
  registrationYear: string;
  registrationNumber: string;
  purpose: string;

  // Section C
  docProofOfIdentity?: boolean;
  docPreviousCertificate?: boolean;
  docGeneralDiary?: boolean;
  docRegistrationDetails?: boolean;
  docOtherDocument?: boolean;
  docOtherDetails?: string | null;

  // Section D
  declarationPlace?: string;
  declarationDate?: Date | string;
  applicantSignatureName?: string | null;

  // Office Use
  applicationReceivedOn?: Date | string | null;
  registerNoPageNoSerialNo?: string | null;
  officeRegistrationYear?: string | null;
  officeRegistrationNo?: string | null;
  dateOfVerification?: Date | string | null;
  recordAvailable?: boolean | null;
  registrationVerified?: boolean | null;
  subRegistrarOrder?: string | null;
  rejectionReason?: string | null;
  dataEntryOperatorSignature?: string | null;
  dataEntryOperatorName?: string | null;
  dataEntryOperatorDate?: Date | string | null;
  subRegistrarSignature?: string | null;
  subRegistrarName?: string | null;
  subRegistrarDate?: Date | string | null;
}

interface PrintTemplateProps {
  data: DigitalCertificateApplicationData;
  showPrintButton?: boolean;
  backUrl?: string;
}

export const DigitalCertificatePrintTemplate = forwardRef<HTMLDivElement, PrintTemplateProps>(
  ({ data, showPrintButton = true, backUrl }, ref) => {
    const isBirth = data.certificateType === "BIRTH";
    const isDeath = data.certificateType === "DEATH";

    // Dynamic labels based on certificate type
    const certTypeLabel = isBirth ? "Birth" : isDeath ? "Death" : "Birth / Death";
    const certTypeLabelUpper = certTypeLabel.toUpperCase();

    const formattedEventDate = data.dateOfEvent
      ? format(new Date(data.dateOfEvent), "dd / MM / yyyy")
      : "____ / ____ / ______";

    const formattedDeclarationDate = data.declarationDate
      ? format(new Date(data.declarationDate), "dd / MM / yyyy")
      : (data.createdAt ? format(new Date(data.createdAt), "dd / MM / yyyy") : format(new Date(), "dd / MM / yyyy"));

    const formattedReceivedDate = data.applicationReceivedOn
      ? format(new Date(data.applicationReceivedOn), "dd / MM / yyyy")
      : (data.createdAt ? format(new Date(data.createdAt), "dd / MM / yyyy") : "____ / ____ / ______");

    const formattedVerificationDate = data.dateOfVerification
      ? format(new Date(data.dateOfVerification), "dd / MM / yyyy")
      : "____ / ____ / ______";

    const formattedDeoDate = data.dataEntryOperatorDate
      ? format(new Date(data.dataEntryOperatorDate), "dd / MM / yyyy")
      : "____ / ____ / ______";

    const formattedSubRegDate = data.subRegistrarDate
      ? format(new Date(data.subRegistrarDate), "dd / MM / yyyy")
      : "____ / ____ / ______";

    const handlePrint = () => {
      printDocumentById(
        "digital-certificate-printable",
        `Application_Digital_Certificate_${data.acknowledgementNo}`
      );
    };

    return (
      <div className="w-full flex flex-col items-center">
        {/* Action Controls (Hidden on Print) */}
        {showPrintButton && (
          <div className="w-full max-w-4xl flex items-center justify-between gap-4 p-4 mb-4 bg-card border rounded-lg shadow-sm print:hidden">
            <div className="flex items-center gap-2">
              {backUrl && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={backUrl}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Link>
                </Button>
              )}
              <span className="text-sm font-semibold text-muted-foreground">
                Ack No: <span className="font-mono text-foreground font-bold">{data.acknowledgementNo}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                <Printer className="w-4 h-4" /> Print Application Form
              </Button>
            </div>
          </div>
        )}

        {/* Printable Official Form Container */}
        <div
          id="digital-certificate-printable"
          ref={ref}
          className="print-area bg-white text-black w-full max-w-[210mm] p-6 sm:p-8 mx-auto border border-gray-300 shadow-md print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none text-[12.5px] leading-tight font-serif"
          style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
          {/* Print Style Injector */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 8mm 10mm 8mm 10mm;
                }
                body {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  background: white !important;
                  color: #000000 !important;
                  font-size: 12px;
                }
                .no-print, .print\\:hidden {
                  display: none !important;
                }
                .page-break-avoid {
                  break-inside: avoid !important;
                  page-break-inside: avoid !important;
                }
              }
            `,
            }}
          />

          {/* Gram Panchayat Official Header */}
          <div className="text-center border-b-2 border-black pb-2 mb-2">
            <h2 className="text-[15px] font-bold uppercase tracking-wider text-black">
              Office of the Sub-Registrar of Births & Deaths
            </h2>
            <h1 className="text-[17px] font-extrabold uppercase tracking-wide text-black">
              No. 3 Dhalpara Gram Panchayat
            </h1>
            <p className="text-[11.5px] font-semibold text-black">
              P.O. – Trimohini, Block – Hili, District – Dakshin Dinajpur, West Bengal, PIN – 733126
            </p>
          </div>

          {/* Acknowledgement Header Bar */}
          <div className="flex justify-between items-center bg-gray-100 print:bg-gray-100 border border-black px-3 py-1 mb-2">
            <div>
              <span className="font-bold text-xs uppercase tracking-wider">Ack No:</span>{" "}
              <span className="font-mono font-bold text-[13px] tracking-wide text-black">{data.acknowledgementNo}</span>
            </div>
            <div>
              <span className="font-bold text-xs uppercase tracking-wider">Date of Application:</span>{" "}
              <span className="font-bold text-[13px] text-black">{formattedDeclarationDate}</span>
            </div>
          </div>

          {/* Document Title - dynamically shows BIRTH / DEATH */}
          <div className="text-center my-2">
            <h3 className="text-[14px] font-bold tracking-wide uppercase border-b-2 border-black inline-block pb-0.5">
              APPLICATION FOR ISSUE OF DIGITAL {certTypeLabelUpper} CERTIFICATE
            </h3>
          </div>

          {/* Recipient Address */}
          <div className="mb-2 space-y-0.5 text-[12px] text-black">
            <p className="font-bold">To</p>
            <p className="font-bold">The Sub-Registrar of Births & Deaths</p>
            <p>No. 3 Dhalpara Gram Panchayat</p>
            <p>P.O. Trimohini, Block – Hili</p>
            <p>District – Dakshin Dinajpur, West Bengal</p>
          </div>

          {/* Subject Line - dynamic */}
          <div className="mb-2 text-[12.5px] text-black">
            <span className="font-bold underline">Subject:</span>{" "}
            <span className="font-bold uppercase">
              Application for Issue of Digital {certTypeLabel} Certificate
            </span>
          </div>

          {/* Preamble - dynamic */}
          <div className="mb-2.5 text-justify text-[12px] leading-relaxed text-black">
            <p className="font-semibold mb-0.5">Respected Sir/Madam,</p>
            <p className="indent-6">
              I respectfully submit this application for issuance of a Digital {certTypeLabel} Certificate. The particulars relating to the {certTypeLabel.toLowerCase()} registration are furnished below. I request you to kindly verify the official records maintained in your office and issue the Digital Certificate.
            </p>
          </div>

          {/* Section A: Applicant's Details */}
          <div className="mb-2.5 page-break-avoid">
            <div className="bg-gray-100 print:bg-gray-200 border border-black px-2 py-0.5 font-bold text-[12px] uppercase tracking-wide text-black">
              A. APPLICANT’S DETAILS
            </div>
            <table className="w-full border-collapse border border-black text-[12px]">
              <thead>
                <tr className="bg-gray-50 print:bg-gray-100">
                  <th className="border border-black px-2 py-0.5 text-left w-1/3 font-bold text-black">Particulars</th>
                  <th className="border border-black px-2 py-0.5 text-left w-2/3 font-bold text-black">Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black px-2 py-0.5 font-semibold text-black">Type of Certificate</td>
                  <td className="border border-black px-2 py-0.5 text-black">
                    <div className="flex items-center gap-6">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className={`inline-flex items-center justify-center w-3.5 h-3.5 border border-black text-xs font-bold ${isBirth ? "bg-black text-white" : ""}`}>
                          {isBirth ? "✓" : ""}
                        </span>
                        Birth Certificate
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className={`inline-flex items-center justify-center w-3.5 h-3.5 border border-black text-xs font-bold ${isDeath ? "bg-black text-white" : ""}`}>
                          {isDeath ? "✓" : ""}
                        </span>
                        Death Certificate
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-0.5 font-semibold text-black">Name of Applicant</td>
                  <td className="border border-black px-2 py-0.5 font-bold text-black">{data.applicantName || "—"}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-0.5 font-semibold text-black">
                    Relationship with the Person <span className="text-[10.5px] font-normal italic">(For Death Certificate Only)</span>
                  </td>
                  <td className="border border-black px-2 py-0.5 text-black">{data.relationshipWithPerson || "N/A (Birth Certificate)"}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-0.5 font-semibold text-black">Father’s / Husband’s Name</td>
                  <td className="border border-black px-2 py-0.5 text-black">{data.fatherOrHusbandName || "—"}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-0.5 font-semibold text-black">Complete Postal Address</td>
                  <td className="border border-black px-2 py-0.5 text-black">{data.postalAddress || "—"}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-0.5 font-semibold text-black">Mobile Number</td>
                  <td className="border border-black px-2 py-0.5 font-mono font-bold text-black">{data.mobileNumber || "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section B: Particulars of Birth / Death - dynamic labels */}
          <div className="mb-2.5 page-break-avoid">
            <div className="bg-gray-100 print:bg-gray-200 border border-black px-2 py-0.5 font-bold text-[12px] uppercase tracking-wide text-black">
              B. PARTICULARS OF {certTypeLabelUpper}
            </div>
            <table className="w-full border-collapse border border-black text-[12px]">
              <thead>
                <tr className="bg-gray-50 print:bg-gray-100">
                  <th className="border border-black px-2 py-0.5 text-left w-1/3 font-bold text-black">Particulars</th>
                  <th className="border border-black px-2 py-0.5 text-left w-2/3 font-bold text-black">Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black px-2 py-0.5 font-semibold text-black">Name of the Person</td>
                  <td className="border border-black px-2 py-0.5 font-bold text-black">{data.personName || "—"}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-0.5 font-semibold text-black">
                    Father’s Name <span className="text-[10.5px] font-normal italic">(For Birth)</span>
                  </td>
                  <td className="border border-black px-2 py-0.5 text-black">{data.fatherName || "—"}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-0.5 font-semibold text-black">
                    Mother’s Name <span className="text-[10.5px] font-normal italic">(For Birth)</span>
                  </td>
                  <td className="border border-black px-2 py-0.5 text-black">{data.motherName || "—"}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-0.5 font-semibold text-black">
                    Father’s / Husband’s Name <span className="text-[10.5px] font-normal italic">(For Death)</span>
                  </td>
                  <td className="border border-black px-2 py-0.5 text-black">{data.deceasedFatherOrHusbandName || "—"}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-0.5 font-semibold text-black">Date of {certTypeLabel}</td>
                  <td className="border border-black px-2 py-0.5 font-bold text-black">{formattedEventDate}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-0.5 font-semibold text-black">Place of {certTypeLabel}</td>
                  <td className="border border-black px-2 py-0.5 text-black">{data.placeOfEvent || "—"}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-0.5 font-semibold text-black">Registration Year</td>
                  <td className="border border-black px-2 py-0.5 font-mono font-bold text-black">{data.registrationYear || "—"}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-0.5 font-semibold text-black">Registration Number</td>
                  <td className="border border-black px-2 py-0.5 font-mono font-bold text-black">{data.registrationNumber || "—"}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-0.5 font-semibold text-black">Purpose for Obtaining Certificate</td>
                  <td className="border border-black px-2 py-0.5 text-black">{data.purpose || "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section C: Documents Enclosed */}
          <div className="mb-2.5 page-break-avoid">
            <div className="bg-gray-100 print:bg-gray-200 border border-black px-2 py-0.5 font-bold text-[12px] uppercase tracking-wide text-black">
              C. DOCUMENTS ENCLOSED <span className="text-[11px] font-normal normal-case italic">(Please tick ✔ the applicable documents)</span>
            </div>
            <div className="border border-t-0 border-black p-2 space-y-1 text-[11.5px] text-black">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex items-center justify-center w-3.5 h-3.5 border border-black text-xs font-bold ${data.docProofOfIdentity ? "bg-black text-white" : ""}`}>
                    {data.docProofOfIdentity ? "✓" : ""}
                  </span>
                  <span>Proof of Identity (Aadhaar / Voter ID / PAN / Passport)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex items-center justify-center w-3.5 h-3.5 border border-black text-xs font-bold ${data.docPreviousCertificate ? "bg-black text-white" : ""}`}>
                    {data.docPreviousCertificate ? "✓" : ""}
                  </span>
                  <span>Previous {certTypeLabel} Certificate (If Available)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex items-center justify-center w-3.5 h-3.5 border border-black text-xs font-bold ${data.docGeneralDiary ? "bg-black text-white" : ""}`}>
                    {data.docGeneralDiary ? "✓" : ""}
                  </span>
                  <span>General Diary (GD) Copy (If Applicable)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex items-center justify-center w-3.5 h-3.5 border border-black text-xs font-bold ${data.docRegistrationDetails ? "bg-black text-white" : ""}`}>
                    {data.docRegistrationDetails ? "✓" : ""}
                  </span>
                  <span>Registration Details (If Available)</span>
                </div>
              </div>
              <div className="flex items-start gap-1.5 pt-0.5">
                <span className={`inline-flex items-center justify-center w-3.5 h-3.5 border border-black text-xs font-bold mt-0.5 ${data.docOtherDocument ? "bg-black text-white" : ""}`}>
                  {data.docOtherDocument ? "✓" : ""}
                </span>
                <div className="flex-1">
                  <span>Any Other Supporting Document: </span>
                  <span className="font-semibold underline">
                    {data.docOtherDetails || "________________________________________________________"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section D: Declaration */}
          <div className="mb-2.5 page-break-avoid">
            <div className="bg-gray-100 print:bg-gray-200 border border-black px-2 py-0.5 font-bold text-[12px] uppercase tracking-wide text-black">
              D. DECLARATION
            </div>
            <div className="border border-t-0 border-black p-2 text-[11.5px] leading-snug text-justify text-black">
              <p className="mb-1 indent-6">
                I hereby declare that the information furnished above is true and correct to the best of my knowledge and belief. I understand that if any information is found to be false or incorrect, my application is liable to be rejected.
              </p>
              <p className="mb-2 indent-6">
                I therefore request the Sub-Registrar of Births & Deaths, No. 3 Dhalpara Gram Panchayat, to kindly verify the records maintained in your office and issue the Digital {certTypeLabel} Certificate.
              </p>

              <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-dashed border-gray-400 items-end">
                <div>
                  <p><span className="font-bold">Place:</span> {data.declarationPlace || "Dhalpara"}</p>
                </div>
                <div className="text-center">
                  <p><span className="font-bold">Date:</span> {formattedDeclarationDate}</p>
                </div>
                <div className="text-right">
                  <div className="border-b border-black w-44 ml-auto mb-0.5 text-center font-bold">
                    {data.applicantSignatureName || data.applicantName || ""}
                  </div>
                  <p className="text-[10.5px] font-semibold text-center w-44 ml-auto">
                    Signature / Thumb Impression of Applicant
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Official Use Divider */}
          <div className="border-b-2 border-dashed border-black my-2.5 relative page-break-avoid">
            <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-white px-2 text-[9.5px] uppercase font-bold tracking-widest text-black">
              For Official Use Only
            </span>
          </div>

          {/* FOR OFFICE USE ONLY */}
          <div className="mb-2 page-break-avoid">
            <div className="bg-gray-200 print:bg-gray-300 border border-black px-2 py-0.5 text-center font-bold text-[12px] uppercase tracking-widest text-black">
              FOR OFFICE USE ONLY
            </div>
            <div className="bg-gray-50 print:bg-gray-100 border border-t-0 border-black px-2 py-0.5 font-bold text-[11px] uppercase text-black">
              Receipt & Verification Details
            </div>
            <table className="w-full border-collapse border border-black text-[11.5px]">
              <thead>
                <tr className="bg-gray-50 print:bg-gray-100">
                  <th className="border border-black px-2 py-0.5 text-left w-1/2 font-bold text-black">Particulars</th>
                  <th className="border border-black px-2 py-0.5 text-left w-1/2 font-bold text-black">Office Record</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black px-2 py-0.5 text-black">Application Received on</td>
                  <td className="border border-black px-2 py-0.5 font-medium text-black">{formattedReceivedDate}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-0.5 text-black">Register No. & Page No. & Serial No.</td>
                  <td className="border border-black px-2 py-0.5 font-medium text-black">
                    {data.registerNoPageNoSerialNo || "_________________________________"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-0.5 text-black">Registration Year</td>
                  <td className="border border-black px-2 py-0.5 font-medium text-black">
                    {data.officeRegistrationYear || data.registrationYear || "_________________________________"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-0.5 text-black">Registration No.</td>
                  <td className="border border-black px-2 py-0.5 font-medium text-black">
                    {data.officeRegistrationNo || data.registrationNumber || "_________________________________"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-0.5 text-black">Date of Verification</td>
                  <td className="border border-black px-2 py-0.5 font-medium text-black">{formattedVerificationDate}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-0.5 text-black">Record Available</td>
                  <td className="border border-black px-2 py-0.5 text-black">
                    <div className="flex items-center gap-6">
                      <span className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center justify-center w-3.5 h-3.5 border border-black text-xs font-bold ${data.recordAvailable === true ? "bg-black text-white" : ""}`}>
                          {data.recordAvailable === true ? "✓" : ""}
                        </span>
                        Yes
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center justify-center w-3.5 h-3.5 border border-black text-xs font-bold ${data.recordAvailable === false ? "bg-black text-white" : ""}`}>
                          {data.recordAvailable === false ? "✓" : ""}
                        </span>
                        No
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-0.5 text-black">Registration Verified</td>
                  <td className="border border-black px-2 py-0.5 text-black">
                    <div className="flex items-center gap-6">
                      <span className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center justify-center w-3.5 h-3.5 border border-black text-xs font-bold ${data.registrationVerified === true ? "bg-black text-white" : ""}`}>
                          {data.registrationVerified === true ? "✓" : ""}
                        </span>
                        Yes
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center justify-center w-3.5 h-3.5 border border-black text-xs font-bold ${data.registrationVerified === false ? "bg-black text-white" : ""}`}>
                          {data.registrationVerified === false ? "✓" : ""}
                        </span>
                        No
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ORDER OF THE SUB-REGISTRAR - dynamic approval text */}
          <div className="border border-black p-2 text-[11.5px] leading-tight page-break-avoid text-black">
            <div className="font-bold uppercase tracking-wide text-[11px] mb-1 border-b border-black pb-0.5">
              ORDER OF THE SUB-REGISTRAR
            </div>
            <p className="mb-1.5">After verification of the records maintained in this office:</p>
            <div className="flex items-center gap-8 mb-1.5">
              <span className="flex items-center gap-1.5 font-bold">
                <span className={`inline-flex items-center justify-center w-3.5 h-3.5 border border-black text-xs font-bold ${data.subRegistrarOrder === "APPROVED" ? "bg-black text-white" : ""}`}>
                  {data.subRegistrarOrder === "APPROVED" ? "✓" : ""}
                </span>
                Approved for issue of Digital {certTypeLabel} Certificate
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <span className={`inline-flex items-center justify-center w-3.5 h-3.5 border border-black text-xs font-bold ${data.subRegistrarOrder === "REJECTED" ? "bg-black text-white" : ""}`}>
                  {data.subRegistrarOrder === "REJECTED" ? "✓" : ""}
                </span>
                Rejected
              </span>
            </div>

            <div className="mb-2.5">
              <span>Reason (if rejected): </span>
              <span className="underline font-semibold">
                {data.rejectionReason || "____________________________________________________________________________________"}
              </span>
            </div>

            {/* Signature Blocks */}
            <div className="grid grid-cols-2 gap-6 pt-2 border-t border-gray-400">
              {/* Data Entry Operator */}
              <div>
                <p className="font-bold uppercase text-[11px] mb-1">Data Entry Operator</p>
                <p className="mb-0.5">
                  Signature: <span className="underline font-medium">{data.dataEntryOperatorSignature || "_______________________"}</span>
                </p>
                <p className="mb-0.5">
                  Name: <span className="underline font-medium">{data.dataEntryOperatorName || "_______________________"}</span>
                </p>
                <p>
                  Date: <span className="underline font-medium">{formattedDeoDate}</span>
                </p>
              </div>

              {/* Sub-Registrar */}
              <div className="text-right">
                <p className="font-bold uppercase text-[11px] mb-1">Sub-Registrar of Births & Deaths</p>
                <p className="mb-0.5">
                  Signature: <span className="underline font-medium">{data.subRegistrarSignature || "_______________________"}</span>
                </p>
                <p className="mb-0.5">
                  Name: <span className="underline font-medium">{data.subRegistrarName || "_______________________"}</span>
                </p>
                <p>
                  Date: <span className="underline font-medium">{formattedSubRegDate}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DigitalCertificatePrintTemplate.displayName = "DigitalCertificatePrintTemplate";

export default DigitalCertificatePrintTemplate;
