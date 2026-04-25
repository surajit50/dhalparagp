"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import WorksTable from "./WorksTable";
import { IndianRupee, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface WorkItem {
  id: string;
  nitDetails: {
    id: string;
    memoDate: Date;
    memoNumber: number;
    isSupply: boolean;
    supplyitemname: string | null;
    publishingDate: Date;
    documentDownloadFrom: Date;
    startTime: Date;
    updatedAt: Date;
  };
  workslno: number;
  paymentDetails: Array<{
    grossBillAmount: number;
    billType: string;
  }>;
  ApprovedActionPlanDetails: {
    activityCode: string;
    activityDescription: string;
    schemeName: string;
  } | null;
  AwardofContract: {
    workorderdetails: Array<{
      Bidagency: {
        biddingAmount: number | null;
        agencydetails: {
          name: string;
        };
      } | null;
    }>;
  } | null;
  workStatus: string;
  finalEstimateAmount: string;
  totalPaid: number;
  pending: number;
  financialYear: string;
  formattedNit: string;
}

interface WorksTabsProps {
  works: WorkItem[];
  selectedFundType?: string;
  selectedYear?: string;
}

export default function WorksTabs({
  works,
  selectedFundType,
  selectedYear,
}: WorksTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "all";

  // Process works data
  const processedWorks = works.map((work) => {
    const totalPaid = work.paymentDetails.reduce(
      (sum, payment) => sum + (payment.grossBillAmount || 0),
      0,
    );
    const estimatedCost = Number(work.finalEstimateAmount) || 0;
    const hasFinalBill = work.paymentDetails.some((p) =>
      p.billType.toLowerCase().includes("final bill"),
    );
    const pending = hasFinalBill ? 0 : estimatedCost - totalPaid;

    return {
      ...work,
      totalPaid,
      pending,
      isPaid: pending === 0 || hasFinalBill,
    };
  });

  // Further filter by fund type if selected
  const worksByFund = selectedFundType
    ? processedWorks.filter(
        (work) =>
          work.ApprovedActionPlanDetails?.schemeName === selectedFundType,
      )
    : processedWorks;

  // Filter works based on tab
  const filteredWorks = worksByFund.filter((work) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return !work.isPaid && work.pending > 0;
    if (activeTab === "paid") return work.isPaid || work.pending === 0;
    return true;
  });

  // Calculate summary
  const summary = filteredWorks.reduce(
    (acc, work) => {
      const memo = work.nitDetails.memoNumber.toString();
      if (!acc[memo]) {
        acc[memo] = {
          totalPaid: 0,
          totalPending: 0,
          nitDate: work.nitDetails.memoDate,
          financialYear: work.financialYear,
          formattedNit: work.formattedNit,
        };
      }
      acc[memo].totalPaid += work.totalPaid;
      acc[memo].totalPending += work.pending;
      return acc;
    },
    {} as Record<
      string,
      {
        totalPaid: number;
        totalPending: number;
        nitDate: Date;
        financialYear: string;
        formattedNit: string;
      }
    >,
  );

  // Grand totals
  const nitEntries = Object.entries(summary);
  const grandTotalPaid = nitEntries.reduce(
    (sum, [, data]) => sum + data.totalPaid,
    0,
  );
  const grandTotalPending = nitEntries.reduce(
    (sum, [, data]) => sum + data.totalPending,
    0,
  );

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`);
  };

  const generatePDF = () => {
    const doc = new jsPDF("landscape");
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const date = new Date().toLocaleString("en-IN");

    // Helper to draw header
    const drawHeader = (data: any) => {
      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.setFont("helvetica", "bold");
      doc.text("DHALPARA GRAM PANCHAYAT", pageWidth / 2, 15, {
        align: "center",
      });

      doc.setFontSize(12);
      doc.text(
        `Works Status Report - ${activeTab.toUpperCase()}`,
        pageWidth / 2,
        22,
        { align: "center" },
      );

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const filterText = [
        `Financial Year: ${selectedYear || "All"}`,
        `Fund Type: ${selectedFundType || "All"}`,
      ].join(" | ");
      doc.text(filterText, pageWidth / 2, 28, { align: "center" });

      doc.setDrawColor(200);
      doc.line(14, 32, pageWidth - 14, 32);
    };

    // Helper to draw footer
    const drawFooter = (data: any) => {
      const str = `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(str, pageWidth - 14, pageHeight - 10, { align: "right" });
      doc.text(`Generated on: ${date}`, 14, pageHeight - 10);
    };

    // Prepare table data
    const tableData = filteredWorks.map((work) => [
      work.formattedNit,
      work.workslno,
      work.ApprovedActionPlanDetails?.activityCode || "N/A",
      work.ApprovedActionPlanDetails?.schemeName || "N/A",
      work.ApprovedActionPlanDetails?.activityDescription || "N/A",
      work.AwardofContract?.workorderdetails[0]?.Bidagency?.agencydetails
        ?.name || "N/A",
      work.workStatus,
      (
        work.AwardofContract?.workorderdetails[0]?.Bidagency?.biddingAmount || 0
      ).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }),
    ]);

    // Main Works Table
    autoTable(doc, {
      head: [
        [
          "NIT No.",
          "SL",
          "Activity Code",
          "Scheme / Fund",
          "Work Description",
          "Agency Name",
          "Current Status",
          "Amount (₹)",
        ],
      ],
      body: tableData,
      startY: 35,
      theme: "grid",
      headStyles: {
        fillColor: [26, 54, 93], // Deep blue
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: "middle",
        overflow: "linebreak",
      },
      columnStyles: {
        0: { cellWidth: 25 }, // NIT
        1: { cellWidth: 10, halign: "center" }, // SL
        2: { cellWidth: 35 }, // Activity Code
        3: { cellWidth: 30 }, // Scheme
        4: { cellWidth: 80 }, // Description
        5: { cellWidth: 40 }, // Agency
        6: { cellWidth: 25, halign: "center" }, // Status
        7: { cellWidth: 30, halign: "right" }, // Amount
      },
      margin: { top: 15 },
      didDrawPage: (data) => {
        if (data.pageNumber === 1) {
          drawHeader(data);
        }
        drawFooter(data);
      },
      didParseCell: (data) => {
        if (data.section === "body") {
          const status = (data.row.raw as any)[6];
          if (status) {
            const s = status.toString().toLowerCase();
            if (s === "workcompleted")
              data.cell.styles.fillColor = [240, 253, 244]; // Success light
            else if (s === "billpaid")
              data.cell.styles.fillColor = [239, 246, 255]; // Info light
            else if (s === "yettostart")
              data.cell.styles.fillColor = [254, 242, 242]; // Danger light
          }
        }
      },
    });

    // Summary Section
    let finalY = (doc as any).lastAutoTable.finalY + 15;

    // Check if summary fits on page, otherwise add page
    if (finalY > pageHeight - 60) {
      doc.addPage();
      finalY = 15;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40);
    doc.text("SUMMARY BY NIT", 14, finalY);
    finalY += 6;

    const summaryData: any[][] = Object.entries(summary).map(([memo, data]) => [
      memo,
      data.formattedNit,
      data.financialYear,
      data.totalPaid.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    ]);

    // Add grand total row
    summaryData.push([
      {
        content: "GRAND TOTAL",
        colSpan: 3,
        styles: {
          halign: "right",
          fontStyle: "bold",
          fillColor: [241, 245, 249],
        },
      },
      {
        content: grandTotalPaid.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        styles: {
          halign: "right",
          fontStyle: "bold",
          fillColor: [241, 245, 249],
        },
      },
    ]);

    autoTable(doc, {
      body: summaryData,
      startY: finalY,
      theme: "grid",
      head: [["Memo No.", "NIT Date", "FY", "Total Paid (₹)"]],
      headStyles: {
        fillColor: [71, 85, 105], // Slate gray
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center" },
        1: { halign: "center" },
        2: { halign: "center" },
        3: { halign: "right" },
      },
      styles: { fontSize: 10, cellPadding: 3 },
      didDrawPage: (data) => {
        drawFooter(data);
      },
    });

    const fileName = `Works_Report_${activeTab}_${date.replace(/[/, :]/g, "_")}.pdf`;
    doc.save(fileName);
  };

  // Empty state
  if (filteredWorks.length === 0) {
    return (
      <div>
        <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>

          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center bg-blue-100 rounded-full p-4 mb-4">
              <IndianRupee className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Works Found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Try adjusting your filters or check back later for new entries.
            </p>
          </div>
        </Tabs>
      </div>
    );
  }

  return (
    <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>

        <Button onClick={generatePDF} size="sm" className="ml-4">
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <TabsContent value="all" className="space-y-6">
        <WorksTable works={filteredWorks} />
      </TabsContent>

      <TabsContent value="pending" className="space-y-6">
        <WorksTable works={filteredWorks} />
      </TabsContent>

      <TabsContent value="paid" className="space-y-6">
        <WorksTable works={filteredWorks} />
      </TabsContent>
    </Tabs>
  );
}
