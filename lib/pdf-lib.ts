import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, addYears, getYear, differenceInYears } from "date-fns";
import { gpname, gpaddress } from "@/constants/gpinfor";

// ==============================
// 1. BENGALI FONT SETUP (placeholder – replace with actual base64)
// ==============================
// Add your font files to the project and convert to base64.
// Example:
// import bengaliFont from "./fonts/NotoSansBengali-Regular.base64";
// import bengaliFontBold from "./fonts/NotoSansBengali-Bold.base64";

// const FONT_BENGALI_REGULAR = "your_base64_string_here";
// const FONT_BENGALI_BOLD = "your_base64_string_here";

// ==============================
// 2. TRANSLATION DICTIONARY
// ==============================
const translations = {
  en: {
    officialNotice: "OFFICIAL NOTICE",
    memoNo: "Memo No.",
    date: "Date",
    to: "To,",
    subject: "Subject:",
    dearSirMadam: "Dear Sir/Madam,",
    thankingAnticipation: "Thanking you in anticipation.",
    yoursFaithfully: "Yours faithfully,",
    // Reminder
    reminderSubject: (count: number) =>
      `${count}${getOrdinal(count)} Reminder for Outstanding Lease Payment`,
    reminderBody: (pondName: string, location: string) =>
      `This is to formally remind you about the outstanding payment for the lease of Pond "${pondName}" located at ${location}.`,
    pendingAmountIntro: (amount: string) =>
      `The total outstanding amount as of today is Rs. ${amount}. We request you to clear the pending dues at the earliest to avoid any further action.`,
    paymentDeadline:
      "Please note that you are required to pay the outstanding amount within 7 days of receiving this letter.",
    importantNotice:
      "Important: Payment of outstanding lease dues is mandatory. Non-compliance may result in cancellation of the lease agreement and/or legal proceedings as per applicable rules and regulations.",
    // Expiry
    expirySubject: (count: number) =>
      `${count}${getOrdinal(count)} Intimation of Lease Agreement Expiry`,
    expiryBody: (pondName: string, location: string, endDate: string) =>
      `This is to inform you that your lease agreement for Pond "${pondName}" located at ${location} is expiring on ${endDate}.`,
    expiryRenewal:
      "You are requested to contact the Gram Panchayat office at the earliest to discuss the renewal process or for any further clarifications.",
    expiryContactDeadline:
      "Please note that you are required to contact the Gram Panchayat office within 7 days of receiving this letter to discuss the renewal process.",
    // Table headers
    tableSlNo: "Sl. No.",
    tableParticulars: "Particulars",
    tableAmount: "Amount (Rs.)",
    tableYear: "Year",
    tableFinYear: "Fin. Year",
    tableDue: "Due (Rs.)",
    tablePaid: "Paid (Rs.)",
    tableOut: "Out. (Rs.)",
    // Particulars
    pondName: "Pond Name",
    location: "Location",
    totalLeaseAmount: "Total Lease Amount",
    amountPaid: "Amount Paid",
    outstandingBalance: "Outstanding Balance",
  },
  bn: {
    officialNotice: "সরকারি নোটিশ",
    memoNo: "মেমো নং",
    date: "তারিখ",
    to: "প্রতি,",
    subject: "বিষয়:",
    dearSirMadam: "প্রিয় মহোদয়/মহোদয়া,",
    thankingAnticipation: "আপনার সহযোগিতা কামনা করছি।",
    yoursFaithfully: "বিনীত,",
    reminderSubject: (count: number) =>
      `বকেয়া লিজ পরিশোধের জন্য ${count}তম স্মারক`,
    reminderBody: (pondName: string, location: string) =>
      `আপনাকে পুকুর "${pondName}" (অবস্থান: ${location}) এর লিজের বকেয়া অর্থ প্রদানের বিষয়ে আনুষ্ঠানিকভাবে স্মরণ করানো হচ্ছে।`,
    pendingAmountIntro: (amount: string) =>
      `আজকের তারিখ পর্যন্ত মোট বকেয়া পরিমাণ Rs. ${amount}। আমরা আপনাকে অনুরোধ করছি যেন尽早 বকেয়া পরিশোধ করেন, অন্যথায় পরবর্তী আইনি পদক্ষেপ নেওয়া হবে।`,
    paymentDeadline:
      "দয়া করে মনে রাখবেন, এই পত্র পাওয়ার ৭ দিনের মধ্যে বকেয়া পরিশোধ করতে হবে।",
    importantNotice:
      "গুরুত্বপূর্ণ: বকেয়া লিজ পরিশোধ বাধ্যতামূলক। নিয়ম না মানলে লিজ চুক্তি বাতিল এবং/অথবা প্রযোজ্য আইনানুগ ব্যবস্থা নেওয়া হতে পারে।",
    expirySubject: (count: number) =>
      `লিজ চুক্তির মেয়াদ শেষ হওয়ার ${count}তম সূচনা`,
    expiryBody: (pondName: string, location: string, endDate: string) =>
      `আমরা আপনাকে জানাচ্ছি যে, পুকুর "${pondName}" (অবস্থান: ${location}) এর লিজ চুক্তি ${endDate} তারিখে শেষ হচ্ছে।`,
    expiryRenewal:
      "আপনাকে অনুরোধ করা হচ্ছে যেন নবায়ন প্রক্রিয়া বা যেকোনো প্রশ্নের জন্য দ্রুত গ্রাম পঞ্চায়েত অফিসে যোগাযোগ করেন।",
    expiryContactDeadline:
      "দয়া করে মনে রাখবেন, এই পত্র পাওয়ার ৭ দিনের মধ্যে নবায়ন প্রক্রিয়া নিয়ে আলোচনার জন্য গ্রাম পঞ্চায়েত অফিসে যোগাযোগ করতে হবে।",
    tableSlNo: "ক্রমিক নং",
    tableParticulars: "বিবরণ",
    tableAmount: "পরিমাণ (টাকা)",
    tableYear: "বছর",
    tableFinYear: "আর্থিক বছর",
    tableDue: "প্রাপ্য",
    tablePaid: "পরিশোধিত",
    tableOut: "বাকি",
    pondName: "পুকুরের নাম",
    location: "অবস্থান",
    totalLeaseAmount: "মোট লিজ পরিমাণ",
    amountPaid: "পরিশোধিত পরিমাণ",
    outstandingBalance: "বকেয়া পরিমাণ",
  },
};

// Helper for ordinal suffixes (English only)
function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ==============================
// 3. MAIN GENERATION FUNCTION
// ==============================
export const generateLeaseNoticePDF = (leasesInput: any | any[], noticeType: string) => {
  const leases = Array.isArray(leasesInput) ? leasesInput : [leasesInput];
  const doc = new jsPDF("p", "mm", "a4");

  // ==============================
  // REGISTER BENGALI FONT (uncomment when font files are available)
  // ==============================
  // doc.addFileToVFS("NotoSansBengali-Regular.ttf", FONT_BENGALI_REGULAR);
  // doc.addFont("NotoSansBengali-Regular.ttf", "NotoSansBengali", "normal");
  // doc.addFileToVFS("NotoSansBengali-Bold.ttf", FONT_BENGALI_BOLD);
  // doc.addFont("NotoSansBengali-Bold.ttf", "NotoSansBengali", "bold");

  // Fallback: if Bengali font not loaded, use a generic font that might support Bengali (e.g., "freeserif" is not built-in; we'll use helvetica for demo)
  // For production, ensure you load the font.

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;

  // Scale factors
  const scale = 0.7;
  const scaled = (size: number) => Math.max(size * scale, 5);
  const lineH = 3.5 * scale;

  // Utility: split text and return line count
  const splitAndDraw = (
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    font: string,
    style: string,
    size: number,
    color: [number, number, number],
    align: "left" | "center" | "right" = "left",
    maxWidth: number = contentWidth
  ): { lines: string[]; finalY: number } => {
    doc.setFont(font, style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y, { align });
    return { lines, finalY: y + lines.length * lineH };
  };

  // ==============================
  // DRAW A SINGLE BILINGUAL NOTICE (full page)
  // ==============================
  const drawBilingualNotice = (
    doc: jsPDF,
    lease: any,
    noticeType: string,
    startY: number,
    copyLabel: string, // e.g., "ORIGINAL – PARTY COPY" or "OFFICE COPY (For Record)"
    isOfficeCopy: boolean
  ) => {
    let y = startY;

    // ----- PAGE HEADER with GP Name, Address, Logo placeholder -----
    // Logo placeholder (replace with actual image)
    // doc.addImage(logoBase64, "PNG", margin, y, 20, 20);
    // For now, draw a box
    doc.setDrawColor(31, 62, 97);
    doc.setFillColor(240, 245, 255);
    doc.roundedRect(margin, y, 20, 20, 2, 2, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(scaled(6));
    doc.setTextColor(31, 62, 97);
    doc.text("LOGO", margin + 5, y + 11, { align: "center" });

    // GP Name (centered)
    doc.setFont("times", "bold");
    doc.setFontSize(scaled(14));
    doc.setTextColor(31, 62, 97);
    doc.text(gpname.toUpperCase(), pageWidth / 2, y + 8, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(scaled(9));
    doc.setTextColor(80, 80, 80);
    doc.text(gpaddress, pageWidth / 2, y + 14, { align: "center" });

    // Copy label (right side)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(scaled(8));
    doc.setTextColor(isOfficeCopy ? 185 : 31, 62, 97); // red for office, blue for party
    doc.text(copyLabel, pageWidth - margin, y + 8, { align: "right" });

    y += 22 * scale;

    // Separator line
    doc.setDrawColor(31, 62, 97);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 3 * scale;

    // ----- OFFICIAL NOTICE (bilingual) -----
    const noticeEn = translations.en.officialNotice;
    const noticeBn = translations.bn.officialNotice;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(scaled(12));
    doc.setTextColor(31, 62, 97);
    doc.text(noticeEn, pageWidth / 2 - 20, y, { align: "right" });
    doc.setFont("NotoSansBengali", "bold");
    doc.text(noticeBn, pageWidth / 2 + 20, y, { align: "left" });
    y += 5 * scale;

    // ----- MEMO & DATE (bilingual) -----
    const memoEn = translations.en.memoNo;
    const memoBn = translations.bn.memoNo;
    const dateEn = translations.en.date;
    const dateBn = translations.bn.date;
    const memoValue = `GP/Lease/Notice/${getYear(new Date())}/${lease.id.slice(-4)}`;
    const dateValue = format(new Date(), "dd/MM/yyyy");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(scaled(8));
    doc.setTextColor(50, 50, 50);
    // Memo (English)
    doc.text(memoEn, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(`: ${memoValue}`, margin + 22 * scale, y);
    // Memo (Bengali)
    doc.setFont("NotoSansBengali", "bold");
    doc.text(memoBn, margin + 55 * scale, y);
    doc.setFont("NotoSansBengali", "normal");
    doc.text(`: ${memoValue}`, margin + 77 * scale, y);

    // Date (English)
    doc.setFont("helvetica", "bold");
    doc.text(dateEn, pageWidth - margin - 45 * scale, y);
    doc.setFont("helvetica", "normal");
    doc.text(`: ${dateValue}`, pageWidth - margin - 35 * scale, y);
    // Date (Bengali)
    doc.setFont("NotoSansBengali", "bold");
    doc.text(dateBn, pageWidth - margin - 18 * scale, y);
    doc.setFont("NotoSansBengali", "normal");
    doc.text(`: ${dateValue}`, pageWidth - margin - 8 * scale, y);

    y += 5 * scale;

    // ----- RECIPIENT ADDRESS (bilingual) -----
    // To: (English)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(scaled(8));
    doc.setTextColor(50, 50, 50);
    doc.text(translations.en.to, margin, y);
    // To: (Bengali)
    doc.setFont("NotoSansBengali", "bold");
    doc.text(translations.bn.to, margin + 15 * scale, y);
    y += 2.5 * scale;

    // Name (English)
    doc.setFont("times", "bold");
    doc.setFontSize(scaled(9));
    doc.setTextColor(31, 62, 97);
    const partyNameLines = doc.splitTextToSize(lease.leasePartyName || "", contentWidth * 0.45);
    doc.text(partyNameLines, margin, y);
    let lineY = y + (partyNameLines.length * lineH);
    // Name (Bengali) – we'll transliterate? Assume same name, but we can just show same.
    doc.setFont("NotoSansBengali", "normal");
    doc.setFontSize(scaled(8));
    doc.setTextColor(60, 60, 60);
    // For simplicity, we show the same name in Bengali font (if it contains Bengali script, it will render; otherwise it's just English letters)
    doc.text(partyNameLines, margin + contentWidth * 0.5, y);
    y = Math.max(lineY, y + partyNameLines.length * lineH);

    // Other address fields (Father's name, address lines, city, pin) – bilingual labels
    const isValid = (val: any) => val && val !== "null" && val !== "undefined";

    const addressFields = [
      { labelEn: "S/o", labelBn: "পিতা", value: lease.leasePartyFatherName },
      { labelEn: "", labelBn: "", value: lease.leasePartyAddressLine1 },
      { labelEn: "", labelBn: "", value: lease.leasePartyAddressLine2 },
      { labelEn: "District:", labelBn: "জেলা:", value: lease.leasePartyCity },
      { labelEn: "PIN:", labelBn: "পিন:", value: lease.leasePartyPin },
    ];

    addressFields.forEach((field) => {
      if (isValid(field.value)) {
        const valLines = doc.splitTextToSize(field.value, contentWidth * 0.45);
        // English label + value
        doc.setFont("helvetica", "normal");
        doc.setFontSize(scaled(8));
        doc.setTextColor(60, 60, 60);
        if (field.labelEn) {
          doc.text(field.labelEn + " " + field.value, margin, y);
        } else {
          doc.text(field.value, margin, y);
        }
        // Bengali label + value
        doc.setFont("NotoSansBengali", "normal");
        if (field.labelBn) {
          doc.text(field.labelBn + " " + field.value, margin + contentWidth * 0.5, y);
        } else {
          doc.text(field.value, margin + contentWidth * 0.5, y);
        }
        y += valLines.length * lineH;
      }
    });

    y += 2 * scale;

    // ----- SUBJECT (bilingual) -----
    const currentNoticeCount = (lease.noticeCount || 0) + 1;
    let subjectEn = "";
    let subjectBn = "";
    let bodyEn = "";
    let bodyBn = "";

    if (noticeType === "REMINDER") {
      subjectEn = translations.en.reminderSubject(currentNoticeCount);
      subjectBn = translations.bn.reminderSubject(currentNoticeCount);
      bodyEn = translations.en.reminderBody(lease.pond.name, lease.pond.location);
      bodyBn = translations.bn.reminderBody(lease.pond.name, lease.pond.location);
    } else {
      subjectEn = translations.en.expirySubject(currentNoticeCount);
      subjectBn = translations.bn.expirySubject(currentNoticeCount);
      const endDate = format(new Date(lease.leaseEndDate), "dd/MM/yyyy");
      bodyEn = translations.en.expiryBody(lease.pond.name, lease.pond.location, endDate);
      bodyBn = translations.bn.expiryBody(lease.pond.name, lease.pond.location, endDate);
    }

    // Subject (English)
    const subjectLinesEn = doc.splitTextToSize(subjectEn, contentWidth * 0.45);
    doc.setFont("times", "bold");
    doc.setFontSize(scaled(9));
    doc.setTextColor(31, 62, 97);
    doc.text(subjectLinesEn, margin, y);
    // Subject (Bengali)
    const subjectLinesBn = doc.splitTextToSize(subjectBn, contentWidth * 0.45);
    doc.setFont("NotoSansBengali", "bold");
    doc.text(subjectLinesBn, margin + contentWidth * 0.5, y);
    y += Math.max(subjectLinesEn.length, subjectLinesBn.length) * lineH + 2 * scale;

    // ----- BODY (bilingual) -----
    // Dear Sir/Madam
    doc.setFont("helvetica", "normal");
    doc.setFontSize(scaled(9));
    doc.setTextColor(40, 40, 40);
    doc.text(translations.en.dearSirMadam, margin, y);
    doc.setFont("NotoSansBengali", "normal");
    doc.text(translations.bn.dearSirMadam, margin + contentWidth * 0.5, y);
    y += lineH;

    // Body text (English)
    const bodyLinesEn = doc.splitTextToSize(bodyEn, contentWidth * 0.45);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(scaled(9));
    doc.setTextColor(40, 40, 40);
    doc.text(bodyLinesEn, margin, y);
    // Body text (Bengali)
    const bodyLinesBn = doc.splitTextToSize(bodyBn, contentWidth * 0.45);
    doc.setFont("NotoSansBengali", "normal");
    doc.text(bodyLinesBn, margin + contentWidth * 0.5, y);
    y += Math.max(bodyLinesEn.length, bodyLinesBn.length) * lineH + 2 * scale;

    // ----- Additional paragraphs for REMINDER -----
    if (noticeType === "REMINDER") {
      // Pending amount intro
      const currencyFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
      const pendingIntroEn = translations.en.pendingAmountIntro(currencyFormatter.format(lease.pendingAmount));
      const pendingIntroBn = translations.bn.pendingAmountIntro(currencyFormatter.format(lease.pendingAmount));
      const pendingLinesEn = doc.splitTextToSize(pendingIntroEn, contentWidth * 0.45);
      const pendingLinesBn = doc.splitTextToSize(pendingIntroBn, contentWidth * 0.45);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.text(pendingLinesEn, margin, y);
      doc.setFont("NotoSansBengali", "normal");
      doc.text(pendingLinesBn, margin + contentWidth * 0.5, y);
      y += Math.max(pendingLinesEn.length, pendingLinesBn.length) * lineH + 2 * scale;

      // Payment deadline – BOLD RED
      doc.setFont("helvetica", "bold");
      doc.setTextColor(185, 28, 28);
      const deadlineEn = translations.en.paymentDeadline;
      const deadlineBn = translations.bn.paymentDeadline;
      const deadlineLinesEn = doc.splitTextToSize(deadlineEn, contentWidth * 0.45);
      const deadlineLinesBn = doc.splitTextToSize(deadlineBn, contentWidth * 0.45);
      doc.text(deadlineLinesEn, margin, y);
      doc.setFont("NotoSansBengali", "bold");
      doc.text(deadlineLinesBn, margin + contentWidth * 0.5, y);
      y += Math.max(deadlineLinesEn.length, deadlineLinesBn.length) * lineH + 2 * scale;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);

      // ---- Summary Table & Year-wise Table (side‑by‑side) with bilingual labels ----
      const summaryHead = [
        [
          translations.en.tableSlNo,
          translations.en.tableParticulars,
          translations.en.tableAmount,
        ],
        [
          translations.bn.tableSlNo,
          translations.bn.tableParticulars,
          translations.bn.tableAmount,
        ],
      ];
      const summaryBody = [
        ["1", translations.en.pondName, currencyFormatter.format(lease.totalAmount)],
        ["2", translations.en.location, lease.pond.location],
        ["3", translations.en.totalLeaseAmount, currencyFormatter.format(lease.totalAmount)],
        ["4", translations.en.amountPaid, currencyFormatter.format(lease.paidAmount)],
        ["5", translations.en.outstandingBalance, currencyFormatter.format(lease.pendingAmount)],
      ];
      // For Bengali, we need a separate body with Bengali particulars
      const summaryBodyBn = [
        ["১", translations.bn.pondName, currencyFormatter.format(lease.totalAmount)],
        ["২", translations.bn.location, lease.pond.location],
        ["৩", translations.bn.totalLeaseAmount, currencyFormatter.format(lease.totalAmount)],
        ["৪", translations.bn.amountPaid, currencyFormatter.format(lease.paidAmount)],
        ["৫", translations.bn.outstandingBalance, currencyFormatter.format(lease.pendingAmount)],
      ];

      // Year‑wise breakdown data (same for both languages)
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

      // We'll draw two tables side by side: left English, right Bengali.
      // Since we have two columns already, we need to split the table area.
      // We'll draw the English table on the left and Bengali on the right.
      // But both tables need to fit in half width. We'll use autoTable with tableWidth.
      const gapBetweenTables = 4 * scale;
      const halfWidth = (contentWidth - gapBetweenTables) / 2;

      // Left table: English summary
      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin + halfWidth + gapBetweenTables },
        tableWidth: halfWidth,
        head: [summaryHead[0]],
        body: summaryBody.map(row => [row[0], row[1], row[2]]),
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

      // Right table: Bengali summary
      autoTable(doc, {
        startY: y,
        margin: { left: margin + halfWidth + gapBetweenTables, right: margin },
        tableWidth: halfWidth,
        head: [summaryHead[1]],
        body: summaryBodyBn.map(row => [row[0], row[1], row[2]]),
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
          font: "NotoSansBengali",
          fontSize: scaled(7.5),
          cellPadding: 1.2 * scale,
          overflow: "linebreak",
          textColor: [40, 40, 40],
          lineColor: [200, 200, 200],
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });
      const rightFinalY = (doc as any).lastAutoTable.finalY;
      y = Math.max(leftFinalY, rightFinalY) + 2 * scale;

      // Year‑wise tables (if any)
      if (yearlyBreakdown.length > 0) {
        // Left: English year table
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin + halfWidth + gapBetweenTables },
          tableWidth: halfWidth,
          head: [[translations.en.tableYear, translations.en.tableFinYear, translations.en.tableDue, translations.en.tablePaid, translations.en.tableOut]],
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
        const leftYearY = (doc as any).lastAutoTable.finalY;

        // Right: Bengali year table
        autoTable(doc, {
          startY: y,
          margin: { left: margin + halfWidth + gapBetweenTables, right: margin },
          tableWidth: halfWidth,
          head: [[translations.bn.tableYear, translations.bn.tableFinYear, translations.bn.tableDue, translations.bn.tablePaid, translations.bn.tableOut]],
          body: yearlyBreakdown.map(item => [
            `বছর ${yearlyBreakdown.indexOf(item) + 1}`,
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
            font: "NotoSansBengali",
            fontSize: scaled(7.5),
            cellPadding: 1.2 * scale,
            textColor: [40, 40, 40],
            lineColor: [200, 200, 200],
          },
          alternateRowStyles: { fillColor: [248, 250, 252] },
        });
        const rightYearY = (doc as any).lastAutoTable.finalY;
        y = Math.max(leftYearY, rightYearY) + 2 * scale;
      }

      // ---- Important Notice Box (bilingual) ----
      const noticeEn = translations.en.importantNotice;
      const noticeBn = translations.bn.importantNotice;
      const noticeLinesEn = doc.splitTextToSize(noticeEn, halfWidth - 4);
      const noticeLinesBn = doc.splitTextToSize(noticeBn, halfWidth - 4);
      const boxHeight = 4 * scale + Math.max(noticeLinesEn.length, noticeLinesBn.length) * lineH;
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(185, 28, 28);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, "FD");
      // English text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(scaled(8));
      doc.setTextColor(185, 28, 28);
      doc.text("IMPORTANT NOTICE", margin + 3, y + 3.5 * scale);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(scaled(8));
      doc.setTextColor(40, 40, 40);
      doc.text(noticeLinesEn, margin + 3, y + 7 * scale);
      // Bengali text
      doc.setFont("NotoSansBengali", "bold");
      doc.setFontSize(scaled(8));
      doc.setTextColor(185, 28, 28);
      doc.text("গুরুত্বপূর্ণ বিজ্ঞপ্তি", margin + halfWidth + 3, y + 3.5 * scale);
      doc.setFont("NotoSansBengali", "normal");
      doc.setFontSize(scaled(8));
      doc.setTextColor(40, 40, 40);
      doc.text(noticeLinesBn, margin + halfWidth + 3, y + 7 * scale);
      y += boxHeight + 4 * scale;

    } else { // EXPIRY
      // Renewal paragraph
      const renewalEn = translations.en.expiryRenewal;
      const renewalBn = translations.bn.expiryRenewal;
      const renewalLinesEn = doc.splitTextToSize(renewalEn, contentWidth * 0.45);
      const renewalLinesBn = doc.splitTextToSize(renewalBn, contentWidth * 0.45);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.text(renewalLinesEn, margin, y);
      doc.setFont("NotoSansBengali", "normal");
      doc.text(renewalLinesBn, margin + contentWidth * 0.5, y);
      y += Math.max(renewalLinesEn.length, renewalLinesBn.length) * lineH + 2 * scale;

      // Contact deadline – BOLD RED
      doc.setFont("helvetica", "bold");
      doc.setTextColor(185, 28, 28);
      const contactEn = translations.en.expiryContactDeadline;
      const contactBn = translations.bn.expiryContactDeadline;
      const contactLinesEn = doc.splitTextToSize(contactEn, contentWidth * 0.45);
      const contactLinesBn = doc.splitTextToSize(contactBn, contentWidth * 0.45);
      doc.text(contactLinesEn, margin, y);
      doc.setFont("NotoSansBengali", "bold");
      doc.text(contactLinesBn, margin + contentWidth * 0.5, y);
      y += Math.max(contactLinesEn.length, contactLinesBn.length) * lineH + 3 * scale;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
    }

    // ----- CLOSING (bilingual) -----
    doc.setFont("helvetica", "normal");
    doc.setFontSize(scaled(9));
    doc.setTextColor(40, 40, 40);
    doc.text(translations.en.thankingAnticipation, margin, y);
    doc.setFont("NotoSansBengali", "normal");
    doc.text(translations.bn.thankingAnticipation, margin + contentWidth * 0.5, y);
    y += 6 * scale;

    // ----- SIGNATURE (bilingual) -----
    const signX = pageWidth - margin - 50 * scale;
    // English
    doc.setFont("helvetica", "normal");
    doc.setFontSize(scaled(9));
    doc.setTextColor(40, 40, 40);
    doc.text(translations.en.yoursFaithfully, signX, y);
    // Bengali
    doc.setFont("NotoSansBengali", "normal");
    doc.text(translations.bn.yoursFaithfully, signX + 55 * scale, y);
    y += 8 * scale;
    // Pradhan/EA/Secretary
    doc.setFont("helvetica", "bold");
    doc.setFontSize(scaled(9));
    doc.setTextColor(40, 40, 40);
    doc.text("Pradhan/EA/Secretary", signX + 8 * scale, y);
    doc.setFont("NotoSansBengali", "bold");
    doc.text("প্রধান/ইএ/সচিব", signX + 55 * scale + 8 * scale, y);
    doc.setLineWidth(0.4);
    doc.setDrawColor(40, 40, 40);
    doc.line(signX, y + 4 * scale, pageWidth - margin, y + 4 * scale);
    // GP name
    doc.setFont("helvetica", "normal");
    doc.setFontSize(scaled(8));
    doc.setTextColor(80, 80, 80);
    doc.text(gpname, signX, y + 8 * scale);
    doc.setFont("NotoSansBengali", "normal");
    doc.text(gpname, signX + 55 * scale, y + 8 * scale);

    // Page border (optional)
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.rect(margin - 2, startY - 2, pageWidth - 2 * margin + 4, pageHeight - 2 * margin + 4, "S");
  };

  // ==============================
  // MAIN LOOP – one page per copy
  // ==============================
  leases.forEach((lease, index) => {
    // Page 1: Party Copy
    if (index > 0) doc.addPage();
    drawBilingualNotice(doc, lease, noticeType, margin, "ORIGINAL – PARTY COPY", false);

    // Page 2: Office Copy
    doc.addPage();
    drawBilingualNotice(doc, lease, noticeType, margin, "OFFICE COPY (For Record)", true);
  });

  // ==============================
  // SAVE
  // ==============================
  const fileName =
    leases.length === 1
      ? `Lease_Notice_${leases[0].leasePartyName.replace(/\s+/g, "_")}.pdf`
      : `Bulk_Lease_Notices_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`;

  doc.save(fileName);
};
