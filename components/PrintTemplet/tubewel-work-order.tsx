"use client";

import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Loader2, Printer } from "lucide-react";
import { TubewellWorkOrderWithRelations } from "@/types";

interface Props {
  workOrder?: TubewellWorkOrderWithRelations;
  workOrders?: TubewellWorkOrderWithRelations[];
  allMaterials: Array<{ name: string; unit: string }>;
  gpProfile?: { gpname?: string; gpaddress?: string };
}

export const TubewelWorkOrder = ({
  workOrder,
  workOrders,
  allMaterials,
  gpProfile,
}: Props) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    const orders = workOrders || (workOrder ? [workOrder] : []);
    if (orders.length === 0) return;

    setIsGenerating(true);
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();

      orders.forEach((order, index) => {
        if (index > 0) {
          doc.addPage();
        }

        // ---------------------- HEADER ----------------------
        doc.setTextColor(30, 58, 138);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text(
          gpProfile?.gpname || "No. 3 Dhalpara Gram Panchayat",
          pageWidth / 2,
          18,
          { align: "center" }
        );

        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(
          gpProfile?.gpaddress ||
            "PO: Trimohini, Block: Hilli, District: Dakshin Dinajpur",
          pageWidth / 2,
          24,
          { align: "center" }
        );

        doc.setFontSize(14);
        doc.text("Tube well Installation / Repair Order", pageWidth / 2, 33, {
          align: "center",
        });
        doc.setLineWidth(0.4);
        doc.line(pageWidth / 2 - 42, 34, pageWidth / 2 + 42, 34);
        doc.line(pageWidth / 2 - 42, 35, pageWidth / 2 + 42, 35);

        doc.setFontSize(10);
        doc.text("(WORK ORDER FORM)", pageWidth / 2, 40, { align: "center" });

        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(1.5);
        doc.line(10, 45, pageWidth - 10, 45);
        doc.setDrawColor(0, 0, 0);

        // ---------------------- META ----------------------
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Serial No. :", 12, 53);
        doc.setTextColor(30, 58, 138);
        doc.text(order.orderNumber || "", 35, 53);
        doc.setTextColor(0, 0, 0);
        (doc as any).setLineDash([1, 1], 0);
        doc.setLineWidth(0.3);
        doc.line(33, 54, 70, 54);

        doc.text("Date :", pageWidth - 50, 53);
        const issueDate = order.issueDate
          ? new Date(order.issueDate).toLocaleDateString("en-GB")
          : "................";
        doc.setFont("helvetica", "normal");
        doc.text(issueDate, pageWidth - 35, 53);
        doc.line(pageWidth - 37, 54, pageWidth - 10, 54);
        (doc as any).setLineDash([], 0);

        // ---------------------- MECHANIC BLOCK ----------------------
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.rect(10, 60, pageWidth - 20, 20);

        doc.setDrawColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("Contractor / Mechanic :", 14, 67);
        doc.text(order.mistri?.name || "", 60, 67);
        (doc as any).setLineDash([1, 1], 0);
        doc.line(58, 68, pageWidth / 2 - 5, 68);

        doc.text("Mobile :", pageWidth / 2 + 5, 67);
        doc.setFont("helvetica", "normal");
        doc.text(
          order.mistri?.mobileNumber || "........",
          pageWidth / 2 + 25,
          67
        );
        doc.line(pageWidth / 2 + 23, 68, pageWidth - 14, 68);

        doc.setFont("helvetica", "bold");
        doc.text("Beneficiary Name :", 14, 75);
        doc.text(order.request?.citizenName || "", 50, 75);
        doc.line(48, 76, pageWidth / 2 - 5, 76);

        doc.text("Address :", pageWidth / 2 + 5, 75);
        doc.setFont("helvetica", "normal");
        doc.text(order.request?.address || "", pageWidth / 2 + 25, 75);
        doc.line(pageWidth / 2 + 23, 76, pageWidth - 14, 76);
        (doc as any).setLineDash([], 0);

        // ---------------------- MATERIAL SECTION ----------------------
        let currentY = 88;

        // Section title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("For New Tube well / Repair", pageWidth / 2, currentY, {
          align: "center",
        });
        const titleW = doc.getTextWidth("For New Tube well / Repair");
        doc.setLineWidth(0.3);
        doc.line(
          pageWidth / 2 - titleW / 2,
          currentY + 1,
          pageWidth / 2 + titleW / 2,
          currentY + 1
        );

        currentY += 8;

        // Helper: extract numeric quantity
        const getNumericQuantity = (wm: any): number | null => {
          if (typeof wm.quantity === "number") return wm.quantity;
          if (typeof wm.quantity === "string") {
            const match = wm.quantity.match(/(\d+(?:\.\d+)?)/);
            if (match) return parseFloat(match[1]);
          }
          return null;
        };

        // Filter materials with valid positive quantity
        const usedMaterials = allMaterials.filter((m) =>
          order.materials?.some((wm) => {
            if (wm.material.name.toLowerCase() !== m.name.toLowerCase())
              return false;
            const qtyNum = getNumericQuantity(wm);
            return qtyNum !== null && qtyNum > 0;
          })
        );

        // Sort and split into two columns
        const sortedMaterials = [...usedMaterials].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        const mid = Math.ceil(sortedMaterials.length / 2);
        const leftMaterials = sortedMaterials.slice(0, mid);
        const rightMaterials = sortedMaterials.slice(mid);

        const getQty = (name: string) => {
          const wm = order.materials?.find(
            (x: any) =>
              x.material.name.toLowerCase() === name.toLowerCase()
          );
          if (!wm) return "";
          const qtyNum = getNumericQuantity(wm);
          if (qtyNum === null || qtyNum <= 0) return "";
          const unit = wm.material.unit || "P.";
          return `${qtyNum} ${unit}`;
        };

        const tableStyles = {
          font: "helvetica" as const,
          fontSize: 8,
          cellPadding: 1.5,
          lineColor: [200, 200, 200] as [number, number, number],
          lineWidth: 0.2,
        };

        const headStyles = {
          fillColor: [226, 232, 240] as [number, number, number],
          textColor: [0, 0, 0] as [number, number, number],
          fontStyle: "bold" as const,
        };

        // Calculate table heights based on row count and content
        const headerHeight = 6; // Height of header row
        const rowHeight = 5; // Approximate height per row
        const leftTableHeight = headerHeight + leftMaterials.length * rowHeight;
        const rightTableHeight = headerHeight + rightMaterials.length * rowHeight;
        const maxTableHeight = Math.max(leftTableHeight, rightTableHeight);

        // Draw left table (first column)
        autoTable(doc, {
          startY: currentY,
          head: [["Sl.", "Material", "Quantity"]],
          body: leftMaterials.map((m, i) => [i + 1, m.name, getQty(m.name)]),
          margin: { left: 10, right: pageWidth / 2 + 4 },
          theme: "grid",
          styles: tableStyles,
          headStyles: headStyles,
          columnStyles: {
            0: { halign: "center", fontStyle: "normal" },
            1: { fontStyle: "normal" },
            2: {
              halign: "center",
              fontStyle: "bold",
              textColor: [30, 58, 138],
            },
          },
        });

        // Draw right table (second column)
        if (rightMaterials.length > 0) {
          autoTable(doc, {
            startY: currentY,
            head: [["Sl.", "Material", "Quantity"]],
            body: rightMaterials.map((m, i) => [
              leftMaterials.length + i + 1,
              m.name,
              getQty(m.name),
            ]),
            margin: { left: pageWidth / 2 + 4, right: 10 },
            theme: "grid",
            styles: tableStyles,
            headStyles: headStyles,
            columnStyles: {
              0: { halign: "center", fontStyle: "normal" },
              1: { fontStyle: "normal" },
              2: {
                halign: "center",
                fontStyle: "bold",
                textColor: [30, 58, 138],
              },
            },
          });
        }

        // Use calculated height for proper spacing, ensuring no overlap
        const tablesBottomY = currentY + maxTableHeight;

        // ---------------------- PRADHAN SIGNATURE (right after items) ----------------------
        // Increased gap from 8mm to 15mm
        const pradhanY = tablesBottomY + 15;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.4);
        doc.line(pageWidth - 70, pradhanY, pageWidth - 10, pradhanY);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Pradhan", pageWidth - 40, pradhanY + 5, { align: "center" });
        doc.text(
          gpProfile?.gpname || "No. 3 Dhalpara Gram Panchayat",
          pageWidth - 40,
          pradhanY + 10,
          { align: "center" }
        );

        // Update currentY for the next section (add extra 5mm gap after signature)
        currentY = pradhanY + 12 + 5; // 5mm extra gap before declaration

        // ---------------------- DECLARATION BY MISTRI ----------------------
        currentY += 15;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(
          "Declaration by Contractor / Mechanic",
          pageWidth / 2,
          currentY,
          { align: "center" }
        );
        doc.setLineWidth(0.2);
        doc.line(10, currentY + 1.5, pageWidth - 10, currentY + 1.5);
        doc.line(10, currentY - 5, pageWidth - 10, currentY - 5);

        currentY += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        const declaration = `I hereby declare that the installation / repair work of the above-mentioned tube well has been completed by me in accordance with the order issued by the Gram Panchayat. The materials supplied have been properly utilized and the work has been executed satisfactorily.`;
        doc.text(
          doc.splitTextToSize(declaration, pageWidth - 20),
          10,
          currentY
        );

        currentY += 12;
        doc.line(pageWidth - 70, currentY, pageWidth - 10, currentY);
        doc.setFont("helvetica", "bold");
        doc.text(
          "Signature of Contractor / Mechanic",
          pageWidth - 40,
          currentY + 4,
          { align: "center" }
        );

        // ---------------------- CERTIFICATE ----------------------
        currentY += 15;
        doc.setLineWidth(0.4);
        doc.line(10, currentY, pageWidth - 10, currentY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(
          "Certificate of Proper Use and Completion",
          pageWidth / 2,
          currentY + 6,
          { align: "center" }
        );

        doc.line(10, currentY + 9, pageWidth - 10, currentY + 9);

        currentY += 15;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);

        const cert1 = `It is hereby certified that the above tube well has been installed / repaired by Contractor / Mechanic Shri `;
        const cert2 = ` as per order. The tube well has been inspected and found to be functioning properly, and water is coming out satisfactorily. Therefore, the Contractor / Mechanic is recommended for payment of the work done.`;

        const fullText = cert1 + (order.mistri?.name || "") + cert2;
        doc.text(doc.splitTextToSize(fullText, pageWidth - 20), 10, currentY);

        // ---------------------- FINAL SIGNATURE BLOCK ----------------------
        currentY += 20;

        const sigWidth = 40;
        const gap = (pageWidth - 20 - sigWidth * 3) / 2;

        // Member
        doc.line(10, currentY, 10 + sigWidth, currentY);
        doc.text("Member", 10 + sigWidth / 2, currentY + 4, { align: "center" });

        // Pradhan (plain, without GP name – it already appears above)
        doc.line(
          10 + sigWidth + gap,
          currentY,
          10 + sigWidth * 2 + gap,
          currentY
        );
        doc.text(
          "Pradhan",
          10 + sigWidth + gap + sigWidth / 2,
          currentY + 4,
          { align: "center" }
        );

        // Nirman Sahayak
        doc.line(pageWidth - 10 - sigWidth, currentY, pageWidth - 10, currentY);
        doc.text(
          "Nirman Sahayak",
          pageWidth - 10 - sigWidth / 2,
          currentY + 4,
          { align: "center" }
        );
      });

      const fileName =
        orders.length === 1
          ? `work-order-${orders[0].orderNumber}.pdf`
          : `work-orders-bulk-${new Date().getTime()}.pdf`;

      doc.save(fileName);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGeneratePDF}
      disabled={
        isGenerating ||
        (workOrders || (workOrder ? [workOrder] : [])).length === 0
      }
      className={`gap-2 ${
        workOrders
          ? "bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      }`}
    >
      {isGenerating ? (
        <Loader2 className="animate-spin h-4 w-4" />
      ) : (
        <Printer className="h-4 w-4" />
      )}
      {workOrders ? `Print Selected (${workOrders.length})` : "Download PDF"}
    </Button>
  );
};
