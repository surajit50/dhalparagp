"use client";

import React from "react";
import CertificateHeader from "./CertificateHeader";
import CertificateSignature from "./CertificateSignature";
import WorkDetailsTable from "./WorkDetailsTable";
import VerificationTable, { type VerificationRow } from "./VerificationTable";
import type { NregaWork, NregaCertificate, NregaCertificateVerification } from "@prisma/client";

interface CertificatePreviewProps {
  work: NregaWork;
  certificate: NregaCertificate;
  verifications: NregaCertificateVerification[];
  templateTitle: string;
}

export default function CertificatePreview({
  work,
  certificate,
  verifications,
  templateTitle,
}: CertificatePreviewProps) {
  const certNum = certificate.certificateNumber;

  // Convert verifications to display format
  const verificationRows: VerificationRow[] = verifications.map((v) => ({
    parameterKey: v.parameterKey,
    parameter: v.parameter,
    status: v.status,
    remarks: v.remarks || "",
  }));

  // Determine which extra sections to show based on cert type
  const showBeneficiary = certNum === 5;
  const showConvergence = certNum === 7;

  // Certificate-specific additional content
  const renderCertificateSpecific = () => {
    switch (certNum) {
      case 4:
        return (
          <div className="mb-6">
            <h3 className="text-sm font-bold mb-2 uppercase print:text-black">
              Permissible Work Details
            </h3>
            <table className="w-full border-collapse border border-gray-800 text-sm print:text-black">
              <thead>
                <tr className="bg-gray-100 print:bg-gray-100">
                  <th className="border border-gray-800 px-3 py-1.5 text-left font-semibold w-20">
                    Sl. No.
                  </th>
                  <th className="border border-gray-800 px-3 py-1.5 text-left font-semibold">
                    Master Category
                  </th>
                  <th className="border border-gray-800 px-3 py-1.5 text-left font-semibold">
                    Sub Category
                  </th>
                  <th className="border border-gray-800 px-3 py-1.5 text-left font-semibold">
                    Permissible Work Description
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-800 px-3 py-1.5">
                    {work.permissibleWorkSlNo || "N/A"}
                  </td>
                  <td className="border border-gray-800 px-3 py-1.5">
                    {work.masterCategory || "N/A"}
                  </td>
                  <td className="border border-gray-800 px-3 py-1.5">
                    {work.subCategory || "N/A"}
                  </td>
                  <td className="border border-gray-800 px-3 py-1.5">
                    {work.permissibleWorkDesc || "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 5:
        if (work.beneficiaryType === "Community") {
          return (
            <div className="mb-6 p-4 border border-gray-300 bg-gray-50 text-center">
              <p className="text-sm font-semibold text-gray-600 print:text-black">
                Not Applicable — Community Work
              </p>
            </div>
          );
        }
        return null;

      case 6:
        return (
          <div className="mb-6">
            <h3 className="text-sm font-bold mb-2 uppercase print:text-black">
              DPR Details
            </h3>
            <table className="w-full border-collapse border border-gray-800 text-sm print:text-black">
              <tbody>
                <tr>
                  <td className="border border-gray-800 px-3 py-1.5 font-medium w-[40%]">
                    DPR Number
                  </td>
                  <td className="border border-gray-800 px-3 py-1.5">
                    {work.dprNumber || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 px-3 py-1.5 font-medium">
                    DPR Date
                  </td>
                  <td className="border border-gray-800 px-3 py-1.5">
                    {work.dprDate
                      ? new Date(work.dprDate).toLocaleDateString("en-IN")
                      : "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 7:
        if (!work.convergingDepartment) {
          return (
            <div className="mb-6 p-4 border border-gray-300 bg-gray-50 text-center">
              <p className="text-sm font-semibold text-gray-600 print:text-black">
                Not Applicable — Non-Convergence Work
              </p>
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <div
      className="bg-white text-black p-8 max-w-[210mm] mx-auto shadow-md print:shadow-none print:p-6"
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        minHeight: "297mm",
      }}
    >
      {/* Header */}
      <CertificateHeader
        certificateNumber={certNum}
        title={templateTitle}
      />

      {/* Work Details */}
      <WorkDetailsTable
        work={work}
        showBeneficiary={showBeneficiary}
        showConvergence={showConvergence}
      />

      {/* Certificate-specific content */}
      {renderCertificateSpecific()}

      {/* Verification Table */}
      {verificationRows.length > 0 && (
        <VerificationTable
          verifications={verificationRows}
          onChange={() => {}}
          readOnly
        />
      )}

      {/* Certification Text */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-2 uppercase print:text-black">
          Certification
        </h3>
        <div className="border border-gray-800 p-3 text-sm leading-relaxed print:text-black">
          {certificate.certificationText || "—"}
        </div>
      </div>

      {/* Signature */}
      <CertificateSignature
        designation={certificate.signatureDesignation || "Block Development Officer"}
        block={certificate.signatureBlock || work.block}
        date={
          certificate.signatureDate
            ? new Date(certificate.signatureDate).toLocaleDateString("en-IN")
            : undefined
        }
      />
    </div>
  );
}
