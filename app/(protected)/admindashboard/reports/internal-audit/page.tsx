import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Printer, Edit, Eye, FileText, Calendar, AlertCircle } from "lucide-react";
import { getInternalAuditReports } from "@/action/internal-audit-actions";
import { DeleteAuditReportButton } from "./_components/DeleteAuditReportButton";


export const metadata = {
  title: "Quarterly Internal Audit Reports | Admin Dashboard",
};

export default async function InternalAuditReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;
  const financialYear = (resolved?.financialYear as string) || "all";
  const quarter = (resolved?.quarter as string) || "all";

  const result = await getInternalAuditReports(financialYear, quarter);
  const reports = result.success ? result.data : [];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-indigo-800 text-white p-6 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-300" />
            Quarterly Internal Audit Reports
          </h1>
          <p className="text-blue-100 text-sm mt-1">
            Prepare, view, and print official Annexure 7 Gram Panchayat Quarterly Internal Audit Reports.
          </p>
        </div>

        <Link href="/admindashboard/reports/internal-audit/new">
          <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2 shadow-md">
            <Plus className="h-5 w-5" /> New Internal Audit Report
          </Button>
        </Link>
      </div>

      {/* Reports Grid / Table */}
      {reports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">No Internal Audit Reports Found</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                No quarterly internal audit report records have been prepared yet. Click below to create your first report.
              </p>
            </div>
            <Link href="/admindashboard/reports/internal-audit/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Plus className="h-4 w-4" /> Create First Report
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report: any) => (
            <Card key={report.id} className="hover:shadow-lg transition-all duration-200 border-gray-200">
              <CardHeader className="pb-3 border-b bg-slate-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                      {report.quarter}
                    </span>
                    <h3 className="font-bold text-gray-800 text-lg mt-1">{report.reportNo}</h3>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${report.status === "Finalized"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                      }`}
                  >
                    {report.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">Financial Year:</span>
                  <span className="font-bold text-gray-800">{report.financialYear}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">GP Name:</span>
                  <span className="text-gray-800">{report.gpName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">Audit Period:</span>
                  <span className="text-gray-800">{report.auditPeriod || report.quarter}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">Total Findings:</span>
                  <span className="font-bold text-blue-700">{report.totalFindings || 0}</span>
                </div>

                <div className="pt-4 border-t flex items-center justify-between gap-2">
                  <Link href={`/admindashboard/reports/internal-audit/${report.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                      <Printer className="h-3.5 w-3.5 text-blue-600" /> Print Annexure 7
                    </Button>
                  </Link>

                  <Link href={`/admindashboard/reports/internal-audit/${report.id}/edit`}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-600">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>

                  <DeleteAuditReportButton reportId={report.id} reportNo={report.reportNo} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
