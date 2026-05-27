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

export async function generateBirthReportPDF(data: BirthVerificationReportData) {
  // Use A4 format in points (595.28 x 841.89 pt)
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = { left: 54, top: 54, right: 54, bottom: 54 };
  const contentWidth = pageWidth - margin.left - margin.right;
  let cursorY = margin.top;

  // --- Draw Decorative Page Border ---
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(1.5);
  doc.rect(margin.left - 20, margin.top - 20, contentWidth + 40, pageHeight - margin.top - margin.bottom + 40);
  doc.setLineWidth(0.5);
  doc.rect(margin.left - 17, margin.top - 17, contentWidth + 34, pageHeight - margin.top - margin.bottom + 34);

  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    fontSize = 11,
    fontStyle = "normal",
    align: "left" | "center" | "right" = "left",
    lineHeight = 15
  ) => {
    doc.setFont("times", fontStyle);
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, contentWidth - (x - margin.left));
    doc.text(lines, x, y, { align, lineHeightFactor: 1.5 });
    return y + lines.length * lineHeight;
  };

  // --- Header ---
  doc.setFont("times", "bolditalic");
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Office of The Pradhan", pageWidth / 2, cursorY, { align: "center" });
  cursorY += 24;

  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.text("No 3 Dhalpara Gram Panchayat", pageWidth / 2, cursorY, { align: "center" });
  cursorY += 18;

  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.text("Trimohini, Hili, Dakshin Dinajpur, West Bengal", pageWidth / 2, cursorY, { align: "center" });
  cursorY += 16;

  // Double horizontal separator line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1.5);
  doc.line(margin.left, cursorY, pageWidth - margin.right, cursorY);
  cursorY += 3;
  doc.setLineWidth(0.5);
  doc.line(margin.left, cursorY, pageWidth - margin.right, cursorY);
  cursorY += 20;

  // --- Report Title ---
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("VERIFICATION REPORT", pageWidth / 2, cursorY, { align: "center" });
  const titleWidth = doc.getTextWidth("VERIFICATION REPORT");
  doc.setLineWidth(1);
  doc.line((pageWidth - titleWidth) / 2, cursorY + 2, (pageWidth + titleWidth) / 2, cursorY + 2);
  cursorY += 25;

  // --- Reference Details (Grey Box) ---
  doc.setFillColor(245, 245, 245);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(margin.left, cursorY, contentWidth, 30, "FD");

  doc.setFont("times", "bold");
  doc.setFontSize(11);
  const refText = `Ref No.: ${data.gpMemoNo}`;
  const dateFormatted = new Date(data.gpMemoDate).toLocaleDateString("en-GB");
  const dateText = `Date: ${dateFormatted}`;

  doc.text(refText, margin.left + 10, cursorY + 20);
  doc.text(dateText, pageWidth - margin.right - 10, cursorY + 20, { align: "right" });
  cursorY += 45;

  // --- Addressee ---
  doc.setFont("times", "normal");
  doc.text("To", margin.left, cursorY);
  cursorY += 15;

  doc.setFont("times", "bold");
  doc.text(data.toAuthority, margin.left, cursorY);
  cursorY += 14;
  doc.text(data.toZone, margin.left, cursorY);
  cursorY += 25;

  // --- Subject ---
  doc.setFont("times", "bold");
  doc.text("Subject:", margin.left, cursorY);
  doc.setFont("times", "normal");
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
  doc.text("The particulars of the certificate are as follows:", margin.left, cursorY);
  cursorY += 15;

  // --- Particulars List (Grid Table) ---
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

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(margin.left, cursorY, pageWidth - margin.right, cursorY);

  particulars.forEach((p, i) => {
    const valText = p.value || "N/A";
    doc.setFont("times", "normal");
    const valLines = doc.splitTextToSize(valText, contentWidth - col1Width - 20);
    const cellHeight = Math.max(22, valLines.length * 14 + 8);

    // Background for alternate rows
    if (i % 2 === 0) {
      doc.setFillColor(252, 252, 252);
      doc.rect(margin.left, cursorY, contentWidth, cellHeight, "F");
    }

    doc.setFont("times", "bold");
    doc.text(p.label, margin.left + 8, cursorY + 15);

    doc.setFont("times", "normal");
    doc.text(valLines, margin.left + col1Width + 10, cursorY + 15);

    cursorY += cellHeight;
    doc.line(margin.left, cursorY, pageWidth - margin.right, cursorY);
  });

  // Vertical borders for the table
  doc.line(margin.left, tableStartY, margin.left, cursorY);
  doc.line(margin.left + col1Width, tableStartY, margin.left + col1Width, cursorY);
  doc.line(pageWidth - margin.right, tableStartY, pageWidth - margin.right, cursorY);

  cursorY += 20;

  // --- Certification Conclusion ---
  doc.setFillColor(255, 255, 255);
  let certText = "";
  if (data.verificationResult === "GENUINE") {
    certText = "Conclusion: This is to certify that, upon verification of the Birth Register maintained at this Gram Panchayat, the particulars furnished in the said Birth Certificate have been duly traced and verified with the official records maintained by this office and have been found to be GENUINE and AUTHENTIC.";
  } else if (data.verificationResult === "NOT_GENUINE") {
    certText = "Conclusion: This is to certify that, upon verification of the Birth Register maintained at this Gram Panchayat, the particulars furnished in the said Birth Certificate have been checked and have been found to be NOT GENUINE and AUTHENTIC.";
  } else {
    certText = "Conclusion: This is to certify that the particulars furnished in the said Birth Certificate could not be verified as the relevant Birth Register is NOT AVAILABLE in this office.";
  }

  // Highlight conclusion
  doc.setFont("times", "bold");
  cursorY = addWrappedText(certText, margin.left, cursorY, 11, "bold");
  cursorY += 12;

  const forwardText = "This verification report is being forwarded to your office for necessary official confirmation and record.";
  cursorY = addWrappedText(forwardText, margin.left, cursorY, 11, "italic");
  cursorY += 45;

  // --- Signature Block & QR Code ---
  // Generate and draw QR Code for validation check
  try {
    const verifyUrl = `https://dhalparagp.in/verify-birth-report?id=${data.id}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 120 });

    // Draw QR code on the left side, boxed
    const qrY = cursorY - 10;
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin.left, qrY, 84, 94); // subtle box around QR
    doc.addImage(qrDataUrl, "PNG", margin.left + 2, qrY + 2, 80, 80);
    doc.setFont("times", "bold");
    doc.setFontSize(8);
    doc.text("SCAN TO VERIFY", margin.left + 42, qrY + 88, { align: "center" });
  } catch (err) {
    console.error("Error generating QR code in PDF:", err);
  }

  const signatureCenterX = pageWidth - margin.right - 90;

  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.text("Yours faithfully,", signatureCenterX, cursorY, { align: "center" });
  cursorY += 50;

  doc.text("Pradhan", signatureCenterX, cursorY, { align: "center" });
  doc.setFont("times", "normal");
  doc.text("No. 3 Dhalpara Gram Panchayat", signatureCenterX, cursorY + 14, { align: "center" });



  // Open the PDF in a new tab
  const blobUrl = doc.output("bloburl");
  if (typeof window !== "undefined") {
    window.open(blobUrl, "_blank");
  }
}
