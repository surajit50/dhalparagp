"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { getAllSavedEnquiryReports } from "@/action/enquiryReportAction";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, FileText } from "lucide-react";
import Link from "next/link";

export default function EnquiryReportReprintClient() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const data = await getAllSavedEnquiryReports();
        setReports(data);
      } catch (error) {
        console.error("Failed to fetch reports", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            Saved Enquiry Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and reprint previously saved Enquiry Reports.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>Select a report to reprint or modify.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading reports...</p>
          ) : reports.length === 0 ? (
            <p className="text-muted-foreground">No saved reports found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-sm font-medium text-muted-foreground">
                    <th className="p-4">Warish Ref No</th>
                    <th className="p-4">Deceased Name</th>
                    <th className="p-4">Applicant</th>
                    <th className="p-4">Report Memo No</th>
                    <th className="p-4">Saved Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{report.warishApplication?.warishRefNo || 'Standalone'}</td>
                      <td className="p-4">{report.warishApplication?.nameOfDeceased || report.personName || 'N/A'}</td>
                      <td className="p-4">{report.warishApplication?.applicantName || 'Manual Entry'}</td>
                      <td className="p-4">{report.memoNo || 'Draft'}</td>
                      <td className="p-4">{format(new Date(report.updatedAt), "dd MMM yyyy, hh:mm a")}</td>
                      <td className="p-4 text-right">
                        <Link href={
                          report.warishApplication 
                            ? `/admindashboard/enquiry-report?refNo=${encodeURIComponent(report.warishApplication.warishRefNo || report.warishApplication.acknowlegment || '')}`
                            : `/admindashboard/enquiry-report?reportId=${report.id}`
                        }>
                          <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                            <Printer className="w-4 h-4 mr-2" />
                            Load & Reprint
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
