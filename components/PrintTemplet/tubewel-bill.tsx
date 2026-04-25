"use client";

import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Loader2, Printer } from "lucide-react";
import { TubewellBillWithRelations } from "@/types";

interface Props {
  bill: TubewellBillWithRelations;
  gpProfile?: any;
}

export const TubewelBill = ({ bill, gpProfile }: Props) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      if (!bill) throw new Error("Bill data is missing.");

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const footerSpace = 35; // space for signatures

      // Data preparation
      const masterRollEntries = bill.workOrders.flatMap((wo: any) => wo.masterRollEntries || []);
      const rawMaterials = bill.workOrders.flatMap((wo: any) => wo.materials || []);
      const materials = Object.values(
        rawMaterials.reduce((acc: any, curr: any) => {
          const key = curr.materialId || curr.material?.id;
          if (!acc[key]) acc[key] = { ...curr };
          else acc[key].quantity += curr.quantity;
          return acc;
        }, {})
      ) as any[];

      // Calculate totals dynamically to ensure consistency in the PDF
      const totalLaborFromEntries = masterRollEntries.reduce(
        (sum: number, entry: any) => sum + (entry.total || 0),
        0
      );
      const totalMaterialFromMaterials = materials.reduce(
        (sum: number, m: any) => sum + (m.quantity * m.rate),
        0
      );
      const computedNetAmount = totalLaborFromEntries + totalMaterialFromMaterials;

      const uniqueWorkTypes = Array.from(
        new Set(
          masterRollEntries.flatMap((entry: any) => (entry.items || []).map((item: any) => item.workType))
        )
      );

      // ---- Helper to draw header (only for master roll pages) ----
      const drawHeader = (doc: jsPDF, pageNum: number, totalPages: number) => {
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        const title = `No ${gpProfile?.gpcode || "3"} ${gpProfile?.gpname || "Dhalpara Gram Panchayat"}`;
        doc.text(title, pageWidth / 2, 15, { align: "center" });
        doc.setLineWidth(0.4);
        doc.line((pageWidth - doc.getTextWidth(title)) / 2, 16.5, (pageWidth + doc.getTextWidth(title)) / 2, 16.5);

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(gpProfile?.gpaddress || "Trimohini, Dakshin Dinajpur", pageWidth / 2, 22, { align: "center" });

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Tube Well Muster Roll", pageWidth / 2, 29, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        const subTitle = `Bill for Head Mason (Page ${pageNum} of ${totalPages})`;
        doc.text(subTitle, pageWidth / 2, 34, { align: "center" });
        doc.setLineWidth(0.2);
        const subTitleWidth = doc.getTextWidth(subTitle);
        doc.line((pageWidth - subTitleWidth) / 2, 34.5, (pageWidth + subTitleWidth) / 2, 34.5);

        // Mistri info
        const mistri = bill.workOrders[0]?.mistri;
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Mistri Name:", margin, 42);
        doc.setFont("helvetica", "normal");
        doc.text(mistri?.name || "", margin + 22, 42);
        doc.setFont("helvetica", "bold");
        doc.text("Address:", margin, 48);
        doc.setFont("helvetica", "normal");
        doc.text(mistri?.address || "..................................................", margin + 16, 48);
      };

      // ---- Helper to draw signatures at the bottom of the page ----
      const drawSignatures = (doc: jsPDF) => {
        const y = pageHeight - 20;
        const colWidth = (pageWidth - 2 * margin) / 3;

        const drawSig = (title: string, gp: string, address: string, x: number) => {
          doc.setDrawColor(0);
          doc.setLineWidth(0.4);
          doc.line(x - 20, y - 6, x + 20, y - 6);
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.text(title.toUpperCase(), x, y, { align: "center" });
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text(gp, x, y + 4, { align: "center" });
          doc.text(address, x, y + 8, { align: "center" });
        };

        drawSig(
          "Prodhan",
          gpProfile?.gpname || "No. 3 Dhalpara G.P.",
          `${gpProfile?.blockname || "Hili Block"}, D/Dinajpur`,
          margin + colWidth / 2
        );
        drawSig(
          "Executive Assistant",
          gpProfile?.gpname || "No. 3 Dhalpara Gram Panchayat",
          "P.O.- Trimohini, Dakshin Dinajpur",
          margin + colWidth * 1.5
        );
        drawSig(
          "Nirman Sahayak",
          gpProfile?.gpname || "No. 3 Dhalpara Gram Panchayat",
          "Trimohini, D/Dinajpur",
          margin + colWidth * 2.5
        );
      };

      // ---- 1. Generate master roll tables (chunked by 10 rows per page) ----
      const rowsPerPage = 12;
      const chunks: any[][] = [];
      for (let i = 0; i < masterRollEntries.length; i += rowsPerPage) {
        chunks.push(masterRollEntries.slice(i, i + rowsPerPage));
      }
      if (chunks.length === 0) chunks.push([]);

      const masterHead = [
        [
          { content: "Sl No", rowSpan: 2 },
          { content: "Name of Place", rowSpan: 2 },
          { content: "Village/Sansad", rowSpan: 2 },
          ...uniqueWorkTypes.map((wt) => ({ content: wt, rowSpan: 2 })),
          { content: "Cost of", colSpan: uniqueWorkTypes.length, styles: { halign: "center" } },
          { content: "Total", rowSpan: 2 },
        ],
        uniqueWorkTypes.map((wt) => ({ content: wt })),
      ];

      const totalCols = 3 + uniqueWorkTypes.length * 2 + 1;

      for (let pageIdx = 0; pageIdx < chunks.length; pageIdx++) {
        if (pageIdx > 0) doc.addPage();

        const chunk = chunks[pageIdx];
        const isLastMasterPage = pageIdx === chunks.length - 1;

        const chunkBody = chunk.map((entry: any, idx: number) => {
          const itemMap = Object.fromEntries((entry.items || []).map((i: any) => [i.workType, i]));
          return [
            (pageIdx * rowsPerPage + idx + 1).toString(),
            entry.nameOfPlace || "",
            entry.villageSansad || "",
            ...uniqueWorkTypes.map((wt) => (itemMap[wt]?.quantity > 0 ? itemMap[wt].quantity.toString() : "")),
            ...uniqueWorkTypes.map((wt) => (itemMap[wt]?.quantity > 0 ? itemMap[wt].rate.toFixed(2) : "")),
            entry.total.toFixed(2),
          ];
        });

        const pageTotal = chunk.reduce((sum: number, entry: any) => sum + entry.total, 0);
        chunkBody.push([
          { content: "Page Total:", colSpan: totalCols - 1, styles: { halign: "right", fontStyle: "bold" } },
          { content: pageTotal.toFixed(2), styles: { fontStyle: "bold" } },
        ]);

        if (isLastMasterPage) {
          chunkBody.push([
            {
              content: "Grand Total (Labor):",
              colSpan: totalCols - 1,
              styles: { halign: "right", fontStyle: "bold", fillColor: [248, 250, 252] },
            },
            { content: totalLaborFromEntries.toFixed(2), styles: { fontStyle: "bold", fillColor: [248, 250, 252] } },
          ]);
        }

        (doc as any).autoTable({
          head: masterHead,
          body: chunkBody,
          startY: 60,
          margin: { left: margin, right: margin, bottom: footerSpace },
          styles: {
            fontSize: 7.5,
            cellPadding: 1.5,
            lineColor: [0, 0, 0],
            lineWidth: 0.2,
            halign: "center",
            textColor: [0, 0, 0],
            font: "helvetica",
          },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: "bold",
            lineWidth: 0.2,
          },
        });
      }

      // ---- 2. Materials table in two columns ----
      let finalY = (doc as any).lastAutoTable.finalY + 5;

      if (materials.length > 0) {
        // Estimate required height for a single table
        const tableHeight = materials.length * 7 + 15; // approximate height
        const requiredHeight = tableHeight + 20; // plus heading and subtotal

        if (finalY + requiredHeight > pageHeight - footerSpace) {
          doc.addPage();
          finalY = 60;
        }

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Materials Issued:", margin, finalY - 2);

        // Helper to build table body for a materials array
        const buildMaterialsBody = (matArray: any[]) => {
          return matArray.map((item, idx) => [
            (idx + 1).toString(),
            item.material?.name || "",
            `${item.quantity} ${item.material?.unit || ""}`,
            item.rate.toFixed(2),
            (item.quantity * item.rate).toFixed(2),
          ]);
        };

        const materialsBody = buildMaterialsBody(materials);
        const materialsHead = [["Sl", "Material", "Qty", "Rate", "Total"]];

        // Draw materials table as a single column (full width)
        (doc as any).autoTable({
          head: materialsHead,
          body: materialsBody,
          startY: finalY,
          margin: { left: margin, right: margin },
          tableWidth: 120, // Keep it relatively narrow for readability, or use auto
          styles: {
            fontSize: 8,
            cellPadding: 1.5,
            lineColor: [0, 0, 0],
            lineWidth: 0.2,
            halign: "center",
            textColor: [0, 0, 0],
          },
          headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: "bold" },
        });

        finalY = (doc as any).lastAutoTable.finalY + 5;

        // Subtotal row
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        const subtotalText = `Subtotal (Materials): ${totalMaterialFromMaterials.toFixed(2)}`;
        doc.text(subtotalText, pageWidth - margin, finalY, { align: "right" });

        finalY += 5;
      }

      // ---- 3. Summary box (Grand Net Payable) ----
      if (finalY + 25 > pageHeight - footerSpace) {
        doc.addPage();
        finalY = 60;
      }

      const summaryWidth = 60;
      const summaryX = pageWidth - margin - summaryWidth;
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.setFillColor(248, 250, 252);
      doc.rect(summaryX, finalY, summaryWidth, 20, "DF");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("GRAND NET PAYABLE", summaryX + summaryWidth / 2, finalY + 7, { align: "center" });
      doc.setFontSize(14);
      doc.text(
        computedNetAmount.toFixed(2),
        summaryX + summaryWidth / 2,
        finalY + 15,
        { align: "center" }
      );

      finalY += 25;

      // ---- 4. Bank details ----
      const mistri = bill.workOrders[0]?.mistri;
      if (mistri && (mistri.bankName || mistri.accountNumber)) {
        if (finalY + 40 > pageHeight - footerSpace) {
          doc.addPage();
          finalY = 60;
        }

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Bank Details for Payment:", margin, finalY);

        const bankDetailsBody = [
          ["Bank Name", mistri.bankName || "N/A"],
          ["Account Number", mistri.accountNumber || "N/A"],
          ["IFSC Code", mistri.ifscCode || "N/A"],
        ];
        (doc as any).autoTable({
          body: bankDetailsBody,
          startY: finalY + 2,
          margin: { left: margin, right: margin, bottom: footerSpace },
          tableWidth: 100,
          theme: "plain",
          styles: { fontSize: 9, cellPadding: 1.5 },
          columnStyles: { 0: { fontStyle: "bold" } },
        });
      }

      // ---- 5. Final pass: add headers and signatures ONLY to master roll pages ----
      const masterRollPageCount = chunks.length;
      const totalPages = (doc as any).internal.getNumberOfPages();

      for (let i = 1; i <= masterRollPageCount; i++) {
        doc.setPage(i);
        // Clear header area (0‑55mm) and signature area (bottom)
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, 55, "F");
        doc.rect(0, pageHeight - footerSpace, pageWidth, footerSpace, "F");

        drawHeader(doc, i, totalPages);
        drawSignatures(doc);
      }

      doc.save(`bill-${bill.billNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGeneratePDF}
      disabled={isGenerating}
      className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-shadow"
      aria-busy={isGenerating}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Printer className="h-4 w-4" />
      )}
      Download PDF Bill
    </Button>
  );
};
