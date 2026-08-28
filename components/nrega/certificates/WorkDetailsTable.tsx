"use client";

import React from "react";
import type { NregaWork } from "@prisma/client";

interface WorkDetailsTableProps {
  work: NregaWork;
  showConvergence?: boolean;
  showBeneficiary?: boolean;
}

export default function WorkDetailsTable({
  work,
  showConvergence = false,
  showBeneficiary = false,
}: WorkDetailsTableProps) {
  const rows: Array<{ label: string; value: string | number | null | undefined }> = [
    { label: "Financial Year", value: work.financialYear },
    { label: "Name of Proposed Work", value: work.workName },
    { label: "Master Category", value: work.masterCategory },
    { label: "Sub Category", value: work.subCategory },
    { label: "Beneficiary Type", value: work.beneficiaryType },
    {
      label: "Name & No. of Gram Sansad",
      value:
        work.gramSansadName && work.gramSansadNumber
          ? `${work.gramSansadName} (No. ${work.gramSansadNumber})`
          : work.gramSansadName || "N/A",
    },
    { label: "Name of Gram Panchayat", value: work.gramPanchayat },
    { label: "Name of Block", value: work.block },
    { label: "Name of District", value: work.district },
    {
      label: "Proposed Cost of Work",
      value: work.estimatedCost
        ? `₹ ${work.estimatedCost.toLocaleString("en-IN")}`
        : "N/A",
    },
    { label: "Wage-Material Ratio", value: work.wageMaterialRatio },
  ];

  if (showBeneficiary) {
    rows.push(
      { label: "Beneficiary Name", value: work.beneficiaryName },
      { label: "Job Card No.", value: work.jobCardNumber },
      { label: "Category of Beneficiary", value: work.beneficiaryCategory }
    );
  }

  if (showConvergence) {
    rows.push(
      { label: "Converging Department & Scheme", value: work.convergingDepartment ? `${work.convergingDepartment} - ${work.convergingScheme || ""}` : "N/A" },
      {
        label: "Estimated Scheme Share",
        value: work.vbGramgShare
          ? `₹ ${work.vbGramgShare.toLocaleString("en-IN")}`
          : "N/A",
      },
      { label: "Convergence Category", value: work.convergenceCategory },
      { label: "Technical Knowledge Provided", value: work.technicalKnowledgeProvided },
      {
        label: "Estimated Departmental Share",
        value: work.convergenceDeptShare
          ? `₹ ${work.convergenceDeptShare.toLocaleString("en-IN")}`
          : "N/A",
      },
      {
        label: "Total Estimated Cost",
        value: work.totalEstimatedCost
          ? `₹ ${work.totalEstimatedCost.toLocaleString("en-IN")}`
          : "N/A",
      },
      { label: "Whether NOC Received", value: work.nocReceived },
      { label: "NOC/Memo Number", value: work.nocMemoNumber },
      {
        label: "NOC Date",
        value: work.nocDate
          ? new Date(work.nocDate).toLocaleDateString("en-IN")
          : "N/A",
      }
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold mb-2 uppercase print:text-black">
        Basic Details of the Work
      </h3>
      <table className="w-full border-collapse border border-gray-800 text-sm print:text-black">
        <thead>
          <tr className="bg-gray-100 print:bg-gray-100">
            <th className="border border-gray-800 px-3 py-1.5 text-left font-semibold w-[40%]">
              Particulars
            </th>
            <th className="border border-gray-800 px-3 py-1.5 text-left font-semibold">
              Details
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="border border-gray-800 px-3 py-1.5 font-medium">
                {row.label}
              </td>
              <td className="border border-gray-800 px-3 py-1.5">
                {row.value || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
