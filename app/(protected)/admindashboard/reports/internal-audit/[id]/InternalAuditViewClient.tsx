"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Edit, FileText, Download } from "lucide-react";
import { exportAuditReportToWord } from "@/utils/exportAuditToWord";

interface InternalAuditViewProps {
  report: any;
}

export default function InternalAuditViewClient({ report }: InternalAuditViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = () => {
    exportAuditReportToWord(report);
  };

  const pastObs = report.pastObservations || [
    { type: "Financial- High", totalFindings: 0, findingsResolved: 0, findingsPending: 0 },
    { type: "Procedural- High", totalFindings: 0, findingsResolved: 0, findingsPending: 0 },
    { type: "Procedural- Low", totalFindings: 0, findingsResolved: 0, findingsPending: 0 },
    { type: "Documentary- High", totalFindings: 0, findingsResolved: 0, findingsPending: 0 },
    { type: "Documentary-Low", totalFindings: 0, findingsResolved: 0, findingsPending: 0 },
  ];

  const pastObsTotal = pastObs.reduce(
    (acc: any, cur: any) => ({
      total: acc.total + Number(cur.totalFindings || 0),
      resolved: acc.resolved + Number(cur.findingsResolved || 0),
      pending: acc.pending + Number(cur.findingsPending || 0),
    }),
    { total: 0, resolved: 0, pending: 0 }
  );

  const pendingCompliances = report.pendingCompliances || [];
  const reportSummaries = report.reportSummaries || [];
  const observations = report.observations || [];
  const gpMembers = report.gpMembersCount || {
    maleElected: 0,
    femaleElected: 0,
    maleExOfficio: 0,
    femaleExOfficio: 0,
  };
  const upaSamiti = report.upaSamitiDetails || [];
  const gpStaff = report.gpStaffDetails || [];
  const fundUsage = report.fundUsage || { tiedFund: 0, untiedFund: 0, amountUtilised: 0, percentageUtilised: 0 };
  const procurementList = report.procurementList || [];
  const otherExpenditure = report.otherExpenditureList || [];
  const propertyTax = report.propertyTaxOSR || {};
  const tradeLicence = report.tradeLicenceOSR || {};
  const otherInfo = report.otherInfoStats || {};

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white text-gray-900 text-sm">
      {/* Top Toolbar (Hidden on Print) */}
      <div className="print:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admindashboard/reports/internal-audit">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Reports
            </Button>
          </Link>
          <div className="h-5 w-px bg-gray-300" />
          <h1 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Internal Audit Report: <span className="text-blue-700">{report.reportNo}</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleExportWord} variant="outline" size="sm" className="gap-2 text-blue-700 border-blue-300 hover:bg-blue-50">
            <Download className="h-4 w-4" /> Export MS Word (.doc)
          </Button>
          <Link href={`/admindashboard/reports/internal-audit/${report.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" /> Edit Report
            </Button>
          </Link>
          <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Printer className="h-4 w-4" /> Print Annexure 7
          </Button>
        </div>
      </div>

      {/* Main Printable Document Area */}
      <div className="max-w-5xl mx-auto p-8 print:p-0 print:max-w-none bg-white border print:border-none shadow-md print:shadow-none my-6 print:my-0">
        
        {/* Document Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold border-b-2 border-black pb-1 inline-block">
            Annexure 7: Format of Internal Audit Report
          </h2>
        </div>

        {/* PART I: General Information */}
        <div className="mb-6">
          <div className="bg-gray-100 font-bold border border-black px-3 py-1.5 text-center text-base uppercase">
            Part I: General Information (Optional)
          </div>

          <table className="w-full border-collapse border border-black text-xs mt-1">
            <tbody>
              <tr className="bg-gray-50 font-bold">
                <td colSpan={2} className="border border-black px-2 py-1">Auditee’s Profile</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 w-1/3 font-semibold">1. Report No.</td>
                <td className="border border-black px-2 py-1 font-mono">{report.reportNo}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-semibold">2. Name of the GP</td>
                <td className="border border-black px-2 py-1">{report.gpName}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-semibold">3. Block and district</td>
                <td className="border border-black px-2 py-1">{report.blockAndDistrict}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-semibold">4. Risk Category of the GP</td>
                <td className="border border-black px-2 py-1">{report.riskCategory}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-semibold">5. Address & Telephone no. of GP</td>
                <td className="border border-black px-2 py-1">{report.gpAddressAndPhone}</td>
              </tr>

              <tr className="bg-gray-50 font-bold">
                <td colSpan={2} className="border border-black px-2 py-1">Auditor’s Profile</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-semibold">1. Name of audit party members</td>
                <td className="border border-black px-2 py-1">{report.auditPartyMembers || "-"}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-semibold">2. Contact no. of audit party members</td>
                <td className="border border-black px-2 py-1">{report.auditPartyContact || "-"}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-semibold">3. E-Mail ID of audit party members</td>
                <td className="border border-black px-2 py-1">{report.auditPartyEmail || "-"}</td>
              </tr>

              <tr className="bg-gray-50 font-bold">
                <td colSpan={2} className="border border-black px-2 py-1">Audit Profile</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-semibold">1. Audit Period</td>
                <td className="border border-black px-2 py-1">{report.auditPeriod || `${report.quarter} (${report.financialYear})`}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-semibold">2. Duration of audit</td>
                <td className="border border-black px-2 py-1">{report.auditDuration || "-"}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-semibold">3. Total findings</td>
                <td className="border border-black px-2 py-1 font-bold">{report.totalFindings || observations.length}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PART II: Summary of past observations */}
        <div className="mb-6 page-break-inside-avoid">
          <div className="bg-gray-100 font-bold border border-black px-3 py-1.5 text-center text-sm uppercase">
            Part II: Summary of past observations
          </div>
          <table className="w-full border-collapse border border-black text-xs mt-1 text-center">
            <thead>
              <tr className="bg-gray-50 font-bold">
                <th className="border border-black px-2 py-1 text-left">Types</th>
                <th className="border border-black px-2 py-1">Total findings</th>
                <th className="border border-black px-2 py-1">Findings resolved</th>
                <th className="border border-black px-2 py-1">Findings pending for compliance</th>
              </tr>
            </thead>
            <tbody>
              {pastObs.map((obs: any, idx: number) => (
                <tr key={idx}>
                  <td className="border border-black px-2 py-1 text-left font-medium">{obs.type}</td>
                  <td className="border border-black px-2 py-1">{obs.totalFindings}</td>
                  <td className="border border-black px-2 py-1">{obs.findingsResolved}</td>
                  <td className="border border-black px-2 py-1">{obs.findingsPending}</td>
                </tr>
              ))}
              <tr className="font-bold bg-gray-100">
                <td className="border border-black px-2 py-1 text-left">Total</td>
                <td className="border border-black px-2 py-1">{pastObsTotal.total}</td>
                <td className="border border-black px-2 py-1">{pastObsTotal.resolved}</td>
                <td className="border border-black px-2 py-1">{pastObsTotal.pending}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PART III: Pending Internal and ELA Audit Compliance */}
        <div className="mb-6 page-break-inside-avoid">
          <div className="bg-gray-100 font-bold border border-black px-3 py-1.5 text-center text-sm uppercase">
            Part III: Pending Internal and ELA Audit Compliance
          </div>
          <table className="w-full border-collapse border border-black text-xs mt-1 text-center">
            <thead>
              <tr className="bg-gray-50 font-bold">
                <th className="border border-black px-1 py-1 w-10">S. No.</th>
                <th className="border border-black px-2 py-1">Report no & year</th>
                <th className="border border-black px-2 py-1">Finding No.</th>
                <th className="border border-black px-2 py-1 text-left">Brief Description of Finding</th>
                <th className="border border-black px-2 py-1">Type</th>
                <th className="border border-black px-2 py-1">Importance</th>
                <th className="border border-black px-2 py-1">Amount</th>
                <th className="border border-black px-2 py-1 text-left">Action to be taken</th>
              </tr>
            </thead>
            <tbody>
              {pendingCompliances.length > 0 ? (
                pendingCompliances.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border border-black px-1 py-1">{idx + 1}</td>
                    <td className="border border-black px-2 py-1">{item.reportNoAndYear}</td>
                    <td className="border border-black px-2 py-1">{item.findingNo}</td>
                    <td className="border border-black px-2 py-1 text-left">{item.description}</td>
                    <td className="border border-black px-2 py-1">{item.type}</td>
                    <td className="border border-black px-2 py-1">{item.importance}</td>
                    <td className="border border-black px-2 py-1">{item.amount}</td>
                    <td className="border border-black px-2 py-1 text-left">{item.actionToBeTaken}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="border border-black px-2 py-2 text-gray-500 italic">
                    No pending compliance records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PART IV: Report Summary Form */}
        <div className="mb-6 page-break-inside-avoid">
          <div className="bg-gray-100 font-bold border border-black px-3 py-1.5 text-center text-sm uppercase">
            Part IV: Report Summary Form
          </div>
          <table className="w-full border-collapse border border-black text-xs mt-1 text-center">
            <thead>
              <tr className="bg-gray-50 font-bold">
                <th className="border border-black px-2 py-1 w-20">Finding No.</th>
                <th className="border border-black px-2 py-1 text-left">Area (procurement/ revenue/ BOA etc.)</th>
                <th className="border border-black px-2 py-1 text-left">Title</th>
                <th className="border border-black px-2 py-1">Type (Financial/ procedural/ documentary)</th>
                <th className="border border-black px-2 py-1">Importance (High/Low)</th>
                <th className="border border-black px-2 py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {reportSummaries.length > 0 ? (
                reportSummaries.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border border-black px-2 py-1 font-semibold">{item.findingNo}</td>
                    <td className="border border-black px-2 py-1 text-left">{item.area}</td>
                    <td className="border border-black px-2 py-1 text-left">{item.title}</td>
                    <td className="border border-black px-2 py-1">{item.type}</td>
                    <td className="border border-black px-2 py-1">{item.importance}</td>
                    <td className="border border-black px-2 py-1">{item.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="border border-black px-2 py-2 text-gray-500 italic">
                    No summary entries recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PART V: Observations */}
        <div className="mb-6">
          <div className="bg-gray-100 font-bold border border-black px-3 py-1.5 text-center text-sm uppercase mb-2">
            Part V: Observations
          </div>

          {["Financial finding", "Procedural finding", "Documentary finding"].map((category, catIdx) => {
            const catObs = observations.filter((o: any) => o.type === category);
            return (
              <div key={catIdx} className="mb-4">
                <div className="bg-gray-50 font-bold border border-black px-3 py-1 text-xs uppercase">
                  {category}
                </div>
                {catObs.length > 0 ? (
                  catObs.map((obs: any, idx: number) => (
                    <div key={idx} className="border border-black border-t-0 p-2 text-xs space-y-1">
                      <div className="flex font-bold justify-between border-b pb-1">
                        <span>Finding #{obs.findingNo || idx + 1}: {obs.title}</span>
                        <span className="text-gray-600">[{obs.importance} Importance]</span>
                      </div>
                      <div><span className="font-semibold">Area:</span> {obs.area}</div>
                      <div><span className="font-semibold">Description of the finding:</span> {obs.description}</div>
                      <div><span className="font-semibold">Corrective action to be taken:</span> {obs.correctiveAction}</div>
                      <div><span className="font-semibold">GP Response:</span> {obs.gpResponse || "Nil"}</div>
                    </div>
                  ))
                ) : (
                  <div className="border border-black border-t-0 p-2 text-xs text-gray-500 italic">
                    No {category.toLowerCase()}s reported.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* PART V: Additional Information */}
        <div className="mb-6">
          <div className="bg-gray-100 font-bold border border-black px-3 py-1.5 text-center text-sm uppercase mb-3">
            Part V: Additional Information
          </div>

          {/* 1. Total number of members in GP */}
          <div className="mb-4 page-break-inside-avoid">
            <h4 className="font-bold text-xs mb-1">1. Total number of members in GP</h4>
            <table className="w-full border-collapse border border-black text-xs text-center">
              <thead>
                <tr className="bg-gray-50 font-bold">
                  <th className="border border-black px-2 py-1 text-left">Category</th>
                  <th className="border border-black px-2 py-1">Male</th>
                  <th className="border border-black px-2 py-1">Female</th>
                  <th className="border border-black px-2 py-1">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black px-2 py-1 text-left font-medium">Directly Elected Member</td>
                  <td className="border border-black px-2 py-1">{gpMembers.maleElected || 0}</td>
                  <td className="border border-black px-2 py-1">{gpMembers.femaleElected || 0}</td>
                  <td className="border border-black px-2 py-1 font-bold">{(gpMembers.maleElected || 0) + (gpMembers.femaleElected || 0)}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1 text-left font-medium">Ex-Officio Member</td>
                  <td className="border border-black px-2 py-1">{gpMembers.maleExOfficio || 0}</td>
                  <td className="border border-black px-2 py-1">{gpMembers.femaleExOfficio || 0}</td>
                  <td className="border border-black px-2 py-1 font-bold">{(gpMembers.maleExOfficio || 0) + (gpMembers.femaleExOfficio || 0)}</td>
                </tr>
                <tr className="font-bold bg-gray-100">
                  <td className="border border-black px-2 py-1 text-left">Total</td>
                  <td className="border border-black px-2 py-1">{(gpMembers.maleElected || 0) + (gpMembers.maleExOfficio || 0)}</td>
                  <td className="border border-black px-2 py-1">{(gpMembers.femaleElected || 0) + (gpMembers.femaleExOfficio || 0)}</td>
                  <td className="border border-black px-2 py-1">{(gpMembers.maleElected || 0) + (gpMembers.femaleElected || 0) + (gpMembers.maleExOfficio || 0) + (gpMembers.femaleExOfficio || 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. Details of Upa-Samiti */}
          <div className="mb-4 page-break-inside-avoid">
            <h4 className="font-bold text-xs mb-1">2. Details of Upa-Samiti</h4>
            <table className="w-full border-collapse border border-black text-xs text-center">
              <thead>
                <tr className="bg-gray-50 font-bold">
                  <th className="border border-black px-2 py-1 text-left">Upa-Samiti</th>
                  <th className="border border-black px-2 py-1">No. of Members Directly nominated</th>
                  <th className="border border-black px-2 py-1">No. of Designated Member</th>
                  <th className="border border-black px-2 py-1 text-left">Name of Sanchalak</th>
                  <th className="border border-black px-2 py-1">No. of meetings held</th>
                </tr>
              </thead>
              <tbody>
                {upaSamiti.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border border-black px-2 py-1 text-left font-medium">{item.name}</td>
                    <td className="border border-black px-2 py-1">{item.directMembers || 0}</td>
                    <td className="border border-black px-2 py-1">{item.designatedMembers || 0}</td>
                    <td className="border border-black px-2 py-1 text-left">{item.sanchalakName || "-"}</td>
                    <td className="border border-black px-2 py-1">{item.meetingsHeld || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3. Designation-wise details of GP staff */}
          <div className="mb-4 page-break-inside-avoid">
            <h4 className="font-bold text-xs mb-1">3. Designation-wise details of GP staff</h4>
            <table className="w-full border-collapse border border-black text-xs text-center">
              <thead>
                <tr className="bg-gray-50 font-bold">
                  <th className="border border-black px-2 py-1 text-left">Gram Panchayat</th>
                  <th className="border border-black px-2 py-1 text-left">Male-Name</th>
                  <th className="border border-black px-2 py-1 text-left">Female- Name</th>
                  <th className="border border-black px-2 py-1">Salary(optional)</th>
                </tr>
              </thead>
              <tbody>
                {gpStaff.map((staff: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border border-black px-2 py-1 text-left font-medium">{staff.designation}</td>
                    <td className="border border-black px-2 py-1 text-left">{staff.maleName || "-"}</td>
                    <td className="border border-black px-2 py-1 text-left">{staff.femaleName || "-"}</td>
                    <td className="border border-black px-2 py-1">{staff.salary || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. Use of fund in the audit year */}
          <div className="mb-4 page-break-inside-avoid">
            <h4 className="font-bold text-xs mb-1">4. Use of fund in the audit year</h4>
            <table className="w-full border-collapse border border-black text-xs text-center">
              <thead>
                <tr className="bg-gray-50 font-bold">
                  <th className="border border-black px-2 py-1">Tied Fund (Rs.)</th>
                  <th className="border border-black px-2 py-1">Untied Fund (Rs.)</th>
                  <th className="border border-black px-2 py-1">Amount utilised (Rs.)</th>
                  <th className="border border-black px-2 py-1">Percentage of amount utilised (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black px-2 py-1">{fundUsage.tiedFund || 0}</td>
                  <td className="border border-black px-2 py-1">{fundUsage.untiedFund || 0}</td>
                  <td className="border border-black px-2 py-1">{fundUsage.amountUtilised || 0}</td>
                  <td className="border border-black px-2 py-1 font-bold">{fundUsage.percentageUtilised || 0}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 5. Procurement */}
          <div className="mb-4 page-break-inside-avoid">
            <h4 className="font-bold text-xs mb-1">5. Procurement</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-black text-[10px] text-center">
                <thead>
                  <tr className="bg-gray-50 font-bold">
                    <th className="border border-black px-1 py-1">Sl. No.</th>
                    <th className="border border-black px-1 py-1">Fund</th>
                    <th className="border border-black px-1 py-1">NIT No.</th>
                    <th className="border border-black px-1 py-1">Date of NIT</th>
                    <th className="border border-black px-1 py-1 text-left">Activity Name</th>
                    <th className="border border-black px-1 py-1">Type of procurement</th>
                    <th className="border border-black px-1 py-1">Type of Work</th>
                    <th className="border border-black px-1 py-1">Estimated Value</th>
                    <th className="border border-black px-1 py-1">Contract Value</th>
                    <th className="border border-black px-1 py-1">Contract Date</th>
                    <th className="border border-black px-1 py-1">Bill Value</th>
                    <th className="border border-black px-1 py-1">Plan Plus Value</th>
                    <th className="border border-black px-1 py-1">Sample (Y/N)</th>
                  </tr>
                </thead>
                <tbody>
                  {procurementList.length > 0 ? (
                    procurementList.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="border border-black px-1 py-1">{idx + 1}</td>
                        <td className="border border-black px-1 py-1">{item.fund}</td>
                        <td className="border border-black px-1 py-1">{item.nitNo}</td>
                        <td className="border border-black px-1 py-1">{item.nitDate}</td>
                        <td className="border border-black px-1 py-1 text-left">{item.activityName}</td>
                        <td className="border border-black px-1 py-1">{item.typeOfProcurement}</td>
                        <td className="border border-black px-1 py-1">{item.typeOfWork}</td>
                        <td className="border border-black px-1 py-1">{item.estimatedValue}</td>
                        <td className="border border-black px-1 py-1">{item.contractValue}</td>
                        <td className="border border-black px-1 py-1">{item.contractDate}</td>
                        <td className="border border-black px-1 py-1">{item.billValue}</td>
                        <td className="border border-black px-1 py-1">{item.planPlusValue}</td>
                        <td className="border border-black px-1 py-1">{item.sample || "N"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={13} className="border border-black px-2 py-2 text-gray-500 italic">
                        No procurement items recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. Other expenditure (Optional) */}
          <div className="mb-4 page-break-inside-avoid">
            <h4 className="font-bold text-xs mb-1">6. Other expenditure (Optional)</h4>
            <table className="w-full border-collapse border border-black text-xs text-center">
              <thead>
                <tr className="bg-gray-50 font-bold">
                  <th className="border border-black px-1 py-1 w-10">Sl. No</th>
                  <th className="border border-black px-2 py-1">Fund</th>
                  <th className="border border-black px-2 py-1">Voucher No.</th>
                  <th className="border border-black px-2 py-1">Voucher Date</th>
                  <th className="border border-black px-2 py-1">Expenditure type</th>
                  <th className="border border-black px-2 py-1 text-left">Description</th>
                  <th className="border border-black px-2 py-1">Amount (Rs.)</th>
                  <th className="border border-black px-2 py-1">Sample (Y/N)</th>
                </tr>
              </thead>
              <tbody>
                {otherExpenditure.length > 0 ? (
                  otherExpenditure.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="border border-black px-1 py-1">{idx + 1}</td>
                      <td className="border border-black px-2 py-1">{item.fund}</td>
                      <td className="border border-black px-2 py-1">{item.voucherNo}</td>
                      <td className="border border-black px-2 py-1">{item.voucherDate}</td>
                      <td className="border border-black px-2 py-1">{item.expenditureType}</td>
                      <td className="border border-black px-2 py-1 text-left">{item.description}</td>
                      <td className="border border-black px-2 py-1">{item.amount}</td>
                      <td className="border border-black px-2 py-1">{item.sample || "N"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="border border-black px-2 py-2 text-gray-500 italic">
                      No other expenditure entries recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 7. Own source revenue- Property Tax */}
          <div className="mb-4 page-break-inside-avoid">
            <h4 className="font-bold text-xs mb-1">7. Own source revenue- Property Tax</h4>
            <table className="w-full border-collapse border border-black text-xs text-center">
              <thead>
                <tr className="bg-gray-50 font-bold">
                  <th className="border border-black px-1 py-1">No. of Assesses</th>
                  <th className="border border-black px-1 py-1">Arrears (Rs.)</th>
                  <th className="border border-black px-1 py-1">Current Year Demand (Rs.)</th>
                  <th className="border border-black px-1 py-1">Total Receivable (Rs.)</th>
                  <th className="border border-black px-1 py-1">Arrears collected (Rs.)</th>
                  <th className="border border-black px-1 py-1">CY demand collected (Rs.)</th>
                  <th className="border border-black px-1 py-1">Total collection (Rs.)</th>
                  <th className="border border-black px-1 py-1">Pending amount (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black px-1 py-1">{propertyTax.noOfAssesses || 0}</td>
                  <td className="border border-black px-1 py-1">{propertyTax.arrears || 0}</td>
                  <td className="border border-black px-1 py-1">{propertyTax.currentYearDemand || 0}</td>
                  <td className="border border-black px-1 py-1">{propertyTax.totalReceivable || 0}</td>
                  <td className="border border-black px-1 py-1">{propertyTax.arrearsCollected || 0}</td>
                  <td className="border border-black px-1 py-1">{propertyTax.cyDemandCollected || 0}</td>
                  <td className="border border-black px-1 py-1 font-bold">{propertyTax.totalCollection || 0}</td>
                  <td className="border border-black px-1 py-1 font-bold text-red-700 print:text-black">{propertyTax.pendingAmount || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 8. Own source revenue- Tradelicence */}
          <div className="mb-4 page-break-inside-avoid">
            <h4 className="font-bold text-xs mb-1">8. Own source revenue- Tradelicence</h4>
            <table className="w-full border-collapse border border-black text-xs text-center">
              <thead>
                <tr className="bg-gray-50 font-bold">
                  <th className="border border-black px-1 py-1">No. of Assesses</th>
                  <th className="border border-black px-1 py-1">Arrears (Rs.)</th>
                  <th className="border border-black px-1 py-1">Current Year Demand (Rs.)</th>
                  <th className="border border-black px-1 py-1">Total Receivable (Rs.)</th>
                  <th className="border border-black px-1 py-1">Arrears collected (Rs.)</th>
                  <th className="border border-black px-1 py-1">CY demand collected (Rs.)</th>
                  <th className="border border-black px-1 py-1">Total collection (Rs.)</th>
                  <th className="border border-black px-1 py-1">Pending amount (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black px-1 py-1">{tradeLicence.noOfAssesses || 0}</td>
                  <td className="border border-black px-1 py-1">{tradeLicence.arrears || 0}</td>
                  <td className="border border-black px-1 py-1">{tradeLicence.currentYearDemand || 0}</td>
                  <td className="border border-black px-1 py-1">{tradeLicence.totalReceivable || 0}</td>
                  <td className="border border-black px-1 py-1">{tradeLicence.arrearsCollected || 0}</td>
                  <td className="border border-black px-1 py-1">{tradeLicence.cyDemandCollected || 0}</td>
                  <td className="border border-black px-1 py-1 font-bold">{tradeLicence.totalCollection || 0}</td>
                  <td className="border border-black px-1 py-1 font-bold text-red-700 print:text-black">{tradeLicence.pendingAmount || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 9. Other information (Optional) */}
          <div className="mb-6 page-break-inside-avoid">
            <h4 className="font-bold text-xs mb-1">9. Other information (Optional)</h4>
            <table className="w-full border-collapse border border-black text-xs">
              <tbody>
                <tr>
                  <td className="border border-black px-3 py-1 font-semibold w-2/3">Total population</td>
                  <td className="border border-black px-3 py-1 text-center font-bold">{otherInfo.totalPopulation || 0}</td>
                </tr>
                <tr>
                  <td className="border border-black px-3 py-1 font-semibold">No. of death certificate issued</td>
                  <td className="border border-black px-3 py-1 text-center">{otherInfo.deathCertificatesIssued || 0}</td>
                </tr>
                <tr>
                  <td className="border border-black px-3 py-1 font-semibold">No. of birth certificate issued</td>
                  <td className="border border-black px-3 py-1 text-center">{otherInfo.birthCertificatesIssued || 0}</td>
                </tr>
                <tr>
                  <td className="border border-black px-3 py-1 font-semibold">No. of trade licence issued</td>
                  <td className="border border-black px-3 py-1 text-center">{otherInfo.tradeLicencesIssued || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* PART VI: Supporting documents & Signature */}
        <div className="pt-4 border-t border-black page-break-inside-avoid space-y-6">
          <div className="font-semibold text-xs">
            Part VI: Attach all the supporting documents collected from the GP
          </div>

          <div className="flex justify-between items-end pt-12 text-xs">
            <div>
              <div className="font-bold">Signature of the Internal Audit Officer</div>
            </div>
            <div className="space-y-3 text-right">
              <div>Designation: <span className="underline font-medium min-w-[200px] inline-block text-left">{report.auditorDesignation || "Internal Audit Officer"}</span></div>
              <div>Office Address: <span className="underline font-medium min-w-[200px] inline-block text-left">{report.auditorOfficeAddress || "Office of the BDO, Hilli"}</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
