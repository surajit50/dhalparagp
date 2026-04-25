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
    workActivityName: string;
    nitNumber: number | string;
    nitDate: Date | null;
    workOrderIssueDate: Date | null;
    workOrderValue: number;
    paymentsInPeriod: number;
    completionDate: Date | null;
    workStatus: string;
    remarks: string;
    paymentsAfterPeriod: number;
    physicalCompletionPercentage: number | null; // Added for export
    physicalCompletionDisplay: string; // Added for display (not directly used here, but part of data)
  }>;
}

export function ExportButton({ reportData }: ExportButtonProps) {
  const handleExport = () => {
    // Prepare data for export (flatten/format as needed)
    const exportData = reportData.map((item) => ({
      "SL No": item.slNo,
      "Work/Activity ID": item.workActivityId,
      Source: item.sourceOfFund,
      "Work/Activity Name": item.workActivityName,
      "NIT No": item.nitNumber,
      "NIT Date": item.nitDate ? format(item.nitDate, "dd/MM/yyyy") : "N/A",
      "Issue Date": item.workOrderIssueDate
        ? format(item.workOrderIssueDate, "dd/MM/yyyy")
        : "N/A",
      "Order Value": item.workOrderValue,
      "Gross Bills (Apr 24-Jun 25)": item.paymentsInPeriod,
      "Completion Date": item.completionDate
        ? format(item.completionDate, "dd/MM/yyyy")
        : "",
      Status: item.workStatus,
      Remarks: item.remarks,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "WorkOrderFinancialReport.xlsx");
  };

  return (
    <Button onClick={handleExport} className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      Export to Excel
    </Button>
  );
}
