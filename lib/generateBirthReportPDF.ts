import jsPDF from "jspdf";
import QRCode from "qrcode";

export interface BirthVerificationReportData {
  id: string;
  memoNo: string;
  memoDate: Date | string;
  gpMemoNo: string;
  gpMemoDate: Date | string;
  toAuthority: string;
  toZone: string;
  subject: string;
  certificateHolder: string;
  motherName: string;
  fatherName: string;
  address: string;
  dateOfBirth: Date | string;
  registrationNo: string;
  dateOfRegistration: Date | string;
  placeOfRegistration: string;
  verificationResult: string;
  remarks?: string | null;
  status: string;
  createdAt: Date | string;
  createdByUser?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

// Color palette
const COLORS = {
  primary: "#1a4d8c",      // Deep Blue (Headings, borders)
  primaryLight: "#e8f0fa", // Light Blue (Box backgrounds)
  accent: "#c49a6c",       // Gold/Brown (Accents)
  success: "#2e7d32",      // Green (Genuine)
  error: "#c62828",        // Red (Not Genuine)
  warning: "#f57c00",      // Orange (Not Available)
  gray: "#666666",         // Subtle gray text
  border: "#cccccc",       // Light gray for borders
  white: "#ffffff",
  black: "#000000",
};

export async function generateBirthReportPDF(data: BirthVerificationReportData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = { left: 54, top: 54, right: 54, bottom: 54 };
  const contentWidth = pageWidth - margin.left - margin.right;
  let cursorY = margin.top;

  // --- Decorative Page Border with primary color ---
  doc.setDrawColor(COLORS.primary);
  doc.setLineWidth(1.5);
  doc.rect(margin.left - 20, margin.top - 20, contentWidth + 40, pageHeight - margin.top - margin.bottom + 40);
  doc.setLineWidth(0.5);
  doc.setDrawColor(COLORS.border);
  doc.rect(margin.left - 17, margin.top - 17, contentWidth + 34, pageHeight - margin.top - margin.bottom + 34);

  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    fontSize = 11,
    fontStyle = "normal",
    align: "left" | "center" | "right" = "left",
    lineHeight = 15,
    color: string = COLORS.black
  ) => {
    doc.setFont("times", fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, contentWidth - (x - margin.left));
    doc.text(lines, x, y, { align, lineHeightFactor: 1.5 });
    doc.setTextColor(COLORS.black); // reset to black
    return y + lines.length * lineHeight;
  };

  // --- Header with gradient-like effect using colored rect ---
  doc.setFillColor(COLORS.primaryLight);
  doc.rect(margin.left, cursorY - 5, contentWidth, 70, "F");

  doc.setFont("times", "bolditalic");
  doc.setFontSize(14);
  doc.setTextColor(COLORS.primary);
  doc.text("Office of The Pradhan", pageWidth / 2, cursorY, { align: "center" });
  cursorY += 24;

  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.setTextColor(COLORS.primary);
  doc.text("No 3 Dhalpara Gram Panchayat", pageWidth / 2, cursorY, { align: "center" });
  cursorY += 18;

  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.gray);
  doc.text("Trimohini, Hili, Dakshin Dinajpur, West Bengal", pageWidth / 2, cursorY, { align: "center" });
  cursorY += 16;

  // Double horizontal separator line with primary color
  doc.setDrawColor(COLORS.primary);
  doc.setLineWidth(1.5);
  doc.line(margin.left, cursorY, pageWidth - margin.right, cursorY);
  cursorY += 3;
  doc.setLineWidth(0.5);
  doc.setDrawColor(COLORS.border);
  doc.line(margin.left, cursorY, pageWidth - margin.right, cursorY);
  cursorY += 20;

  // --- Report Title ---
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(COLORS.primary);
  doc.text("VERIFICATION REPORT", pageWidth / 2, cursorY, { align: "center" });
  const titleWidth = doc.getTextWidth("VERIFICATION REPORT");
  doc.setDrawColor(COLORS.accent);
  doc.setLineWidth(1);
  doc.line((pageWidth - titleWidth) / 2, cursorY + 2, (pageWidth + titleWidth) / 2, cursorY + 2);
  cursorY += 25;
  doc.setTextColor(COLORS.black);

  // --- Reference Details (Light Blue Box) ---
  doc.setFillColor(COLORS.primaryLight);
  doc.setDrawColor(COLORS.primary);
  doc.setLineWidth(0.5);
  doc.rect(margin.left, cursorY, contentWidth, 30, "FD");

  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary);
  const refText = `Ref No.: ${data.gpMemoNo}`;
  const dateFormatted = new Date(data.gpMemoDate).toLocaleDateString("en-GB");
  const dateText = `Date: ${dateFormatted}`;

  doc.text(refText, margin.left + 10, cursorY + 20);
  doc.text(dateText, pageWidth - margin.right - 10, cursorY + 20, { align: "right" });
  cursorY += 45;
  doc.setTextColor(COLORS.black);

  // --- Addressee ---
  doc.setFont("times", "normal");
  doc.text("To", margin.left, cursorY);
  cursorY += 15;

  doc.setFont("times", "bold");
  doc.setTextColor(COLORS.primary);
  doc.text(data.toAuthority, margin.left, cursorY);
  cursorY += 14;
  doc.text(data.toZone, margin.left, cursorY);
  cursorY += 25;
  doc.setTextColor(COLORS.black);

  // --- Subject ---
  doc.setFont("times", "bold");
  doc.setTextColor(COLORS.primary);
  doc.text("Subject:", margin.left, cursorY);
  doc.setFont("times", "normal");
  doc.setTextColor(COLORS.black);
  const subjectLines = doc.splitTextToSize(data.subject, contentWidth - 50);
  doc.text(subjectLines, margin.left + 50, cursorY);
  cursorY += subjectLines.length * 15 + 10;

  // --- Salutation & Body ---
  doc.setFont("times", "bold");
  doc.text("Sir / Madam,", margin.left, cursorY);
  cursorY += 18;

  const bodyText = `With reference to your Memo No. ${data.memoNo} Dated ${new Date(data.memoDate).toLocaleDateString("en-GB")}, regarding the subject cited above, I, the undersigned, Pradhan of No. 3 Dhalpara Gram Panchayat, hereby submit the verification report regarding the birth certificate furnished by the applicant.`;
  cursorY = addWrappedText(bodyText, margin.left, cursorY, 11, "normal");
  cursorY += 12;

  doc.setFont("times", "bold");
  doc.setTextColor(COLORS.primary);
  doc.text("The particulars of the certificate are as follows:", margin.left, cursorY);
  cursorY += 15;
  doc.setTextColor(COLORS.black);

  // --- Particulars List (Styled Table) ---
  const particulars = [
    { label: "Name of Certificate Holder", value: data.certificateHolder },
    { label: "Mother's Name", value: data.motherName },
    { label: "Father's Name", value: data.fatherName },
    { label: "Address", value: data.address },
    { label: "Date of Birth", value: new Date(data.dateOfBirth).toLocaleDateString("en-GB") },
    { label: "Registration No.", value: data.registrationNo },
    { label: "Date of Registration / Issue", value: new Date(data.dateOfRegistration).toLocaleDateString("en-GB") },
    { label: "Place of Registration", value: data.placeOfRegistration }
  ];

  const tableStartY = cursorY;
  const col1Width = 160;

  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(margin.left, cursorY, pageWidth - margin.right, cursorY);

  particulars.forEach((p, i) => {
    const valText = p.value || "N/A";
    doc.setFont("times", "normal");
    const valLines = doc.splitTextToSize(valText, contentWidth - col1Width - 20);
    const cellHeight = Math.max(22, valLines.length * 14 + 8);

    // Background for alternate rows (very light)
    if (i % 2 === 0) {
      doc.setFillColor(COLORS.primaryLight);
      doc.rect(margin.left, cursorY, contentWidth, cellHeight, "F");
    }

    doc.setFont("times", "bold");
    doc.setTextColor(COLORS.primary);
    doc.text(p.label, margin.left + 8, cursorY + 15);

    doc.setFont("times", "normal");
    doc.setTextColor(COLORS.black);
    doc.text(valLines, margin.left + col1Width + 10, cursorY + 15);

    cursorY += cellHeight;
    doc.line(margin.left, cursorY, pageWidth - margin.right, cursorY);
  });

  // Vertical borders for the table
  doc.setDrawColor(COLORS.primary);
  doc.line(margin.left, tableStartY, margin.left, cursorY);
  doc.line(margin.left + col1Width, tableStartY, margin.left + col1Width, cursorY);
  doc.line(pageWidth - margin.right, tableStartY, pageWidth - margin.right, cursorY);

  cursorY += 20;

  // --- Certification Conclusion with color highlight based on result ---
  doc.setFillColor(COLORS.white);
  let certText = "";
  let resultColor = COLORS.black;

  if (data.verificationResult === "GENUINE") {
    certText = "Conclusion: This is to certify that, upon verification of the Birth Register maintained at this Gram Panchayat, the particulars furnished in the said Birth Certificate have been duly traced and verified with the official records maintained by this office and have been found to be GENUINE and AUTHENTIC.";
    resultColor = COLORS.success;
  } else if (data.verificationResult === "NOT_GENUINE") {
    certText = "Conclusion: This is to certify that, upon verification of the Birth Register maintained at this Gram Panchayat, the particulars furnished in the said Birth Certificate have been checked and have been found to be NOT GENUINE and AUTHENTIC.";
    resultColor = COLORS.error;
  } else {
    certText = "Conclusion: This is to certify that the particulars furnished in the said Birth Certificate could not be verified as the relevant Birth Register is NOT AVAILABLE in this office.";
    resultColor = COLORS.warning;
  }

  // Highlight conclusion box
  doc.setFillColor(COLORS.primaryLight);
  doc.rect(margin.left, cursorY - 5, contentWidth, 70, "F");

  doc.setFont("times", "bold");
  doc.setTextColor(resultColor);
  cursorY = addWrappedText(certText, margin.left, cursorY, 11, "bold", "left", 15, resultColor);
  cursorY += 12;
  doc.setTextColor(COLORS.black);

  const forwardText = "This verification report is being forwarded to your office for necessary official confirmation and record.";
  cursorY = addWrappedText(forwardText, margin.left, cursorY, 11, "italic");
  cursorY += 45;

  // --- Signature Block & QR Code ---
  try {
    const verifyUrl = `https://dhalparagp.in/verify-birth-report?id=${data.id}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 120 });

    // Draw QR code with colored border
    const qrY = cursorY - 10;
    doc.setDrawColor(COLORS.primary);
    doc.setLineWidth(1);
    doc.rect(margin.left, qrY, 84, 94);
    doc.addImage(qrDataUrl, "PNG", margin.left + 2, qrY + 2, 80, 80);
    doc.setFont("times", "bold");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.primary);
    doc.text("SCAN TO VERIFY", margin.left + 42, qrY + 88, { align: "center" });
    doc.setTextColor(COLORS.black);
  } catch (err) {
    console.error("Error generating QR code in PDF:", err);
  }

  const signatureCenterX = pageWidth - margin.right - 90;

  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary);
  doc.text("Yours faithfully,", signatureCenterX, cursorY, { align: "center" });
  cursorY += 50;

  doc.text("Sub-Register", signatureCenterX, cursorY, { align: "center" });
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.gray);
  doc.text("No. 3 Dhalpara Gram Panchayat", signatureCenterX, cursorY + 14, { align: "center" });

  doc.setTextColor(COLORS.black); // reset

  // Open the PDF in a new tab
  const blobUrl = doc.output("bloburl");
  if (typeof window !== "undefined") {
    window.open(blobUrl, "_blank");
  }
}