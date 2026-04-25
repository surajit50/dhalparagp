import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, addYears, getYear } from "date-fns";

export const generateLeaseNoticePDF = (lease: any, noticeType: string) => {
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  let y = 10;

  /* ---------- FORMAL HEADER WITH SEAL ---------- */

  // Official seal/emblem placeholder
  doc.setFillColor(31, 62, 97);
  doc.circle(margin + 6, y - 2, 2.5, "F");

  // Main title
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.setTextColor(31, 62, 97);
  doc.text("NO 3 DHALPARA GRAM PANCHAYAT", pageWidth / 2, y + 2, { align: "center" });

  // Subtitle with better spacing
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);
  y += 7;
  doc.text("Vill - Kismatdapat, PO - Trimohini, PS - Hili", pageWidth / 2, y, { align: "center" });
  y += 3;
  doc.text("Dist - Dakshin Dinajpur, West Bengal", pageWidth / 2, y, { align: "center" });

  // Contact details with elegant formatting
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);
  y += 3;
  doc.text("admin@dhalparagp.in", pageWidth / 2, y, { align: "center" });

  // Bottom decorative line
  y += 4;
  doc.setDrawColor(31, 62, 97);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);

  y += 4;

  /* ---------- OFFICIAL NOTICE HEADER ---------- */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(31, 62, 97);
  doc.text("OFFICIAL NOTICE", pageWidth / 2, y, { align: "center" });

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  doc.line(pageWidth / 2 - 20, y + 1.5, pageWidth / 2 + 20, y + 1.5);

  y += 5.5;

  /* ---------- MEMO & DATE (formal layout) ---------- */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  doc.text(`Memo No.`, margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`: ${lease.memoNo || "_______________"}`, margin + 25, y);

  doc.text(`Date`, pageWidth - margin - 25, y);
  doc.text(`: ${format(new Date(), "dd/MM/yyyy")}`, pageWidth - margin - 20, y, { align: "left" });

  y += 5;

  /* ---------- RECIPIENT ADDRESS (formal) ---------- */
  y += 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);
  doc.text("To,", margin, y);

  y += 4;
  doc.setFont("times", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(31, 62, 97);
  const partyNameLines = doc.splitTextToSize(lease.leasePartyName || "", contentWidth - 4);
  doc.text(partyNameLines, margin, y);
  let lineY = y + partyNameLines.length * 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);

  // Function to handle null or "null" string
  const isValid = (val: any) => val && val !== "null" && val !== "undefined";

  if (isValid(lease.leasePartyFatherName)) {
    const fatherNameLines = doc.splitTextToSize(`S/O - ${lease.leasePartyFatherName}`, contentWidth - 4);
    doc.text(fatherNameLines, margin, lineY);
    lineY += fatherNameLines.length * 3.5;
  }

  // Address details
  if (isValid(lease.leasePartyAddressLine1)) {
    const addr1Lines = doc.splitTextToSize(lease.leasePartyAddressLine1, contentWidth - 4);
    doc.text(addr1Lines, margin, lineY);
    lineY += addr1Lines.length * 3.5;
  }

  if (isValid(lease.leasePartyAddressLine2)) {
    const addr2Lines = doc.splitTextToSize(lease.leasePartyAddressLine2, contentWidth - 4);
    doc.text(addr2Lines, margin, lineY);
    lineY += addr2Lines.length * 3.5;
  }

  if (isValid(lease.leasePartyCity)) {
    const addressLines = doc.splitTextToSize(lease.leasePartyCity, contentWidth - 4);
    doc.text(addressLines, margin, lineY);
    lineY += addressLines.length * 3.5;
  }

  if (isValid(lease.leasePartyPin)) {
    doc.text(`PIN - ${lease.leasePartyPin}`, margin, lineY);
    lineY += 3;
  }

  y = lineY + 4;

  /* ---------- SUBJECT WITH FORMAL STYLING ---------- */
  let subject = "";
  let body = "";

  if (noticeType === "reminder") {
    subject = "RE: REMINDER FOR OUTSTANDING LEASE PAYMENT";
    body = `It is hereby notified that an outstanding amount of Rs. ${lease.pendingAmount} remains unpaid for the lease of pond "${lease.pond.name}" located at ${lease.pond.location}. You are required to remit the pending dues with immediate effect to avoid further action by this office.`;
  } else if (noticeType === "due") {
    subject = "RE: NOTICE FOR DUE LEASE PAYMENT";
    body = `Notice is hereby given that a payment for the lease of pond "${lease.pond.name}" has become due. You are instructed to effect the payment on or before the due date to maintain the validity of your lease agreement.`;
  } else {
    subject = "RE: LEASE INFORMATION & PARTICULARS";
    body = `Please find below the important particulars and details pertaining to your lease of pond "${lease.pond.name}". Kindly verify all information and report any discrepancies at the earliest.`;
  }

  doc.setFont("times", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(31, 62, 97);
  const subjectLines = doc.splitTextToSize(subject, contentWidth);
  doc.text(subjectLines, margin, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  doc.text("Dear Sir/Madam,", margin, y);
  y += 4;

  const bodyLines = doc.splitTextToSize(body, contentWidth);
  doc.text(bodyLines, margin, y);
  y += bodyLines.length * 3.8 + 3;

  /* ---------- LEASE SUMMARY TABLE (FORMAL) ---------- */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(31, 62, 97);
  doc.text("Summary of Lease Account", margin, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["S. No", "Property Details", "Total Lease Amount", "Amount Paid", "Outstanding Balance"]],
    body: [
      [
        "1",
        `${lease.pond.name}\n${lease.pond.location}`,
        `Rs. ${lease.totalAmount}`,
        `Rs. ${lease.paidAmount}`,
        `Rs. ${lease.pendingAmount || 0}`,
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 62, 97],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
      lineColor: [31, 62, 97],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      overflow: "linebreak",
      textColor: [40, 40, 40],
      lineColor: [200, 200, 200],
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        const pending = lease.pendingAmount;
        if (pending > 0) {
          doc.setTextColor(180, 30, 40);
          doc.setFont("helvetica", "bold");
        } else {
          doc.setTextColor(40, 100, 60);
          doc.setFont("helvetica", "bold");
        }
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 4;

  /* ---------- YEAR-WISE BREAKDOWN (FORMAL) ---------- */
  const totalPaidAcrossAllYears = Number(lease.paidAmount) || 0;
  const yearlyAmount = Number(lease.leaseAmountYearly) || 0;
  let remainingPaidAmount = totalPaidAcrossAllYears;

  const leaseStartDate = new Date(lease.leaseStartDate);
  const leaseEndDate = new Date(lease.leaseEndDate);

  const totalYears = Math.ceil(
    (leaseEndDate.getTime() - leaseStartDate.getTime()) /
      (1000 * 60 * 60 * 24 * 365.25)
  );

  const yearlyBreakdown = Array.from({ length: totalYears }, (_, i) => {
    const yearStart = addYears(leaseStartDate, i);
    const paidForThisYear = Math.min(remainingPaidAmount, yearlyAmount);
    remainingPaidAmount -= paidForThisYear;
    const pendingForYear = yearlyAmount - paidForThisYear;

    return {
      yearLabel: `Year ${i + 1}`,
      calendarYear: getYear(yearStart),
      due: yearlyAmount,
      paid: paidForThisYear,
      pending: pendingForYear,
    };
  });

  if (yearlyBreakdown.length > 0) {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(31, 62, 97);
    doc.text("Year-wise Payment Details", margin, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Year", "Financial Year", "Annual Due (Rs.)", "Amount Paid (Rs.)", "Outstanding (Rs.)"]],
      body: yearlyBreakdown.map(item => [
        item.yearLabel,
        item.calendarYear.toString(),
        item.due.toFixed(2),
        item.paid.toFixed(2),
        item.pending.toFixed(2),
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [31, 62, 97],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7,
        lineColor: [31, 62, 97],
      },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 20, halign: "center" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
      },
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
        textColor: [40, 40, 40],
        lineColor: [200, 200, 200],
      },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 4) {
          const row = yearlyBreakdown[data.row.index];
          if (row.pending > 0) {
            doc.setTextColor(180, 30, 40);
            doc.setFont("helvetica", "bold");
          } else {
            doc.setTextColor(40, 100, 60);
            doc.setFont("helvetica", "bold");
          }
        }
      },
    });

    y = (doc as any).lastAutoTable.finalY + 3;
  }

  /* ---------- IMPORTANT NOTICE & FOOTER ---------- */
  y += 2;

  // Check if we need a new page
  if (y > pageHeight - 28) {
    doc.addPage();
    y = 15;
  }

  // Important notice box
  doc.setFillColor(248, 240, 235);
  doc.setDrawColor(180, 30, 40);
  doc.setLineWidth(0.7);
  doc.rect(margin, y, contentWidth, 13, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(180, 30, 40);
  doc.text("IMPORTANT NOTICE", margin + 3, y + 2.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(40, 40, 40);
  const noticeText = "Payment of outstanding lease dues is mandatory. Non-compliance may result in cancellation of lease and/or legal proceedings as per rules.";
  const noticeLines = doc.splitTextToSize(noticeText, contentWidth - 6);
  doc.text(noticeLines, margin + 3, y + 6);

  y += 16;

  /* ---------- SIGNATURE SECTION ---------- */
  const signatureY = y;
  if (signatureY > pageHeight - 20) {
    doc.addPage();
    y = 15;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(40, 40, 40);
  
  doc.text("Authorized by:", margin, y);
  y += 12;
  doc.line(margin, y, margin + 25, y);
  y += 1;
  doc.setFontSize(6);
  doc.text("(Signature & Seal)", margin, y);

  doc.text("Gram Panchayat Officer", pageWidth - margin - 25, y - 13);
  y -= 1;
  doc.line(pageWidth - margin - 25, y, pageWidth - margin, y);
  y += 1;
  doc.text("(Dated)", pageWidth - margin - 25, y);

  

  /* ---------- SAVE PDF ---------- */
  doc.save(`Lease_Notice_${lease.leasePartyName}.pdf`);
};
