import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, addYears, getYear, differenceInYears } from "date-fns";
import { gpname, gpaddress } from "@/constants/gpinfor";

export const generateLeaseNoticePDF = (leasesInput: any | any[], noticeType: string) => {
  const leases = Array.isArray(leasesInput) ? leasesInput : [leasesInput];
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 8;
  const contentWidth = pageWidth - margin * 2;

  const scale = 0.75;
  const scaled = (size: number) => Math.max(size * scale, 5);
  const lineH = 3.5 * scale;

  const drawSingleNotice = (
    doc: jsPDF,
    lease: any,
    noticeType: string,
    startY: number,
    label: string,
    isOfficeCopy: boolean
  ) => {
    let y = startY;

    // ----- LABEL (top of each copy) -----
    doc.setFont("helvetica", "bold");
    doc.setFontSize(scaled(8));
    if (isOfficeCopy) {
      doc.setTextColor(185, 28, 28); // red for Office Copy
    } else {
      doc.setTextColor(31, 62, 97); // blue for Party Copy
    }
    doc.text(label, pageWidth / 2, y, { align: "center" });
    y += 4 * scale;

    // ----- HEADER -----
    doc.setFont("times", "bold");
    doc.setFontSize(scaled(12));
    doc.setTextColor(31, 62, 97);
    doc.text(gpname.toUpperCase(), pageWidth / 2, y, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(scaled(9));
    doc.setTextColor(80, 80, 80);
    y += 2.5 * scale;
    doc.text(gpaddress, pageWidth / 2, y, { align: "center" });

    y += 2 * scale;
    doc.setDrawColor(31, 62, 97);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);

    y += 3.5 * scale;

    // ----- OFFICIAL NOTICE -----
    doc.setFont("helvetica", "bold");
    doc.setFontSize(scaled(10));
    doc.setTextColor(31, 62, 97);
    doc.text("OFFICIAL NOTICE", pageWidth / 2, y, { align: "center" });
    y += 4 * scale;

    // ----- MEMO & DATE -----
    doc.setFont("helvetica", "bold");
    doc.setFontSize(scaled(8));
    doc.setTextColor(50, 50, 50);
    doc.text("Memo No.", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(`: GP/Lease/Notice/${getYear(new Date())}/${lease.id.slice(-4)}`, margin + 20 * scale, y);
    doc.setFont("helvetica", "bold");
    doc.text("Date", pageWidth - margin - 38 * scale, y);
    doc.setFont("helvetica", "normal");
    doc.text(`: ${format(new Date(), "dd/MM/yyyy")}`, pageWidth - margin - 28 * scale, y);

    y += 4.5 * scale;

    // ----- RECIPIENT ADDRESS -----
    doc.setFont("helvetica", "bold");
    doc.setFontSize(scaled(8));
    doc.setTextColor(50, 50, 50);
    doc.text("To,", margin, y);

    y += 3 * scale;
    doc.setFont("times", "bold");
    doc.setFontSize(scaled(9));
    doc.setTextColor(31, 62, 97);
    const partyNameLines = doc.splitTextToSize(lease.leasePartyName || "", contentWidth);
    doc.text(partyNameLines, margin, y);
    let lineY = y + (partyNameLines.length * lineH);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(scaled(8));
    doc.setTextColor(60, 60, 60);

    const isValid = (val: any) => val && val !== "null" && val !== "undefined";

    if (isValid(lease.leasePartyFatherName)) {
      const fatherNameLines = doc.splitTextToSize(`S/o ${lease.leasePartyFatherName}`, contentWidth);
      doc.text(fatherNameLines, margin, lineY);
      lineY += fatherNameLines.length * lineH;
    }
    if (isValid(lease.leasePartyAddressLine1)) {
      const addr1Lines = doc.splitTextToSize(lease.leasePartyAddressLine1, contentWidth);
      doc.text(addr1Lines, margin, lineY);
      lineY += addr1Lines.length * lineH;
    }
    if (isValid(lease.leasePartyAddressLine2)) {
      const addr2Lines = doc.splitTextToSize(lease.leasePartyAddressLine2, contentWidth);
      doc.text(addr2Lines, margin, lineY);
      lineY += addr2Lines.length * lineH;
    }
    if (isValid(lease.leasePartyCity)) {
      const cityLine = doc.splitTextToSize(`District: ${lease.leasePartyCity}`, contentWidth);
      doc.text(cityLine, margin, lineY);
      lineY += cityLine.length * lineH;
    }
    if (isValid(lease.leasePartyPin)) {
      doc.text(`PIN: ${lease.leasePartyPin}`, margin, lineY);
      lineY += lineH;
    }

    y = lineY + 2 * scale;

    // ----- SUBJECT -----
    const currencyFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    const currentNoticeCount = (lease.noticeCount || 0) + 1;

    let subject = "";
    let body = "";
    if (noticeType === "REMINDER") {
      subject = `Subject: ${getOrdinal(currentNoticeCount)} Reminder for Outstanding Lease Payment`;
      body = `This is to formally remind you about the outstanding payment for the lease of Pond "${lease.pond.name}" located at ${lease.pond.location}.`;
    } else {
      subject = `Subject: ${getOrdinal(currentNoticeCount)} Intimation of Lease Agreement Expiry`;
      body = `This is to inform you that your lease agreement for Pond "${lease.pond.name}" located at ${lease.pond.location} is expiring on ${format(new Date(lease.leaseEndDate), "dd/MM/yyyy")}.`;
    }

    doc.setFont("times", "bold");
    doc.setFontSize(scaled(8));
    doc.setTextColor(31, 62, 97);
    const subjectLines = doc.splitTextToSize(subject, contentWidth);
    doc.text(subjectLines, pageWidth / 2, y, { align: "center" });
    y += (subjectLines.length * lineH) + 2 * scale;

    // ----- BODY -----
    doc.setFont("helvetica", "normal");
    doc.setFontSize(scaled(9));
    doc.setTextColor(40, 40, 40);
    doc.text("Dear Sir/Madam,", margin, y);
    y += lineH;

    const bodyLines = doc.splitTextToSize(body, contentWidth);
    doc.text(bodyLines, margin, y);
    y += (bodyLines.length * lineH) + 2 * scale;

    if (noticeType === "REMINDER") {
      // Pending amount paragraph
      const pendingBody = `The total outstanding amount as of today is Rs. ${currencyFormatter.format(lease.pendingAmount)}. We request you to clear the pending dues at the earliest to avoid any furth[...]`;
      const pendingLines = doc.splitTextToSize(pendingBody, contentWidth);
      doc.text(pendingLines, margin, y);
      y += (pendingLines.length * lineH) + 2 * scale;

      // 7‑day payment deadline – BOLD RED
      doc.setFont("helvetica", "bold");
      doc.setTextColor(185, 28, 28);
      const deadlineNotice = "Please note that you are required to pay the outstanding amount within 7 days of receiving this letter.";
      const deadlineLines = doc.splitTextToSize(deadlineNotice, contentWidth);
      doc.text(deadlineLines, margin, y);
      y += (deadlineLines.length * lineH) + 2 * scale;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);

      // ---- Summary Table & Year-wise Table (side‑by‑side) ----
      const summaryHead = [["Sl. No.", "Particulars", "Amount (Rs.)"]];
      const summaryBody = [
        ["1", "Pond Name", lease.pond.name],
        ["2", "Location", lease.pond.location],
        ["3", "Total Lease Amount", currencyFormatter.format(lease.totalAmount)],
        ["4", "Amount Paid", currencyFormatter.format(lease.paidAmount)],
        ["5", "Outstanding Balance", currencyFormatter.format(lease.pendingAmount)],
      ];

      // Year‑wise breakdown data
      const totalPaidAcrossAllYears = Number(lease.paidAmount) || 0;
      const totalAmount = Number(lease.totalAmount) || 0;
      let remainingPaidAmount = totalPaidAcrossAllYears;
      const leaseStartDate = new Date(lease.leaseStartDate);
      const leaseEndDate = new Date(lease.leaseEndDate);
      let totalYears = differenceInYears(leaseEndDate, leaseStartDate);
      if (totalYears <= 0) totalYears = 1;
      const yearlyAmount = totalYears > 0 ? totalAmount / totalYears : 0;

      const yearlyBreakdown = Array.from({ length: totalYears }, (_, i) => {
        const yearStart = addYears(leaseStartDate, i);
        const paidForThisYear = Math.min(remainingPaidAmount, yearlyAmount);
        remainingPaidAmount -= paidForThisYear;
        return {
          yearLabel: `Year ${i + 1}`,
          calendarYear: getYear(yearStart),
          due: yearlyAmount,
          paid: paidForThisYear,
          pending: yearlyAmount - paidForThisYear,
        };
      });

      // If no yearly data, just draw summary full‑width
      if (yearlyBreakdown.length === 0) {
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: summaryHead,
          body: summaryBody,
          theme: "grid",
          headStyles: {
            fillColor: [31, 62, 97],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: scaled(8),
            halign: "left",
          },
          columnStyles: {
            0: { cellWidth: 14 * scale, halign: "center" },
            1: { cellWidth: "auto", halign: "left" },
            2: { cellWidth: 32 * scale, halign: "right" },
          },
          styles: {
            fontSize: scaled(8),
            cellPadding: 1.5 * scale,
            overflow: "linebreak",
            textColor: [40, 40, 40],
            lineColor: [200, 200, 200],
          },
          alternateRowStyles: { fillColor: [248, 250, 252] },
        });
        y = (doc as any).lastAutoTable.finalY + 2 * scale;
      } else {
        // ---- Side‑by‑side tables ----
        const gapBetweenTables = 4 * scale;
        const halfWidth = (contentWidth - gapBetweenTables) / 2;

        // Left table: Summary
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin + halfWidth + gapBetweenTables },
          tableWidth: halfWidth,
          head: summaryHead,
          body: summaryBody,
          theme: "grid",
          headStyles: {
            fillColor: [31, 62, 97],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: scaled(7.5),
            halign: "left",
          },
          columnStyles: {
            0: { cellWidth: 12 * scale, halign: "center" },
            1: { cellWidth: "auto", halign: "left" },
            2: { cellWidth: 28 * scale, halign: "right" },
          },
          styles: {
            fontSize: scaled(7.5),
            cellPadding: 1.2 * scale,
            overflow: "linebreak",
            textColor: [40, 40, 40],
            lineColor: [200, 200, 200],
          },
          alternateRowStyles: { fillColor: [248, 250, 252] },
        });
        const leftFinalY = (doc as any).lastAutoTable.finalY;

        // Right table: Year‑wise Breakdown
        autoTable(doc, {
          startY: y,
          margin: { left: margin + halfWidth + gapBetweenTables, right: margin },
          tableWidth: halfWidth,
          head: [["Year", "Fin. Year", "Due (Rs.)", "Paid (Rs.)", "Out. (Rs.)"]],
          body: yearlyBreakdown.map(item => [
            item.yearLabel,
            item.calendarYear.toString(),
            currencyFormatter.format(item.due),
            currencyFormatter.format(item.paid),
            currencyFormatter.format(item.pending),
          ]),
          theme: "grid",
          headStyles: {
            fillColor: [31, 62, 97],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: scaled(7.5),
            halign: "center",
          },
          columnStyles: {
            0: { cellWidth: 14 * scale, halign: "center" },
            1: { cellWidth: 18 * scale, halign: "center" },
            2: { cellWidth: 22 * scale, halign: "right" },
            3: { cellWidth: 22 * scale, halign: "right" },
            4: { cellWidth: 22 * scale, halign: "right" },
          },
          styles: {
            fontSize: scaled(7.5),
            cellPadding: 1.2 * scale,
            textColor: [40, 40, 40],
            lineColor: [200, 200, 200],
          },
          alternateRowStyles: { fillColor: [248, 250, 252] },
        });
        const rightFinalY = (doc as any).lastAutoTable.finalY;

        // Move Y below the taller table
        y = Math.max(leftFinalY, rightFinalY) + 2 * scale;
      }

      // ---- Important Notice Box ----
      const noticeText =
        "Important: Payment of outstanding lease dues is mandatory. Non-compliance may result in cancellation of the lease agreement and/or legal proceedings as per applicable rules and regulations.";
      const noticeLines = doc.splitTextToSize(noticeText, contentWidth - 6);
      const boxHeight = 4 * scale + noticeLines.length * lineH;
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(185, 28, 28);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(scaled(8));
      doc.setTextColor(185, 28, 28);
      doc.text("IMPORTANT NOTICE", margin + 3, y + 3.5 * scale);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(scaled(8));
      doc.setTextColor(40, 40, 40);
      doc.text(noticeLines, margin + 3, y + 7 * scale);
      y += boxHeight + 4 * scale;

    } else { // EXPIRY
      const expiryBody = `You are requested to contact the Gram Panchayat office at the earliest to discuss the renewal process or for any further clarifications.`;
      const expiryLines = doc.splitTextToSize(expiryBody, contentWidth);
      doc.text(expiryLines, margin, y);
      y += expiryLines.length * lineH + 2 * scale;

      // 7‑day contact deadline – BOLD RED
      doc.setFont("helvetica", "bold");
      doc.setTextColor(185, 28, 28);
      const contactDeadline = "Please note that you are required to contact the Gram Panchayat office within 7 days of receiving this letter to discuss the renewal process.";
      const contactLines = doc.splitTextToSize(contactDeadline, contentWidth);
      doc.text(contactLines, margin, y);
      y += contactLines.length * lineH + 3 * scale;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
    }

    // ----- CLOSING -----
    doc.setFont("helvetica", "normal");
    doc.setFontSize(scaled(9));
    doc.setTextColor(40, 40, 40);
    doc.text("Thanking you in anticipation.", margin, y);
    y += 6 * scale;

    // ----- SIGNATURE -----
    const signX = pageWidth - margin - 42 * scale;
    doc.text("Yours faithfully,", signX, y);
    y += 8 * scale;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(scaled(9));
    doc.setTextColor(40, 40, 40);
    doc.text("Pradhan/EA/Secretary", signX + 8 * scale, y);
    doc.setLineWidth(0.4);
    doc.setDrawColor(40, 40, 40);
    doc.line(signX, y + 4 * scale, pageWidth - margin, y + 4 * scale);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(scaled(8));
    doc.setTextColor(80, 80, 80);
    doc.text(gpname, signX, y + 8 * scale);
  };

  // ===== MAIN LOOP =====
  leases.forEach((lease, index) => {
    if (index > 0) doc.addPage();

    const usableHeight = pageHeight - margin * 2;
    const gap = 6 * scale;
    const halfHeight = (usableHeight - gap) / 2;

    // Top copy – Party
    drawSingleNotice(doc, lease, noticeType, margin, "ORIGINAL – PARTY COPY", false);

    // Dashed separator line
    const lineY = margin + halfHeight + gap / 2;
    doc.setDrawColor(150);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([3, 3], 0);
    doc.line(margin, lineY, pageWidth - margin, lineY);
    doc.setLineDashPattern([], 0);

    // Bottom copy – Office
    drawSingleNotice(doc, lease, noticeType, lineY + gap / 2, "OFFICE COPY (For Record)", true);
  });

  // ===== SAVE =====
  const fileName =
    leases.length === 1
      ? `Lease_Notice_${leases[0].leasePartyName.replace(/\s+/g, "_")}.pdf`
      : `Bulk_Lease_Notices_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`;

  doc.save(fileName);
};
