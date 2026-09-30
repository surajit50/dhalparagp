import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate } from "@/lib/utils/date";
import { toTitleCase } from "@/lib/utils";

const drawComplaintCopy = (doc: jsPDF, complaint: any, startY: number, copyType: string) => {
  // Header
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Street Light Complaint Application", 105, startY + 12, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Gram Panchayat Office", 105, startY + 18, { align: "center" });

  // Copy Type (Office/Applicant)
  doc.setFont("helvetica", "italic");
  doc.text(`(${copyType})`, 190, startY + 12, { align: "right" });
  
  doc.setLineWidth(0.5);
  doc.line(14, startY + 22, 196, startY + 22);
  
  // Complaint Info
  const details = [
    ["Date:", complaint.complaintDate ? formatDate(complaint.complaintDate) : new Date().toLocaleDateString(), "Complaint No:", complaint.complaintNo || "N/A"],
    ["Applicant Name:", complaint.reportedBy || "N/A", "Mobile Number:", complaint.reporterMobile || "N/A"],
    ["Priority:", complaint.priority || "NORMAL", "", ""]
  ];
  
  autoTable(doc, {
    startY: startY + 25,
    body: details,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1, minCellHeight: 5 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 30 },
      1: { cellWidth: 60 },
      2: { fontStyle: "bold", cellWidth: 30 },
      3: { cellWidth: 60 }
    },
    margin: { left: 14 }
  });

  // Street Light Details
  const currentY = (doc as any).lastAutoTable.finalY + 4;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Complaint Details:", 14, currentY);
  
  const lightDetails = [
    ["Mouza:", complaint.mouza || complaint.streetLight?.mouza?.mouzaName || "N/A", "Light ID:", complaint.lightId || complaint.streetLight?.lightId || "N/A"],
    ["Complaint Type:", complaint.complaintType ? toTitleCase(complaint.complaintType) : "N/A", "", ""]
  ];
  
  autoTable(doc, {
    startY: currentY + 2,
    body: lightDetails,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1, minCellHeight: 5 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 30 },
      1: { cellWidth: 60 },
      2: { fontStyle: "bold", cellWidth: 30 },
      3: { cellWidth: 60 }
    },
    margin: { left: 14 }
  });

  // Description
  const descY = (doc as any).lastAutoTable.finalY + 4;
  doc.setFont("helvetica", "bold");
  doc.text("Description:", 14, descY);
  
  doc.setFont("helvetica", "normal");
  let descText = complaint.description || "No description provided.";
  // Truncate to avoid overflowing the half-page
  if (descText.length > 400) {
     descText = descText.substring(0, 400) + "...";
  }
  const splitDescription = doc.splitTextToSize(descText, 182);
  doc.text(splitDescription, 14, descY + 6);
  
  // Signatures
  let signY = descY + 6 + (splitDescription.length * 4.5) + 20;
  
  // Just a safety check so it doesn't overflow its half
  if (signY > startY + 130) {
      signY = startY + 130;
  }
  
  doc.setLineWidth(0.5);
  doc.line(20, signY, 80, signY);
  doc.setFontSize(9);
  doc.text("Signature of Applicant", 30, signY + 5);
  
  doc.line(120, signY, 190, signY);
  doc.text("Signature of Concerned Gram Member", 125, signY + 5);
};

export const generateComplaintPDF = (complaint: any) => {
  const doc = new jsPDF();
  
  // Draw Office Copy in the upper half
  drawComplaintCopy(doc, complaint, 0, "Office Copy");
  
  // Draw a dashed cut line in the middle of A4
  doc.setLineDashPattern([2, 2], 0);
  doc.line(10, 148.5, 200, 148.5);
  doc.setLineDashPattern([], 0); // reset pattern
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("Cut Here", 105, 147.5, { align: "center" });

  // Draw Applicant Copy in the lower half
  drawComplaintCopy(doc, complaint, 148.5, "Applicant Copy");
  
  // Save PDF
  doc.save(`Complaint_${complaint.complaintNo || 'Application'}.pdf`);
};

export const generateMultipleComplaintsPDF = (complaints: any[]) => {
  if (!complaints || complaints.length === 0) return;
  
  const doc = new jsPDF();
  
  complaints.forEach((complaint, index) => {
    if (index > 0) {
      doc.addPage();
    }
    
    drawComplaintCopy(doc, complaint, 0, "Office Copy");
    
    doc.setLineDashPattern([2, 2], 0);
    doc.line(10, 148.5, 200, 148.5);
    doc.setLineDashPattern([], 0);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text("Cut Here", 105, 147.5, { align: "center" });

    drawComplaintCopy(doc, complaint, 148.5, "Applicant Copy");
  });
  
  doc.save(`Bulk_Complaints_${new Date().toISOString().split('T')[0]}.pdf`);
};
