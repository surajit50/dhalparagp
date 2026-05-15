"use client";

import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Loader2, Printer } from "lucide-react";
import { TubewellWorkOrderWithRelations } from "@/types";

interface Props {
  workOrders: TubewellWorkOrderWithRelations[];
  allMaterials: Array<{ name: string; unit: string }>;
  gpProfile?: { gpname?: string; gpaddress?: string };
}

export const BulkWorkOrderPrint = ({
  workOrders,
  allMaterials,
  gpProfile,
}: Props) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    if (workOrders.length === 0) return;
    setIsGenerating(true);
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();

      workOrders.forEach((workOrder, index) => {
        if (index > 0) {
          doc.addPage();
        }

        // ================= HEADER =================
        doc.setTextColor(30, 58, 138); // text-orange-900
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text(
          gpProfile?.gpname || "No. 3 Dhalpara Gram Panchayat",
          pageWidth / 2,
          18,
          { align: "center" },
        );

        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(
          gpProfile?.gpaddress ||
            "PO: Trimohini, Block: Hilli, District: Dakshin Dinajpur",
          pageWidth / 2,
          24,
          { align: "center" },
        );

        doc.setFontSize(14);
        doc.text("Tube well Installation / Repair Order", pageWidth / 2, 33, {
          align: "center",
        });
        // Double underline
        doc.setLineWidth(0.4);
        doc.line(pageWidth / 2 - 42, 34, pageWidth / 2 + 42, 34);
        doc.line(pageWidth / 2 - 42, 35, pageWidth / 2 + 42, 35);

        doc.setFontSize(10);
        doc.text("(WORK ORDER FORM)", pageWidth / 2, 40, { align: "center" });

        doc.setDrawColor(30, 58, 138); // blue-900
        doc.setLineWidth(1.5);
        doc.line(10, 45, pageWidth - 10, 45);

        doc.setDrawColor(0, 0, 0);

        // ================= META =================
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Serial No. :", 12, 53);
        doc.setTextColor(30, 58, 138);
        doc.text(workOrder.orderNumber || "", 35, 53);
        doc.setTextColor(0, 0, 0);
        (doc as any).setLineDash([1, 1], 0);
        doc.setLineWidth(0.3);
        doc.line(33, 54, 70, 54);

        doc.text("Date :", pageWidth - 50, 53);
        const issueDate = workOrder.issueDate
          ? new Date(workOrder.issueDate).toLocaleDateString("en-GB")
          : "................";
        doc.setFont("helvetica", "normal");
        doc.text(issueDate, pageWidth - 35, 53);
        doc.line(pageWidth - 37, 54, pageWidth - 10, 54);
        (doc as any).setLineDash([], 0);

        // ================= MECHANIC BLOCK =================
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.rect(10, 60, pageWidth - 20, 20);

        doc.setDrawColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("Contractor / Mechanic :", 14, 67);
        doc.text(workOrder.mistri?.name || "", 60, 67);
        (doc as any).setLineDash([1, 1], 0);
        doc.line(58, 68, pageWidth / 2 - 5, 68);

        doc.text("Mobile :", pageWidth / 2 + 5, 67);
        doc.setFont("helvetica", "normal");
        doc.text(workOrder.mistri?.mobileNumber || "........", pageWidth / 2 + 25, 67);
        doc.line(pageWidth / 2 + 23, 68, pageWidth - 14, 68);

        doc.setFont("helvetica", "bold");
        doc.text("Beneficiary Name :", 14, 75);
        doc.text(workOrder.request?.citizenName || "", 50, 75);
        doc.line(48, 76, pageWidth / 2 - 5, 76);

        doc.text("Address :", pageWidth / 2 + 5, 75);
        doc.setFont("helvetica", "normal");
        doc.text(workOrder.request?.address || "", pageWidth / 2 + 25, 75);
        doc.line(pageWidth / 2 + 23, 76, pageWidth - 14, 76);
        (doc as any).setLineDash([], 0);

        // ================= MATERIAL =================
        let currentY = 88;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("For New Tube well / Repair", pageWidth / 2, currentY, {
          align: "center",
        });
        const titleW = doc.getTextWidth("For New Tube well / Repair");
        doc.setLineWidth(0.3);
        doc.line(pageWidth / 2 - titleW / 2, currentY + 1, pageWidth / 2 + titleW / 2, currentY + 1);

        currentY += 6;

        const mid = Math.ceil(allMaterials.length / 2);
        const left = allMaterials.slice(0, mid);
        const right = allMaterials.slice(mid);

        const getQty = (name: string) => {
          const m = workOrder.materials?.find(
            (x: any) =>
              x.material.name.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(x.material.name.toLowerCase())
          );
          return m ? `${m.quantity} ${m.material.unit || "P."}` : "";
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

        autoTable(doc, {
          startY: currentY,
          head: [["Sl.", "Material", "Quantity"]],
          body: left.map((m, i) => [i + 1, m.name, getQty(m.name)]),
          margin: { left: 10, right: pageWidth / 2 + 4 },
          theme: "grid",
          styles: tableStyles,
          headStyles: headStyles,
          columnStyles: {
            0: { halign: "center", fontStyle: "normal" },
            1: { fontStyle: "normal" },
            2: { halign: "center", fontStyle: "bold", textColor: [30, 58, 138] },
          },
        });

        autoTable(doc, {
          startY: currentY,
          head: [["Sl.", "Material", "Quantity"]],
          body: right.map((m, i) => [left.length + i + 1, m.name, getQty(m.name)]),
          margin: { left: pageWidth / 2 + 4, right: 10 },
          theme: "grid",
          styles: tableStyles,
          headStyles: headStyles,
          columnStyles: {
            0: { halign: "center", fontStyle: "normal" },
            1: { fontStyle: "normal" },
            2: { halign: "center", fontStyle: "bold", textColor: [30, 58, 138] },
          },
        });

        // ================= PRADHAN SIGN =================
        const finalY = (doc as any).lastAutoTable.finalY || currentY + 40;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.4);
        doc.line(pageWidth - 70, finalY + 15, pageWidth - 20, finalY + 15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Pradhan", pageWidth - 45, finalY + 20, { align: "center" });
        doc.text(gpProfile?.gpname || "No. 3 Dhalpara Gram Panchayat", pageWidth - 45, finalY + 25, { align: "center" });

        // ================= MISTRI DECLARATION =================
        let nextY = finalY + 40;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(
          "Declaration by Contractor / Mechanic",
          pageWidth / 2,
          nextY,
          {
            align: "center",
          },
        );
        doc.setLineWidth(0.2);
        doc.line(10, nextY + 1.5, pageWidth - 10, nextY + 1.5);
        doc.line(10, nextY - 5, pageWidth - 10, nextY - 5);

        nextY += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        const declaration = `I hereby declare that the installation / repair work of the above-mentioned tube well has been completed by me in accordance with the order issued by the Gram Panchayat. The materials supplied have been properly utilized and the work has been executed satisfactorily.`;
        doc.text(doc.splitTextToSize(declaration, pageWidth - 20), 10, nextY);

        nextY += 15;
        doc.line(10, nextY, 70, nextY);
        doc.setFont("helvetica", "bold");
        doc.text("Signature of Contractor / Mechanic", 40, nextY + 4, { align: "center" });

        // ================= CERTIFICATE =================
        nextY += 15;
        doc.setLineWidth(0.4);
        doc.line(10, nextY, pageWidth - 10, nextY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(
          "Certificate of Proper Use and Completion",
          pageWidth / 2,
          nextY + 6,
          { align: "center" },
        );

        doc.line(10, nextY + 9, pageWidth - 10, nextY + 9);

        nextY += 16;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);

        const cert1 = `It is hereby certified that the above tube well has been installed / repaired by Contractor / Mechanic Shri `;
        const cert2 = ` as per order. The tube well has been inspected and found to be functioning properly, and water is coming out satisfactorily. Therefore, the Contractor / Mechanic is recommended for payment of the work done.`;
        
        const fullText = cert1 + (workOrder.mistri?.name || "") + cert2;
        doc.text(doc.splitTextToSize(fullText, pageWidth - 20), 10, nextY);

        // ================= FINAL SIGN =================
        nextY += 30;

        const sigWidth = 40;
        const gap = (pageWidth - 20 - (sigWidth * 3)) / 2;

        doc.line(10, nextY, 10 + sigWidth, nextY);
        doc.text("Member", 10 + sigWidth / 2, nextY + 4, { align: "center" });

        doc.line(10 + sigWidth + gap, nextY, 10 + sigWidth * 2 + gap, nextY);
        doc.text("Pradhan", 10 + sigWidth + gap + sigWidth / 2, nextY + 4, { align: "center" });

        doc.line(pageWidth - 10 - sigWidth, nextY, pageWidth - 10, nextY);
        doc.text("Job Assistant", pageWidth - 10 - sigWidth / 2, nextY + 4, { align: "center" });
      });

      doc.save(`work-orders-bulk-${new Date().getTime()}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGeneratePDF}
      disabled={isGenerating || workOrders.length === 0}
      className="gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
    >
      {isGenerating ? (
        <Loader2 className="animate-spin h-4 w-4" />
      ) : (
        <Printer className="h-4 w-4" />
      )}
      Print Selected ({workOrders.length})
    </Button>
  );
};
