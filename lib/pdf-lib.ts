import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, addYears, getYear, differenceInYears } from "date-fns";
import { gpname, gpaddress } from "@/constants/gpinfor";

// --- Unified styling constants ---
const MARGIN = 8;                // mm
const SCALE = 0.75;              // font/space multiplier
const scaled = (size: number) => Math.max(size * SCALE, 5);
const LINE_H = 4 * SCALE;      // consistent line height

export const generateLeaseNoticePDF = (leasesInput: any | any[], noticeType: string) => {
  const leases = Array.isArray(leasesInput) ? leasesInput : [leasesInput];
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ----- draw a single notice (one copy) -----
  const drawSingleNotice = (
    doc: jsPDF,
    lease: any,
    noticeType: string,
    startY: number,
    label: string,
    isOfficeCopy: boolean
  ) => {
    let y = startY;
    const contentWidth = pageWidth - MARGIN * 2;

    // ---- LABEL (top of each copy) ----
    doc.setFont("helvetica", "bold");
    doc.setFontSize(scaled(11));
    doc.setTextColor(isOfficeCopy ? 185 : 31, isOfficeCopy ? 28 : 62, isOfficeCopy ? 28 : 97);
    doc.text(label, pageWidth / 2, y, { align: "center" });
    y += 5 * SCALE;

    // ---- HEADER BAR (full width, dark blue) ----
    const barHeight = 14 * SCALE;
    doc.setFillColor(31, 62, 97);
    doc.rect(MARGIN, y, pageWidth - 2 * MARGIN, barHeight, "F");

    doc.setFont("times", "bold");
    doc.setFontSize(scaled(14));
    doc.setTextColor(255, 255, 255);
    doc.text(gpname.toUpperCase(), pageWidth / 2, y + 6 * SCALE, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(scaled(9));
    doc.text(gpaddress, pageWidth / 2, y + 11 * SCALE, { align: "center" });

    y += barHeight + 4 * SCALE;

    // ---- OFFICIAL NOTICE (with underline) ----
    doc.setFont("helvetica", "bold");
    doc.setFontSize(scaled(13));
    doc.setTextColor(31, 62, 97);
    doc.text("OFFICIAL NOTICE", pageWidth / 2, y, { align: "center" });
    doc.setDrawColor(31, 62, 97);
    doc.setLineWidth(0.6);
    const underlineWidth = 40 * SCALE;
    doc.line(pageWidth / 2 - underlineWidth / 2, y + 2 * SCALE, pageWidth / 2 + underlineWidth / 2, y + 2 * SCALE);
    y += 6 * SCALE;

    // ---- MEMO & DATE (side by side) ----
    doc.setFontSize(scaled(9));
    doc.setTextColor(50, 50, 50);
    // Memo (left)
    doc.setFont("helvetica", "bold");
    doc.text("Memo No.", MARGIN, y);
    doc.setFont("helvetica", "normal");
    const memoText = `: GP/Lease/Notice/${getYear(new Date())}/${lease.id.slice(-4)}`;
    doc.text(memoText, MARGIN + 20 * SCALE, y);
    // Date (right)
    doc.setFont("helvetica", "bold");
    const dateLabelX = pageWidth - MARGIN - 44 * SCALE;
    doc.text("Date", dateLabelX, y);
    doc.setFont("helvetica", "normal");
    doc.text(`: ${format(new Date(), "dd/MM/yyyy")}`, dateLabelX + 12 * SCALE, y);
    y += 5 * SCALE;

    // ---- RECIPIENT ADDRESS (indented) ----
    doc.setFont("helvetica", "bold");
    doc.setFontSize(scaled(9));
    doc.setTextColor(50, 50, 50);
    doc.text("To:", MARGIN, y);
    y += 3.5 * SCALE;

    const indent = 12 * SCALE;
    doc.setFont("times", "bold");
    doc.setFontSize(scaled(10));
    doc.setTextColor(31, 62, 97);
    const partyNameLines = doc.splitTextToSize(lease.leasePartyName || "", contentWidth - indent);
    doc.text(partyNameLines, MARGIN + indent, y);
    let lineY = y + (partyNameLines.length * LINE_H);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(scaled(9));
    doc.setTextColor(60, 60, 60);

    const isValid = (val: any) => val && val !== "null" && val !== "undefined";

    if (isValid(lease.leasePartyFatherName)) {
      const fatherNameLines = doc.splitTextToSize(`S/o ${lease.leasePartyFatherName}`, contentWidth - indent);
      doc.text(fatherNameLines, MARGIN + indent, lineY);
      lineY += fatherNameLines.length * LINE_H;
    }
    if (isValid(lease.leasePartyAddressLine1)) {
      const addr1Lines = doc.splitTextToSize(lease.leasePartyAddressLine1, contentWidth - indent);
      doc.text(addr1Lines, MARGIN + indent, lineY);
      lineY += addr1Lines.length * LINE_H;
    }
    if (isValid(lease.leasePartyAddressLine2)) {
      const addr2Lines = doc.splitTextToSize(lease.leasePartyAddressLine2, contentWidth - indent);
      doc.text(addr2Lines, MARGIN + indent, lineY);
      lineY += addr2Lines.length * LINE_H;
    }
    if (isValid(lease.leasePartyCity)) {
      const cityLine = doc.splitTextToSize(`District: ${lease.leasePartyCity}`, contentWidth - indent);
      doc.text(cityLine, MARGIN + indent, lineY);
      lineY += cityLine.length * LINE_H;
    }
    if (isValid(lease.leasePartyPin)) {
      doc.text(`PIN: ${lease.leasePartyPin}`, MARGIN + indent, lineY);
      lineY += LINE_H;
    }
    y = lineY + 4 * SCALE;

    // ---- SUBJECT (left‑aligned, bold, coloured) ----
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
      subject = `${getOrdinal(currentNoticeCount)} Reminder for Outstanding Lease Payment`;
      body = `This is to formally remind you about the outstanding payment for the lease of Pond "${lease.pond.name}" located at ${lease.pond.location}.`;
    } else {
      subject = `${getOrdinal(currentNoticeCount)} Intimation of Lease Agreement Expiry`;
      body = `This is to inform you that your lease agreement for Pond "${lease.pond.name}" located at ${lease.pond.location} is expiring on ${format(new Date(lease.leaseEndDate), "dd/MM/yyyy")}.`;
    }

    doc.setFont("times", "bold");
    doc.setFontSize(scaled(10));
    doc.setTextColor(31, 62, 97);
    const subjectLines = doc.splitTextToSize(`Subject: ${subject}`, contentWidth);
    doc.text(subjectLines, MARGIN, y);
    y += (subjectLines.length * LINE_H) + 3 * SCALE;

    // ---- BODY ----
    doc.setFont("helvetica", "normal");
    doc.setFontSize(scaled(9));
    doc.setTextColor(40, 40, 40);
    doc.text("Dear Sir/Madam,", MARGIN, y);
    y += LINE_H;

    const bodyLines = doc.splitTextToSize(body, contentWidth);
    doc.text(bodyLines, MARGIN, y);
    y += (bodyLines.length * LINE_H) + 3 * SCALE;

    // --- Reminder-specific content ---
    if (noticeType === "REMINDER") {
      // Pending amount paragraph
      const pendingBody = `The total outstanding amount as of today is Rs. ${currencyFormatter.format(lease.pendingAmount)}. We request you to clear the pending dues at the earliest to avoid any further[...]`;
      const pendingLines = doc.splitTextToSize(pendingBody, contentWidth);
      doc.text(pendingLines, MARGIN, y);
      y += (pendingLines.length * LINE_H) + 3 * SCALE;

      // 7‑day payment deadline – BOLD RED
      doc.setFont("helvetica", "bold");
      doc.setTextColor(185, 28, 28);
      const deadlineNotice = "Please note that you are required to pay the outstanding amount within 7 days of receiving this letter.";
      const deadlineLines = doc.splitTextToSize(deadlineNotice, contentWidth);
      doc.text(deadlineLines, MARGIN, y);
      y += (deadlineLines.length * LINE_H) + 4 * SCALE;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);

      // ---- Summary Table ----
      const summaryRows = [
        ["Pond Name", lease.pond.name],
        ["Location", lease.pond.location],
        ["Total Lease Amount", currencyFormatter.format(lease.totalAmount)],
        ["Amount Paid", currencyFormatter.format(lease.paidAmount)],
        ["Outstanding Balance", currencyFormatter.format(lease.pendingAmount)],
      ];

      const tableHead = [["Sl. No.", "Particulars", "Amount (Rs.)"]];
      const tableBody = summaryRows.map((row, idx) => [
        (idx + 1).toString(),
        row[0],
        row[1],
      ]);

      autoTable(doc, {
        startY: y,
        margin: { left: MARGIN, right: MARGIN },
        head: tableHead,
        body: tableBody,
        theme: "grid",
        headStyles: {
          fillColor: [31, 62, 97],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: scaled(8),
          halign: "left",
        },
        columnStyles: {
          0: { cellWidth: 14 * SCALE, halign: "center" },
          1: { cellWidth: "auto", halign: "left" },
          2: { cellWidth: 34 * SCALE, halign: "right" },
        },
        styles: {
          fontSize: scaled(8),
          cellPadding: 1.8 * SCALE,
          overflow: "linebreak",
          textColor: [40, 40, 40],
          lineColor: [200, 200, 200],
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didDrawCell: (data) => {
          // Make total rows bold and outstanding red
          const rowIndex = data.row.index;
          if (rowIndex === 2 || rowIndex === 3 || rowIndex === 4) {
            data.cell.styles.fontStyle = "bold";
            if (rowIndex === 4) {
              data.cell.styles.textColor = [185, 28, 28];
            }
          }
        },
      });
      const summaryFinalY = (doc as any).lastAutoTable.finalY;
      y = summaryFinalY + 4 * SCALE;

      // ---- Year-wise breakdown (separate table) ----
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

      if (yearlyBreakdown.length > 0) {
        const yearHead = [["Year", "Fin. Year", "Due (Rs.)", "Paid (Rs.)", "Out. (Rs.)"]];
        const yearBody = yearlyBreakdown.map(item => [
          item.yearLabel,
          item.calendarYear.toString(),
          currencyFormatter.format(item.due),
          currencyFormatter.format(item.paid),
          currencyFormatter.format(item.pending),
        ]);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(scaled(9));
        doc.setTextColor(31, 62, 97);
        doc.text("Year-wise Lease Payment Breakdown", MARGIN, y);
        y += 4 * SCALE;

        autoTable(doc, {
          startY: y,
          margin: { left: MARGIN, right: MARGIN },
          head: yearHead,
          body: yearBody,
          theme: "grid",
          headStyles: {
            fillColor: [31, 62, 97],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: scaled(8),
            halign: "center",
          },
          columnStyles: {
            0: { cellWidth: 18 * SCALE, halign: "center" },
            1: { cellWidth: 20 * SCALE, halign: "center" },
            2: { cellWidth: 24 * SCALE, halign: "right" },
            3: { cellWidth: 24 * SCALE, halign: "right" },
            4: { cellWidth: 24 * SCALE, halign: "right" },
          },
          styles: {
            fontSize: scaled(8),
            cellPadding: 1.8 * SCALE,
            textColor: [40, 40, 40],
            lineColor: [200, 200, 200],
          },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          didDrawCell: (data) => {
            // Make pending column red if outstanding > 0
            if (data.column.index === 4 && data.row.index >= 0) {
              const raw = data.cell.raw;
              const num = parseFloat(String(raw).replace(/,/g, ""));
              if (num > 0) {
                data.cell.styles.textColor = [185, 28, 28];
              }
            }
          },
        });
        y = (doc as any).lastAutoTable.finalY + 4 * SCALE;
      }

      // ---- Important Notice Box (full width, with left border) ----
      const noticeText =
        "Important: Payment of outstanding lease dues is mandatory. Non-compliance may result in cancellation of the lease agreement and/or legal proceedings as per applicable rules and regulations.";
      const noticeLines = doc.splitTextToSize(noticeText, contentWidth - 10 * SCALE);
      const boxHeight = 8 * SCALE + noticeLines.length * LINE_H;
      // Background and border
      doc.setFillColor(255, 242, 242);
      doc.setDrawColor(185, 28, 28);
      doc.setLineWidth(0.5);
      doc.roundedRect(MARGIN, y, contentWidth, boxHeight, 2, 2, "F");
      // Thick left border
      doc.setLineWidth(2.5);
      doc.setDrawColor(185, 28, 28);
      doc.line(MARGIN, y + 2, MARGIN, y + boxHeight - 2);
      // Text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(scaled(9));
      doc.setTextColor(185, 28, 28);
      doc.text("IMPORTANT NOTICE", MARGIN + 6 * SCALE, y + 5 * SCALE);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(scaled(8));
      doc.setTextColor(40, 40, 40);
      doc.text(noticeLines, MARGIN + 6 * SCALE, y + 9 * SCALE);
      y += boxHeight + 6 * SCALE;

    } else { // EXPIRY
      const expiryBody = `You are requested to contact the Gram Panchayat office at the earliest to discuss the renewal process or for any further clarifications.`;
      const expiryLines = doc.splitTextToSize(expiryBody, contentWidth);
      doc.text(expiryLines, MARGIN, y);
      y += expiryLines.length * LINE_H + 3 * SCALE;

      // 7‑day contact deadline – BOLD RED
      doc.setFont("helvetica", "bold");
      doc.setTextColor(185, 28, 28);
      const contactDeadline = "Please note that you are required to contact the Gram Panchayat office within 7 days of receiving this letter to discuss the renewal process.";
      const contactLines = doc.splitTextToSize(contactDeadline, contentWidth);
      doc.text(contactLines, MARGIN, y);
      y += contactLines.length * LINE_H + 4 * SCALE;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
    }

    // ---- CLOSING ----
    doc.setFont("helvetica", "normal");
    doc.setFontSize(scaled(9));
    doc.setTextColor(40, 40, 40);
    doc.text("Thanking you in anticipation.", MARGIN, y);
    y += 8 * SCALE;

    // ---- SIGNATURE (right‑aligned) ----
    const signX = pageWidth - MARGIN - 44 * SCALE;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(scaled(9));
    doc.text("Yours faithfully,", signX, y);
    y += 6 * SCALE;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(scaled(9));
    doc.setTextColor(40, 40, 40);
    doc.text("Pradhan/EA/Secretary", signX + 2 * SCALE, y);
    // Signature line
    doc.setLineWidth(0.4);
    doc.setDrawColor(40, 40, 40);
    const lineStart = signX - 6 * SCALE;
    const lineEnd = pageWidth - MARGIN;
    doc.line(lineStart, y + 4 * SCALE, lineEnd, y + 4 * SCALE);
    // GP name below
    doc.setFont("helvetica", "normal");
    doc.setFontSize(scaled(8));
    doc.setTextColor(80, 80, 80);
    doc.text(gpname, signX - 4 * SCALE, y + 9 * SCALE);
  };

  // ===== MAIN LOOP =====
  leases.forEach((lease, index) => {
    if (index > 0) doc.addPage();

    const usableHeight = pageHeight - MARGIN * 2;
    const gap = 6 * SCALE;
    const halfHeight = (usableHeight - gap) / 2;

    // Top copy – Party
    drawSingleNotice(doc, lease, noticeType, MARGIN, "ORIGINAL – PARTY COPY", false);

    // Dashed separator line
    const lineY = MARGIN + halfHeight + gap / 2;
    doc.setDrawColor(150);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([3, 3], 0);
    doc.line(MARGIN, lineY, pageWidth - MARGIN, lineY);
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
