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
  isGenuine: boolean;
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
  const margin = { left: 54, top: 54, right: 54, bottom: 54 }; // 0.75 in margins
  const contentWidth = pageWidth - margin.left - margin.right;
  let cursorY = margin.top;

  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    fontSize = 11,
    fontStyle = "normal",
    align: "left" | "center" | "right" = "left"
  ) => {
    doc.setFont("times", fontStyle);
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, contentWidth - (x - margin.left));
    doc.text(lines, x, y, { align });
    return y + lines.length * (fontSize + 4);
  };

  // --- GP Letterhead (Word document style) ---
  doc.setFont("times", "bolditalic");
  doc.setFontSize(12);
  doc.text("Office of The Pradhan", pageWidth / 2, cursorY, { align: "center" });
  cursorY += 22;

  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.text("No 3 Dhalpara Gram Panchayat", pageWidth / 2, cursorY, { align: "center" });
  cursorY += 18;

  // Tiny building icon or text
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.text("Trimohini, Hili, Dakshin Dinajpur", pageWidth / 2, cursorY, { align: "center" });
  cursorY += 8;

  // Double horizontal separator line
  doc.setLineWidth(1.5);
  doc.line(margin.left, cursorY, pageWidth - margin.right, cursorY);
  cursorY += 3;
  doc.setLineWidth(0.5);
  doc.line(margin.left, cursorY, pageWidth - margin.right, cursorY);
  cursorY += 25;

  // --- Reference Details (GP Outgoing) ---
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  const refText = `Ref No.: ${data.gpMemoNo}`;
  const dateFormatted = new Date(data.gpMemoDate).toLocaleDateString("en-GB");
  const dateText = `Date: ${dateFormatted}`;

  doc.text(refText, margin.left, cursorY);
  doc.text(dateText, pageWidth - margin.right - 100, cursorY);
  cursorY += 25;

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
  cursorY = addWrappedText(`Subject: ${data.subject}`, margin.left, cursorY, 11, "bold");
  cursorY += 12;

  // --- Salutation ---
  doc.setFont("times", "bold");
  doc.text("Sir,", margin.left, cursorY);
  cursorY += 20;

  // --- Body (referencing BDO / incoming letter details) ---
  const bodyText = `With reference to your Ref No.: ${data.memoNo} Date: ${new Date(data.memoDate).toLocaleDateString("en-GB")}, regarding the subject cited above, I, the undersigned, Pradhan of No. 3 Dhalpara Gram Panchayat, hereby submit the verification report regarding the birth certificate furnished by the applicant.`;
  cursorY = addWrappedText(bodyText, margin.left, cursorY, 11, "normal");
  cursorY += 10;

  doc.setFont("times", "normal");
  doc.text("The particulars of the certificate are as follows:", margin.left, cursorY);
  cursorY += 20;

  // --- Particulars List (Bullet Points) ---
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

  particulars.forEach(p => {
    // Bullet point character
    doc.setFont("times", "bold");
    doc.text("•", margin.left + 15, cursorY);
    
    // Label
    doc.text(`${p.label}:`, margin.left + 27, cursorY);
    const labelWidth = doc.getTextWidth(`${p.label}: `);
    
    // Value
    doc.setFont("times", "normal");
    const valText = p.value || "N/A";
    const maxValWidth = contentWidth - 27 - labelWidth;
    const valLines = doc.splitTextToSize(valText, maxValWidth);
    doc.text(valLines, margin.left + 27 + labelWidth, cursorY);
    
    cursorY += valLines.length * 15;
  });
  cursorY += 12;

  // --- Certification Conclusion ---
  const statusStr = data.isGenuine ? "genuine and authentic" : "not genuine / authentic";
  const certText = `This is to certify that, upon verification of the Birth Register maintained at this Gram Panchayat, the particulars furnished in the said Birth Certificate have been duly traced and verified with the official records maintained by this office and have been found to be ${statusStr}.`;
  cursorY = addWrappedText(certText, margin.left, cursorY, 11, "bold");
  cursorY += 12;

  const forwardText = "This verification report is being forwarded to your office for necessary official confirmation and record.";
  cursorY = addWrappedText(forwardText, margin.left, cursorY, 11, "normal");
  cursorY += 45;

  // --- Signature Block & QR Code ---
  const signatureX = pageWidth - margin.right - 180;
  
  // Generate and draw QR Code for validation check
  try {
    const verifyUrl = `https://dhalparagp.in/verify-birth-report?id=${data.id}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 120 });
    
    // Draw QR code on the left side, aligned with signature block
    const qrY = cursorY;
    doc.addImage(qrDataUrl, "PNG", margin.left, qrY, 80, 80);
    doc.setFont("times", "bolditalic");
    doc.setFontSize(8);
    doc.text("Scan to Verify Report", margin.left + 2, qrY + 90);
  } catch (err) {
    console.error("Error generating QR code in PDF:", err);
  }

  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.text("Yours faithfully,", signatureX, cursorY);
  cursorY += 50;

  doc.text("Pradhan", signatureX, cursorY);
  doc.setFont("times", "normal");
  doc.text("No. 3 Dhalpara Gram Panchayat", signatureX, cursorY + 14);

  // Open the PDF in a new tab
  const blobUrl = doc.output("bloburl");
  if (typeof window !== "undefined") {
    window.open(blobUrl, "_blank");
  }
}
