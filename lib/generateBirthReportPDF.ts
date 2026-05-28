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
  verificationResult: "GENUINE" | "NOT_GENUINE" | "NOT_AVAILABLE";
  remarks?: string | null;
  status: string;
  createdAt: Date | string;
  createdByUser?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

const COLORS = {
  primary: "#1a4d8c",
  primaryLight: "#e8f0fa",
  accent: "#c49a6c",
  success: "#2e7d32",
  error: "#c62828",
  warning: "#f57c00",
  gray: "#666666",
  border: "#cccccc",
  white: "#ffffff",
  black: "#000000",
};

export async function generateBirthReportPDF(
  data: BirthVerificationReportData
) {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = {
    left: 54,
    right: 54,
    top: 54,
    bottom: 54,
  };

  const contentWidth =
    pageWidth - margin.left - margin.right;

  let cursorY = margin.top;

  // =========================================
  // HELPERS
  // =========================================

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-GB");
  };

  const checkPageBreak = (
    requiredHeight: number = 80
  ) => {
    if (
      cursorY + requiredHeight >
      pageHeight - margin.bottom
    ) {
      addFooter();

      doc.addPage();

      cursorY = margin.top;

      drawPageBorder();
      drawWatermark();
    }
  };

  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    fontSize = 11,
    fontStyle:
      | "normal"
      | "bold"
      | "italic"
      | "bolditalic" = "normal",
    align: "left" | "center" | "right" = "left",
    maxWidth = contentWidth,
    color = COLORS.black
  ) => {
    doc.setFont("times", fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color);

    const lines = doc.splitTextToSize(
      text,
      maxWidth
    );

    doc.text(lines, x, y, {
      align,
      lineHeightFactor: 1.5,
    });

    return y + lines.length * 16;
  };

  const drawPageBorder = () => {
    doc.setDrawColor(COLORS.primary);

    doc.setLineWidth(1.5);

    doc.rect(
      margin.left - 20,
      margin.top - 20,
      contentWidth + 40,
      pageHeight -
        margin.top -
        margin.bottom +
        40
    );

    doc.setLineWidth(0.5);

    doc.setDrawColor(COLORS.border);

    doc.rect(
      margin.left - 17,
      margin.top - 17,
      contentWidth + 34,
      pageHeight -
        margin.top -
        margin.bottom +
        34
    );
  };

  const drawWatermark = () => {
    doc.setTextColor(240);

    doc.setFontSize(60);

    doc.setFont("times", "bold");

    doc.text(
      "DHALPARA GP",
      pageWidth / 2,
      pageHeight / 2,
      {
        align: "center",
        angle: 45,
      }
    );

    doc.setTextColor(COLORS.black);
  };

  const drawHeader = () => {
    doc.setFillColor(COLORS.primaryLight);

    doc.rect(
      margin.left,
      cursorY - 5,
      contentWidth,
      70,
      "F"
    );

    doc.setFont("times", "bolditalic");

    doc.setFontSize(14);

    doc.setTextColor(COLORS.primary);

    doc.text(
      "Office of The Pradhan",
      pageWidth / 2,
      cursorY,
      {
        align: "center",
      }
    );

    cursorY += 24;

    doc.setFont("times", "bold");

    doc.setFontSize(24);

    doc.text(
      "No. 3 Dhalpara Gram Panchayat",
      pageWidth / 2,
      cursorY,
      {
        align: "center",
      }
    );

    cursorY += 18;

    doc.setFont("times", "normal");

    doc.setFontSize(11);

    doc.setTextColor(COLORS.gray);

    doc.text(
      "Trimohini, Hili, Dakshin Dinajpur, West Bengal",
      pageWidth / 2,
      cursorY,
      {
        align: "center",
      }
    );

    cursorY += 18;

    doc.setDrawColor(COLORS.primary);

    doc.setLineWidth(1.5);

    doc.line(
      margin.left,
      cursorY,
      pageWidth - margin.right,
      cursorY
    );

    cursorY += 3;

    doc.setLineWidth(0.5);

    doc.setDrawColor(COLORS.border);

    doc.line(
      margin.left,
      cursorY,
      pageWidth - margin.right,
      cursorY
    );

    cursorY += 22;

    doc.setTextColor(COLORS.black);
  };

  const drawFooter = () => {
    const footerY = pageHeight - 25;

    doc.setDrawColor(COLORS.border);

    doc.line(
      margin.left,
      footerY - 10,
      pageWidth - margin.right,
      footerY - 10
    );

    doc.setFont("times", "normal");

    doc.setFontSize(8);

    doc.setTextColor(COLORS.gray);

    doc.text(
      "Generated from No. 3 Dhalpara Gram Panchayat Official System",
      pageWidth / 2,
      footerY,
      {
        align: "center",
      }
    );

    doc.text(
      `Page ${doc.getCurrentPageInfo().pageNumber}`,
      pageWidth - margin.right,
      footerY,
      {
        align: "right",
      }
    );

    doc.setTextColor(COLORS.black);
  };

  const drawResultBadge = () => {
    let resultColor = COLORS.warning;

    if (data.verificationResult === "GENUINE") {
      resultColor = COLORS.success;
    }

    if (
      data.verificationResult === "NOT_GENUINE"
    ) {
      resultColor = COLORS.error;
    }

    doc.setFillColor(resultColor);

    doc.roundedRect(
      margin.left,
      cursorY,
      150,
      28,
      4,
      4,
      "F"
    );

    doc.setFont("times", "bold");

    doc.setFontSize(11);

    doc.setTextColor(COLORS.white);

    doc.text(
      data.verificationResult.replaceAll(
        "_",
        " "
      ),
      margin.left + 75,
      cursorY + 18,
      {
        align: "center",
      }
    );

    cursorY += 45;

    doc.setTextColor(COLORS.black);
  };

  // =========================================
  // INITIAL DESIGN
  // =========================================

  drawPageBorder();

  drawWatermark();

  drawHeader();

  // =========================================
  // TITLE
  // =========================================

  doc.setFont("times", "bold");

  doc.setFontSize(15);

  doc.setTextColor(COLORS.primary);

  doc.text(
    "BIRTH CERTIFICATE VERIFICATION REPORT",
    pageWidth / 2,
    cursorY,
    {
      align: "center",
    }
  );

  const titleWidth = doc.getTextWidth(
    "BIRTH CERTIFICATE VERIFICATION REPORT"
  );

  doc.setDrawColor(COLORS.accent);

  doc.line(
    (pageWidth - titleWidth) / 2,
    cursorY + 3,
    (pageWidth + titleWidth) / 2,
    cursorY + 3
  );

  cursorY += 30;

  // =========================================
  // REFERENCE BOX
  // =========================================

  doc.setFillColor(COLORS.primaryLight);

  doc.setDrawColor(COLORS.primary);

  doc.roundedRect(
    margin.left,
    cursorY,
    contentWidth,
    34,
    4,
    4,
    "FD"
  );

  doc.setFont("times", "bold");

  doc.setFontSize(11);

  doc.setTextColor(COLORS.primary);

  doc.text(
    `Ref No.: ${data.gpMemoNo}`,
    margin.left + 10,
    cursorY + 22
  );

  doc.text(
    `Date: ${formatDate(data.gpMemoDate)}`,
    pageWidth - margin.right - 10,
    cursorY + 22,
    {
      align: "right",
    }
  );

  cursorY += 50;

  doc.setTextColor(COLORS.black);

  // =========================================
  // TO
  // =========================================

  doc.setFont("times", "normal");

  doc.text("To", margin.left, cursorY);

  cursorY += 18;

  doc.setFont("times", "bold");

  doc.setTextColor(COLORS.primary);

  doc.text(
    data.toAuthority,
    margin.left,
    cursorY
  );

  cursorY += 15;

  doc.text(data.toZone, margin.left, cursorY);

  cursorY += 28;

  doc.setTextColor(COLORS.black);

  // =========================================
  // SUBJECT
  // =========================================

  doc.setFont("times", "bold");

  doc.setTextColor(COLORS.primary);

  doc.text("Subject:", margin.left, cursorY);

  doc.setTextColor(COLORS.black);

  doc.setFont("times", "normal");

  const subjectLines = doc.splitTextToSize(
    data.subject,
    contentWidth - 60
  );

  doc.text(
    subjectLines,
    margin.left + 55,
    cursorY
  );

  cursorY += subjectLines.length * 16 + 15;

  // =========================================
  // BODY
  // =========================================

  doc.setFont("times", "bold");

  doc.text(
    "Sir / Madam,",
    margin.left,
    cursorY
  );

  cursorY += 20;

  const bodyText = `
With reference to your Memo No. ${
    data.memoNo
  } dated ${formatDate(
    data.memoDate
  )}, regarding the subject cited above, I, the undersigned, Pradhan of No. 3 Dhalpara Gram Panchayat, hereby submit the verification report regarding the birth certificate furnished by the applicant.
`;

  cursorY = addWrappedText(
    bodyText,
    margin.left,
    cursorY
  );

  cursorY += 15;

  doc.setFont("times", "bold");

  doc.setTextColor(COLORS.primary);

  doc.text(
    "Particulars of the Certificate",
    margin.left,
    cursorY
  );

  cursorY += 18;

  doc.setTextColor(COLORS.black);

  // =========================================
  // PARTICULARS TABLE
  // =========================================

  const particulars = [
    [
      "Name of Certificate Holder",
      data.certificateHolder,
    ],
    ["Mother's Name", data.motherName],
    ["Father's Name", data.fatherName],
    ["Address", data.address],
    [
      "Date of Birth",
      formatDate(data.dateOfBirth),
    ],
    [
      "Registration No.",
      data.registrationNo,
    ],
    [
      "Date of Registration",
      formatDate(data.dateOfRegistration),
    ],
    [
      "Place of Registration",
      data.placeOfRegistration,
    ],
  ];

  const col1Width = 190;

  const tableStartY = cursorY;

  doc.setDrawColor(COLORS.primary);

  doc.line(
    margin.left,
    cursorY,
    pageWidth - margin.right,
    cursorY
  );

  particulars.forEach((item, index) => {
    checkPageBreak(50);

    const label = item[0];
    const value = item[1] || "N/A";

    const valueLines = doc.splitTextToSize(
      value,
      contentWidth - col1Width - 20
    );

    const rowHeight = Math.max(
      28,
      valueLines.length * 14 + 10
    );

    if (index % 2 === 0) {
      doc.setFillColor(COLORS.primaryLight);

      doc.rect(
        margin.left,
        cursorY,
        contentWidth,
        rowHeight,
        "F"
      );
    }

    doc.setFont("times", "bold");

    doc.setTextColor(COLORS.primary);

    doc.text(
      label,
      margin.left + 8,
      cursorY + 18
    );

    doc.setFont("times", "normal");

    doc.setTextColor(COLORS.black);

    doc.text(
      valueLines,
      margin.left + col1Width + 10,
      cursorY + 18
    );

    cursorY += rowHeight;

    doc.line(
      margin.left,
      cursorY,
      pageWidth - margin.right,
      cursorY
    );
  });

  doc.line(
    margin.left,
    tableStartY,
    margin.left,
    cursorY
  );

  doc.line(
    margin.left + col1Width,
    tableStartY,
    margin.left + col1Width,
    cursorY
  );

  doc.line(
    pageWidth - margin.right,
    tableStartY,
    pageWidth - margin.right,
    cursorY
  );

  cursorY += 25;

  // =========================================
  // RESULT BADGE
  // =========================================

  drawResultBadge();

  // =========================================
  // CONCLUSION
  // =========================================

  checkPageBreak(160);

  let conclusion = "";
  let resultColor = COLORS.warning;

  if (data.verificationResult === "GENUINE") {
    resultColor = COLORS.success;

    conclusion = `
This is to certify that, upon verification of the Birth Register maintained at this Gram Panchayat, the particulars furnished in the said Birth Certificate have been duly traced and verified with the official records maintained by this office and have been found to be GENUINE and AUTHENTIC.
`;
  } else if (
    data.verificationResult === "NOT_GENUINE"
  ) {
    resultColor = COLORS.error;

    conclusion = `
This is to certify that, upon verification of the Birth Register maintained at this Gram Panchayat, the particulars furnished in the said Birth Certificate have been checked and found to be NOT GENUINE.
`;
  } else {
    resultColor = COLORS.warning;

    conclusion = `
This is to certify that the particulars furnished in the said Birth Certificate could not be verified as the relevant Birth Register is NOT AVAILABLE in this office.
`;
  }

  const conclusionLines =
    doc.splitTextToSize(
      conclusion,
      contentWidth - 20
    );

  const conclusionHeight =
    conclusionLines.length * 16 + 20;

  doc.setFillColor(COLORS.primaryLight);

  doc.roundedRect(
    margin.left,
    cursorY - 5,
    contentWidth,
    conclusionHeight,
    4,
    4,
    "F"
  );

  cursorY = addWrappedText(
    conclusion,
    margin.left + 10,
    cursorY + 10,
    11,
    "bold",
    "left",
    contentWidth - 20,
    resultColor
  );

  cursorY += 18;

  // =========================================
  // REMARKS
  // =========================================

  if (data.remarks) {
    checkPageBreak(80);

    doc.setFont("times", "bold");

    doc.setTextColor(COLORS.primary);

    doc.text(
      "Remarks:",
      margin.left,
      cursorY
    );

    cursorY += 18;

    cursorY = addWrappedText(
      data.remarks,
      margin.left,
      cursorY,
      11,
      "italic"
    );

    cursorY += 18;
  }

  // =========================================
  // FORWARD TEXT
  // =========================================

  const forwardText = `
This verification report is being forwarded to your office for necessary official confirmation and record.
`;

  cursorY = addWrappedText(
    forwardText,
    margin.left,
    cursorY,
    11,
    "italic"
  );

  cursorY += 40;

  // =========================================
  // QR CODE
  // =========================================

  checkPageBreak(140);

  try {
    const verifyUrl = `https://dhalparagp.in/verify-birth-report?id=${data.id}&ref=${data.registrationNo}`;

    const qrDataUrl =
      await QRCode.toDataURL(verifyUrl, {
        width: 140,
        margin: 1,
      });

    doc.setDrawColor(COLORS.primary);

    doc.roundedRect(
      margin.left,
      cursorY,
      90,
      100,
      4,
      4
    );

    doc.addImage(
      qrDataUrl,
      "PNG",
      margin.left + 5,
      cursorY + 5,
      80,
      80
    );

    doc.setFont("times", "bold");

    doc.setFontSize(8);

    doc.setTextColor(COLORS.primary);

    doc.text(
      "SCAN TO VERIFY",
      margin.left + 45,
      cursorY + 92,
      {
        align: "center",
      }
    );

    doc.setTextColor(COLORS.black);
  } catch (err) {
    console.error(err);
  }

  // =========================================
  // SIGNATURE
  // =========================================

  const signatureX =
    pageWidth - margin.right - 100;

  // Seal
  doc.setDrawColor(COLORS.border);

  doc.circle(signatureX - 120, cursorY + 20, 30);

  doc.setFont("times", "bold");

  doc.setFontSize(8);

  doc.setTextColor(COLORS.gray);

  doc.text(
    "OFFICIAL\nSEAL",
    signatureX - 120,
    cursorY + 16,
    {
      align: "center",
    }
  );

  doc.setTextColor(COLORS.black);

  doc.setFont("times", "bold");

  doc.setFontSize(11);

  doc.setTextColor(COLORS.primary);

  doc.text(
    "Yours faithfully,",
    signatureX,
    cursorY + 15,
    {
      align: "center",
    }
  );

  doc.text(
    "Pradhan",
    signatureX,
    cursorY + 70,
    {
      align: "center",
    }
  );

  doc.setFont("times", "normal");

  doc.setFontSize(10);

  doc.setTextColor(COLORS.gray);

  doc.text(
    "No. 3 Dhalpara Gram Panchayat",
    signatureX,
    cursorY + 85,
    {
      align: "center",
    }
  );

  // =========================================
  // FOOTER
  // =========================================

  drawFooter();

  // =========================================
  // SAVE PDF
  // =========================================

  doc.save(
    `birth-verification-${data.registrationNo}.pdf`
  );
}
