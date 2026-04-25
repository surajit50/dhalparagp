"use client";

import { forwardRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { JSX } from "react/jsx-runtime";

type FamilyMember = {
  id: string;
  name: string;
  relation: string;
  age?: number;
  occupation?: string;
  children?: FamilyMember[];
};

type CertificateData = {
  certificateNo: string;
  issueDate: string;
  expiryDate: string;
  ancestorName: string;
  casteCategory: string;
  village: string;
  postOffice: string;
  block: string;
  district: string;
  state: string;
  familyTree: FamilyMember[];
  issuedBy: string;
  designation: string;
  applicantName: string;
  applicantAddress: string;
};

const renderFamilyTreeForPrint = (
  members: FamilyMember[],
  level = 0
): JSX.Element => {
  return (
    <div className="space-y-2 font-mono">
      {members.map((member, index) => (
        <div key={member.id}>
          {/* Member with indentation and dash */}
          <div className="flex items-start">
            <span className="text-gray-500 select-none whitespace-pre">
              {"  ".repeat(level)}
              {level > 0 ? "└─ " : ""}
            </span>
            <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">
                  {member.name}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {member.relation}
                </Badge>
                {member.age && (
                  <span className="text-xs text-gray-600">
                    ({member.age} years)
                  </span>
                )}
                {member.occupation && (
                  <span className="text-xs text-gray-600">
                    • {member.occupation}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Render children recursively */}
          {member.children && member.children.length > 0 && (
            <div className="mt-1">
              {renderFamilyTreeForPrint(member.children, level + 1)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

interface PrintableCertificateProps {
  certificateData: CertificateData;
}

const PrintableCertificate = forwardRef<
  HTMLDivElement,
  PrintableCertificateProps
>(({ certificateData }, ref) => {
  const {
    certificateNo,
    issueDate,
    expiryDate,
    ancestorName,
    casteCategory,
    village,
    postOffice,
    block,
    district,
    state,
    familyTree,
    issuedBy,
    designation,
    applicantName,
    applicantAddress,
  } = certificateData;
  return (
    <div
      ref={ref}
      className="max-w-4xl mx-auto bg-white text-black print:shadow-none print:max-w-none print:mx-0"
      style={{
        fontFamily: "Times New Roman, serif",
        lineHeight: "1.6",
        fontSize: "14px",
      }}
    >
      {/* Certificate Header */}
      <div className="border-4 border-double border-gray-800 p-8 print:border-2">
        {/* Government Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="w-16 h-16 border-2 border-gray-800 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl font-bold">🏛️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                GOVERNMENT OF {state.toUpperCase()}
              </h1>
              <h2 className="text-lg font-semibold text-gray-800">
                DISTRICT: {district.toUpperCase()}
              </h2>
              <h3 className="text-base font-medium text-gray-700">
                BLOCK: {block.toUpperCase()}
              </h3>
            </div>
            <div className="w-16 h-16 border-2 border-gray-800 rounded-full flex items-center justify-center ml-4">
              <span className="text-2xl font-bold">⚖️</span>
            </div>
          </div>
          <Separator className="my-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-wide">
            FAMILY LINEAGE CERTIFICATE
          </h1>
          <p className="text-lg text-gray-700 italic">
            (Bansa Talika / Genealogy Certificate)
          </p>
        </div>

        {/* Certificate Details */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Certificate No:
              </p>
              <p className="text-lg font-bold text-gray-900">{certificateNo}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Date of Issue:
              </p>
              <p className="text-lg font-bold text-gray-900">{issueDate}</p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Valid Until:</p>
            <p className="text-lg font-bold text-red-600">{expiryDate}</p>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Certificate Body */}
        <div className="mb-8 text-justify leading-relaxed">
          <p className="text-base mb-4">
            <strong>TO WHOM IT MAY CONCERN</strong>
          </p>
          <p className="text-base mb-4">
            This is to certify that based on the verification of village
            records, community testimony, and field inquiry conducted by the
            Gram Panchayat office, the following is the authenticated family
            lineage of <strong>Late {ancestorName}</strong>, who was a resident
            of <strong>{village}</strong>, Post Office:{" "}
            <strong>{postOffice}</strong>, Block: <strong>{block}</strong>,
            District: <strong>{district}</strong>, State:{" "}
            <strong>{state}</strong>.
          </p>
          <p className="text-base mb-6">
            The individual belonged to the <strong>{casteCategory}</strong>{" "}
            community, and this certificate has been issued upon the application
            of <strong>{applicantName}</strong>, residing at{" "}
            <strong>{applicantAddress}</strong>.
          </p>
        </div>

        {/* Family Tree Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center border-b-2 border-gray-300 pb-2">
            AUTHENTICATED FAMILY LINEAGE
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200 print:bg-white print:border-gray-400">
            {renderFamilyTreeForPrint(familyTree)}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Verification Statement */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            VERIFICATION STATEMENT
          </h3>
          <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400 print:bg-white print:border-gray-400">
            <p className="text-sm text-gray-800 mb-2">
              ✓ This certificate is issued based on thorough verification of
              village records
            </p>
            <p className="text-sm text-gray-800 mb-2">
              ✓ Community testimony has been recorded and verified
            </p>
            <p className="text-sm text-gray-800 mb-2">
              ✓ Field inquiry has been conducted by authorized personnel
            </p>
            <p className="text-sm text-gray-800">
              ✓ All information has been cross-verified with available documents
            </p>
          </div>
        </div>

        {/* Authority Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">ISSUED BY</h3>
            <div className="border-2 border-gray-300 p-4 rounded">
              <p className="text-base font-bold text-gray-900">{issuedBy}</p>
              <p className="text-sm text-gray-700">{designation}</p>
              <p className="text-sm text-gray-700">Gram Panchayat, {village}</p>
              <p className="text-sm text-gray-700">
                Block: {block}, District: {district}
              </p>
              <p className="text-sm text-gray-700">{state}</p>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-xs text-gray-600">
                  Signature & Official Seal
                </p>
                <div className="h-16 border border-dashed border-gray-400 mt-2 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">
                    [Official Signature & Seal]
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              CERTIFICATE VALIDITY
            </h3>
            <div className="border-2 border-red-300 p-4 rounded bg-red-50 print:bg-white">
              <div className="flex items-center mb-2">
                <Badge variant="destructive" className="mr-2">
                  IMPORTANT
                </Badge>
                <span className="text-sm font-bold">6 MONTHS VALIDITY</span>
              </div>
              <p className="text-sm text-gray-800 mb-2">
                <strong>Issue Date:</strong> {issueDate}
              </p>
              <p className="text-sm text-gray-800 mb-2">
                <strong>Expiry Date:</strong> {expiryDate}
              </p>
              <p className="text-xs text-gray-700 mt-3">
                This certificate must be renewed before the expiry date for
                continued validity.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Disclaimers */}
        <div className="border-t-2 border-gray-300 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600">
            <div>
              <h4 className="font-bold text-gray-800 mb-2">LEGAL DISCLAIMER</h4>
              <ul className="space-y-1">
                <li>
                  • This certificate is valid only when stamped and signed by
                  the issuing authority
                </li>
                <li>
                  • Any misrepresentation of information is punishable under law
                </li>
                <li>• This certificate is issued for official purposes only</li>
                <li>
                  • Validity is limited to 6 months from the date of issue
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">
                VERIFICATION CODE
              </h4>
              <div className="bg-gray-100 p-3 rounded border print:bg-white print:border-gray-400">
                <p className="font-mono text-sm">{certificateNo}</p>
                <p className="text-xs mt-1">
                  Scan QR code or visit official website to verify authenticity
                </p>
                <div className="mt-2 w-16 h-16 border border-gray-400 flex items-center justify-center">
                  <span className="text-xs">QR</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Print Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center">
          <p className="text-xs text-gray-500">
            This is a computer-generated certificate. For any queries, contact
            the issuing authority.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Generated on: {new Date().toLocaleString()} | Certificate ID:{" "}
            {certificateNo}
          </p>
        </div>
      </div>
    </div>
  );
});

PrintableCertificate.displayName = "PrintableCertificate";

export default PrintableCertificate;
