"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export interface VerificationRow {
  parameterKey: string;
  parameter: string;
  status: string;
  remarks: string;
}

interface VerificationTableProps {
  verifications: VerificationRow[];
  onChange: (updated: VerificationRow[]) => void;
  readOnly?: boolean;
}

export default function VerificationTable({
  verifications,
  onChange,
  readOnly = false,
}: VerificationTableProps) {
  const handleStatusChange = (index: number, value: string) => {
    const updated = [...verifications];
    updated[index] = { ...updated[index], status: value };
    onChange(updated);
  };

  const handleRemarksChange = (index: number, value: string) => {
    const updated = [...verifications];
    updated[index] = { ...updated[index], remarks: value };
    onChange(updated);
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold mb-2 uppercase print:text-black">
        Verification
      </h3>
      <table className="w-full border-collapse border border-gray-800 text-sm print:text-black">
        <thead>
          <tr className="bg-gray-100 print:bg-gray-100">
            <th className="border border-gray-800 px-2 py-1.5 text-center font-semibold w-10">
              Sl.
            </th>
            <th className="border border-gray-800 px-3 py-1.5 text-left font-semibold">
              Parameters of Verification
            </th>
            <th className="border border-gray-800 px-3 py-1.5 text-center font-semibold w-28">
              Status
            </th>
            <th className="border border-gray-800 px-3 py-1.5 text-left font-semibold w-40">
              Remarks
            </th>
          </tr>
        </thead>
        <tbody>
          {verifications.map((v, index) => (
            <tr key={v.parameterKey} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="border border-gray-800 px-2 py-1.5 text-center">
                {index + 1}
              </td>
              <td className="border border-gray-800 px-3 py-1.5">
                {v.parameter}
              </td>
              <td className="border border-gray-800 px-2 py-1.5 text-center">
                {readOnly ? (
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      v.status === "YES"
                        ? "bg-green-100 text-green-800"
                        : v.status === "NO"
                        ? "bg-red-100 text-red-800"
                        : v.status === "NA"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {v.status === "NA" ? "N/A" : v.status}
                  </span>
                ) : (
                  <Select
                    value={v.status}
                    onValueChange={(val) => handleStatusChange(index, val)}
                  >
                    <SelectTrigger className="h-8 text-xs w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="YES">Yes</SelectItem>
                      <SelectItem value="NO">No</SelectItem>
                      <SelectItem value="NA">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </td>
              <td className="border border-gray-800 px-2 py-1.5">
                {readOnly ? (
                  <span className="text-xs">{v.remarks || "—"}</span>
                ) : (
                  <Input
                    value={v.remarks}
                    onChange={(e) => handleRemarksChange(index, e.target.value)}
                    className="h-8 text-xs"
                    placeholder="Remarks"
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!readOnly && verifications.some((v) => v.status === "PENDING") && (
        <p className="mt-2 text-xs text-amber-600 font-medium">
          ⚠ Please verify all applicable parameters before generating the final certificate.
        </p>
      )}
    </div>
  );
}
