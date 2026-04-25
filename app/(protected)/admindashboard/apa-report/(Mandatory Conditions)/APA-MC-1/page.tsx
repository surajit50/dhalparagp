"use client";
import React, { useState } from "react";

const FinancialReport = () => {
  // Generate financial years from 2020 to 2026
  const financialYears = Array.from({ length: 7 }, (_, i) => {
    const startYear = 2020 + i;
    return `${startYear} - ${startYear + 1}`;
  });

  const [selectedYear, setSelectedYear] = useState("2024 - 2025");

  // Generate dummy data based on selected year
  const getDummyData = (year: string) => {
    const baseYear = parseInt(year.substring(0, 4));
    const yearMod = baseYear % 10; // Create variation based on year

    return {
      totalMembers: 100 + yearMod * 3,
      attendedMembers: 85 + yearMod * 2,
      planApprovalStatus: yearMod % 3 === 0 ? "Pending" : "Approved",
      declarationStatus: yearMod % 4 === 0 ? "Missing" : "Received",
      attendanceRate: `${75 + yearMod}%`,
    };
  };

  const reportData = getDummyData(selectedYear);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Gram Panchayat Member Report
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Summary of member participation and documents
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
          <span className="text-sm text-gray-600 font-medium">
            Financial Year:
          </span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {financialYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <StatCard
          title="Total GP Members"
          value={reportData.totalMembers}
          change={`+${
            parseInt(selectedYear.substring(0, 4)) % 4
          } from previous year`}
          icon="👥"
        />
        <StatCard
          title="Meeting Attendance"
          value={`${reportData.attendanceRate}`}
          change={`${reportData.attendedMembers} members attended`}
          icon="✅"
        />
      </div>

      <div className="space-y-6">
        <ReportItem title="Financial Year" value={selectedYear} required />

        <ReportItem
          title={`Total Number of GP Members (including EX-Officio) in ${selectedYear}`}
          value={reportData.totalMembers}
          required
        />

        <ReportItem
          title={`Number of GP Members attended in Special General Body Meeting in ${selectedYear}`}
          value={reportData.attendedMembers}
          required
        />

        <DocumentItem
          title="Plan Approval Resolution Doc"
          format="PDF (Max 5 MB)"
          status={reportData.planApprovalStatus}
          required
          year={selectedYear}
        />

        <DocumentItem
          title="Total Member's Declaration"
          format="PDF (Max 5 MB)"
          status={reportData.declarationStatus}
          required
          year={selectedYear}
        />
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="font-medium text-gray-700 mb-2">Summary Notes</h3>
        <p className="text-sm text-gray-600">
          {reportData.planApprovalStatus === "Approved" &&
          reportData.declarationStatus === "Received"
            ? `All required documents for ${selectedYear} have been received and approved.`
            : `Pending documents for ${selectedYear}: ${[
                reportData.planApprovalStatus !== "Approved"
                  ? "Plan Approval"
                  : "",
                reportData.declarationStatus !== "Received"
                  ? "Member's Declaration"
                  : "",
              ]
                .filter(Boolean)
                .join(" and ")}`}{" "}
          Attendance rate for special meetings was {reportData.attendanceRate}.
        </p>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string | number;
  change: string;
  icon: string;
}) => (
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <span className="text-xl">{icon}</span>
    </div>
    <div className="mt-2">
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{change}</p>
    </div>
  </div>
);

// Report Item Component
const ReportItem = ({
  title,
  value,
  required,
}: {
  title: string;
  value: string | number;
  required?: boolean;
}) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4">
    <div className="flex-1">
      <h3 className="font-medium text-gray-700">
        {title} {required && <span className="text-red-500">*</span>}
      </h3>
    </div>
    <div className="sm:w-1/3 sm:text-right">
      <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
        {value}
      </span>
    </div>
  </div>
);

// Document Item Component
const DocumentItem = ({
  title,
  format,
  status,
  required,
  year,
}: {
  title: string;
  format: string;
  status: string;
  required?: boolean;
  year: string;
}) => {
  const statusColor =
    status === "Approved" || status === "Received"
      ? "bg-green-100 text-green-800"
      : status === "Pending"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";

  const statusText =
    status === "Approved" || status === "Received" ? "Available" : status;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4">
      <div className="flex-1">
        <h3 className="font-medium text-gray-700">
          {title} {required && <span className="text-red-500">*</span>}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{format}</p>
      </div>
      <div className="sm:w-1/3 sm:text-right">
        <span
          className={`inline-block ${statusColor} px-3 py-1 rounded-full text-sm font-medium`}
        >
          {statusText}
        </span>
        {(status === "Approved" || status === "Received") && (
          <button className="block mt-1 text-sm text-blue-600 hover:underline">
            Download {year} Document
          </button>
        )}
      </div>
    </div>
  );
};

export default FinancialReport;
