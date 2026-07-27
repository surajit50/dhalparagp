import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, addYears, getYear, differenceInYears } from "date-fns";
import { gpname, gpaddress } from "@/constants/gpinfor";

export const generateLeaseNoticePDF = (leasesInput: any | any[], noticeType: string) => {
  const leases = Array.isArray(leasesInput) ? leasesInput : [leasesInput];
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;

  leases.forEach((lease, index) => {
    if (index > 0) {
      doc.addPage();
    }

    let y = 10;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    /* ---------- FORMAL HEADER ---------- */
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(31, 62, 97);
    doc.text(gpname.toUpperCase(), pageWidth / 2, y, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    y += 4;
    doc.text(gpaddress, pageWidth / 2, y, { align: "center" });

    y += 3;
    doc.setDrawColor(31, 62, 97);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);

    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(31, 62, 97);
    doc.text("OFFICIAL NOTICE", pageWidth / 2, y, { align: "center" });

    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text("Memo No.", margin, y);
    
    doc.setFont("helvetica", "normal");
    doc.text(`: GP/Lease/Notice/${getYear(new Date())}/${lease.id.slice(-4)}`, margin + 20, y);
    
    doc.setFont("helvetica", "bold");
    doc.text("Date", pageWidth - margin - 40, y);
    
    doc.setFont("helvetica", "normal");
    doc.text(`: ${format(new Date(), "dd/MM/yyyy")}`, pageWidth - margin - 30, y);

    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text("To,", margin, y);

    y += 4;
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.setTextColor(31, 62, 97);
    
    const partyNameLines = doc.splitTextToSize(lease.leasePartyName || "", contentWidth);
    doc.text(partyNameLines, margin, y);
    let lineY = y + (partyNameLines.length * 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);

    const isValid = (val: any) => val && val !== "null" && val !== "undefined";

    if (isValid(lease.leasePartyFatherName)) {
      const fatherNameLines = doc.splitTextToSize(`S/o ${lease.leasePartyFatherName}`, contentWidth);
      doc.text(fatherNameLines, margin, lineY);
      lineY += fatherNameLines.length * 4;
    }

    if (isValid(lease.leasePartyAddressLine1)) {
      const addr1Lines = doc.splitTextToSize(lease.leasePartyAddressLine1, contentWidth);
      doc.text(addr1Lines, margin, lineY);
      lineY += addr1Lines.length * 4;
    }

    if (isValid(lease.leasePartyAddressLine2)) {
      const addr2Lines = doc.splitTextToSize(lease.leasePartyAddressLine2, contentWidth);
      doc.text(addr2Lines, margin, lineY);
      lineY += addr2Lines.length * 4;
    }

    if (isValid(lease.leasePartyCity)) {
      const cityLine = doc.splitTextToSize(`District: ${lease.leasePartyCity}`, contentWidth);
      doc.text(cityLine, margin, lineY);
      lineY += cityLine.length * 4;
    }

    if (isValid(lease.leasePartyPin)) {
      doc.text(`PIN: ${lease.leasePartyPin}`, margin, lineY);
      lineY += 4;
    }

    y = lineY + 4;

    let subject = "";
    let body = "";

    const currencyFormatter = new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    });

    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    
    const currentNoticeCount = (lease.noticeCount || 0) + 1;

    if (noticeType === "REMINDER") {
      subject = `Subject: ${getOrdinal(currentNoticeCount)} Reminder for Outstanding Lease Payment`;
      body = `This is to formally remind you about the outstanding payment for the lease of Pond "${lease.pond.name}" located at ${lease.pond.location}.`;
    } else if (noticeType === "EXPIRY") {
      subject = `Subject: ${getOrdinal(currentNoticeCount)} Intimation of Lease Agreement Expiry`;
      body = `This is to inform you that your lease agreement for Pond "${lease.pond.name}" located at ${lease.pond.location} is expiring on ${format(new Date(lease.leaseEndDate), "dd/MM/yyyy")}.`;
    }

    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.setTextColor(31, 62, 97);
    const subjectLines = doc.splitTextToSize(subject, contentWidth);
    checkPageBreak(subjectLines.length * 4);
    doc.text(subjectLines, pageWidth / 2, y, { align: "center" });
    y += (subjectLines.length * 4) + 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    checkPageBreak(4);
    doc.text("Dear Sir/Madam,", margin, y);
    y += 4;

    const bodyLines = doc.splitTextToSize(body, contentWidth);
    checkPageBreak(bodyLines.length * 4);
    doc.text(bodyLines, margin, y);
    y += (bodyLines.length * 4) + 3;

    if (noticeType === "REMINDER") {
      const pendingBody = `The total outstanding amount as of today is Rs. ${currencyFormatter.format(lease.pendingAmount)}. We request you to clear the pending dues at the earliest to avoid any further action.`;
      const pendingBodyLines = doc.splitTextToSize(pendingBody, contentWidth);
      checkPageBreak(pendingBodyLines.length * 4);
      doc.text(pendingBodyLines, margin, y);
      y += (pendingBodyLines.length * 4) + 4;

      // ====== 7‑day payment deadline – BOLD RED ======
      doc.setFont("helvetica", "bold");
      doc.setTextColor(185, 28, 28); // red
      const deadlineNotice = "Please note that you are required to pay the outstanding amount within 7 days of receiving this letter.";
      const deadlineLines = doc.splitTextToSize(deadlineNotice, contentWidth);
      checkPageBreak(deadlineLines.length * 4);
      doc.text(deadlineLines, margin, y);
      y += (deadlineLines.length * 4) + 4;
      // Reset to normal text colour and font for subsequent content
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);

      checkPageBreak(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(31, 62, 97);
      doc.text("Summary of Lease Account", margin, y);
      y += 3;

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [["Sl. No.", "Particulars", "Amount (Rs.)"]],
        body: [
          ["1", "Pond Name", lease.pond.name],
          ["2", "Location", lease.pond.location],
          ["3", "Total Lease Amount", currencyFormatter.format(lease.totalAmount)],
          ["4", "Amount Paid", currencyFormatter.format(lease.paidAmount)],
          ["5", "Outstanding Balance", currencyFormatter.format(lease.pendingAmount)],
        ],
        theme: "grid",
        headStyles: {
          fillColor: [31, 62, 97],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
          halign: "left",
        },
        columnStyles: {
          0: { cellWidth: 15, halign: "center" },
          1: { cellWidth: "auto", halign: "left" },
          2: { cellWidth: 40, halign: "right" },
        },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
          textColor: [40, 40, 40],
          lineColor: [200, 200, 200],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      y = (doc as any).lastAutoTable.finalY + 5;

      const totalPaidAcrossAllYears = Number(lease.paidAmount) || 0;
      const totalAmount = Number(lease.totalAmount) || 0;
      let remainingPaidAmount = totalPaidAcrossAllYears;

      const leaseStartDate = new Date(lease.leaseStartDate);
      const leaseEndDate = new Date(lease.leaseEndDate);

      let totalYears = differenceInYears(leaseEndDate, leaseStartDate);
      if (totalYears <= 0) {
        totalYears = 1;
      }

      const yearlyAmount = totalYears > 0 ? totalAmount / totalYears : 0;

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
        checkPageBreak(12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
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
            currencyFormatter.format(item.due),
            currencyFormatter.format(item.paid),
            currencyFormatter.format(item.pending),
          ]),
          theme: "grid",
          headStyles: {
            fillColor: [31, 62, 97],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 8,
          },
          columnStyles: {
            0: { cellWidth: 20, halign: "center" },
            1: { cellWidth: 25, halign: "center" },
            2: { cellWidth: 35, halign: "right" },
            3: { cellWidth: 35, halign: "right" },
            4: { cellWidth: 35, halign: "right" },
          },
          styles: {
            fontSize: 8,
            cellPadding: 2,
            textColor: [40, 40, 40],
            lineColor: [200, 200, 200],
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252],
          },
        });

        y = (doc as any).lastAutoTable.finalY + 5;
      }

      const noticeText = "Important: Payment of outstanding lease dues is mandatory. Non-compliance may result in cancellation of the lease agreement and/or legal proceedings as per applicable rules and regulations.";
      const noticeLines = doc.splitTextToSize(noticeText, contentWidth - 6);
      const noticeHeight = 6 + (noticeLines.length * 4);
      
      checkPageBreak(noticeHeight + 4);

      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(185, 28, 28);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, y, contentWidth, noticeHeight, 2, 2, "FD");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(185, 28, 28);
      doc.text("IMPORTANT NOTICE", margin + 3, y + 4);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(40, 40, 40);
      doc.text(noticeLines, margin + 3, y + 9);
      
      y += noticeHeight + 6;
    } else {
      const expiryBody = `You are requested to contact the Gram Panchayat office at the earliest to discuss the renewal process or for any further clarifications.`;
      const expiryBodyLines = doc.splitTextToSize(expiryBody, contentWidth);
      checkPageBreak(expiryBodyLines.length * 4);
      doc.text(expiryBodyLines, margin, y);
      y += (expiryBodyLines.length * 4) + 4;

      // ====== 7‑day contact deadline – BOLD RED ======
      doc.setFont("helvetica", "bold");
      doc.setTextColor(185, 28, 28);
      const contactDeadline = "Please note that you are required to contact the Gram Panchayat office within 7 days of receiving this letter to discuss the renewal process.";
      const contactLines = doc.splitTextToSize(contactDeadline, contentWidth);
      checkPageBreak(contactLines.length * 4);
      doc.text(contactLines, margin, y);
      y += (contactLines.length * 4) + 6;
      // Reset to normal
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
    }

    checkPageBreak(35);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text("Thanking you in anticipation.", margin, y);
    y += 12;

    /* ---------- SIGNATURE SECTION (UPDATED) ---------- */
    const signatureStartX = pageWidth - margin - 50;
    
    doc.text("Yours faithfully,", signatureStartX, y);
    y += 15;
    
    const signatureStartY = y;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40); // keep signature in normal colour
    doc.text("Pradhan/EA/Secretary", signatureStartX + 10, signatureStartY);
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(40, 40, 40);
    doc.line(signatureStartX, signatureStartY + 8, pageWidth - margin, signatureStartY + 8);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(gpname, signatureStartX, signatureStartY + 12);
  });

  const fileName = leases.length === 1 
    ? `Lease_Notice_${leases[0].leasePartyName.replace(/\s+/g, "_")}.pdf` 
    : `Bulk_Lease_Notices_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`;

  doc.save(fileName);
};
