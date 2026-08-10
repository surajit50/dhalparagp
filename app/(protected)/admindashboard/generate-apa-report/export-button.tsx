"use client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";
import * as XLSX from "xlsx";

interface ExportButtonProps {
  reportData: Array<{
    slNo: number;
    workActivityId: number | string;
    sourceOfFund: string;
    schemeName?: string;
    workActivityName: string;
    nitNumber: number | string;
    nitDate: Date | null;
    workOrderIssueDate: Date | null;
    workOrderValue: number;
    paymentsInPeriod: number;
    periodPaymentDates?: string;
    completionDate: Date | null;
    workStatus: string;
    remarks: string;
    paymentsAfterPeriod: number;
    afterPeriodPaymentDates?: string;
    physicalCompletionPercentage: number | null;
    physicalCompletionDisplay: string;
  }>;
  paymentColumnHeader?: string;
  filename?: string;
}

export function ExportButton({
  reportData,
  paymentColumnHeader = "Payment made during April to June (INR)",
  filename = "WorkOrderFinancialReport.xlsx",
}: ExportButtonProps) {
  const handleExport = () => {
    // Prepare data for export
    const exportData = reportData.map((item) => ({
      "SL No": item.slNo,
      "Work/Activity ID": item.workActivityId,
      Scheme: item.schemeName || item.sourceOfFund,
      "Work/Activity Name": item.workActivityName,
      "NIT No": item.nitNumber,
      "NIT Date": item.nitDate ? format(item.nitDate, "dd/MM/yyyy") : "N/A",
      "Issue Date": item.workOrderIssueDate
        ? format(item.workOrderIssueDate, "dd/MM/yyyy")
        : "N/A",
      "Order Value (INR)": item.workOrderValue,
      [paymentColumnHeader]: item.paymentsInPeriod,
      "Payment Date(s) in Period": item.periodPaymentDates || "N/A",
      "Payment After Period (INR)": item.paymentsAfterPeriod,
      "Payment Date(s) After Period": item.afterPeriodPaymentDates || "N/A",
      "Completion Date": item.completionDate
        ? format(item.completionDate, "dd/MM/yyyy")
        : "",
      Status: item.workStatus,
      Remarks: item.remarks,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, filename);
  };

  return (
    <Button onClick={handleExport} className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      Export to Excel
    </Button>
  );
}

