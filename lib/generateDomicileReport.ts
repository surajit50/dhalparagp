import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { DomicileEnquiryReport } from "@/lib/actions"

export function generateDomicileReport(data: DomicileEnquiryReport) {
  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = { left: 30, top: 30, right: 30, bottom: 30 }
  const contentWidth = pageWidth - margin.left - margin.right
  let cursorY = margin.top

  const addWrappedText = (text: string, x: number, y: number, options: any = {}) => {
    const lines = doc.splitTextToSize(text, contentWidth - (x - margin.left))
    doc.text(lines, x, y, options)
    return y + lines.length * 12 // Reduced line height from 16 to 12
  }

  // Add GP Letterhead
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  const headerText = "No 3 DHALPARA GRAM PANCHAYAT"
  cursorY = addWrappedText(headerText, pageWidth / 2, cursorY, { align: "center" })
  cursorY += 6 // Reduced spacing from 8 to 6

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  const blockText = "Block: Hill, District: Dakshin Dinajpur"
  cursorY = addWrappedText(blockText, pageWidth / 2, cursorY, { align: "center" })
  cursorY += 6 // Reduced spacing

  const contactText = "Phone: 03521-XXXXXX | Email: admin@dhalparagp.in"
  cursorY = addWrappedText(contactText, pageWidth / 2, cursorY, { align: "center" })
  cursorY += 15 // Reduced spacing from 30 to 15

  // Add Reference Details
  doc.setFont("helvetica", "bold")
  const refText = `Ref. No.: ${data.memoNo}`
  const dateText = `Date: ${new Date(data.memoDate).toLocaleDateString("en-IN")}`

  const refLines = doc.splitTextToSize(refText, contentWidth * 0.6)
  doc.text(refLines, margin.left, cursorY)

  const dateLines = doc.splitTextToSize(dateText, contentWidth * 0.4)
  doc.text(dateLines, pageWidth - margin.right - 120, cursorY)

  cursorY += Math.max(refLines.length, dateLines.length) * 12 + 12 // Reduced spacing
  doc.setFont("helvetica", "normal")

  // Addressee
  cursorY = addWrappedText("To", margin.left, cursorY)
  cursorY += 6 // Reduced spacing

  doc.setFont("helvetica", "bold")
  cursorY = addWrappedText("The Block Development Officer", margin.left, cursorY)
  cursorY = addWrappedText("Hill, Dakshin Dinajpur", margin.left, cursorY)
  cursorY += 12 // Reduced spacing from 20 to 12
  doc.setFont("helvetica", "normal")

  // Subject
  doc.setFont("helvetica", "bold")
  const subjectText = "Subject: Domicile Certificate Enquiry Report Submission"
  cursorY = addWrappedText(subjectText, margin.left, cursorY)
  cursorY += 10 // Reduced spacing from 12 to 10
  doc.setFont("helvetica", "normal")

  // Body Paragraph with better wrapping
  const bodyText =
    `As directed in your letter No. ${data.letterNumber || "N/A"} dated ` +
    `${data.letterDate ? new Date(data.letterDate).toLocaleDateString("en-IN") : "N/A"}, ` +
    `I have conducted an enquiry regarding the domicile status of ${data.applicantName}, ` +
    `S/o/D/o ${data.applicantFatherName}, resident of ${data.applicantAddress}, ` +
    `${data.applicantVillage}, PO ${data.applicantPostOffice}, PS Hill, Dakshin Dinajpur. ` +
    `The applicant's residential status and identity have been verified through local ` +
    `enquiry and examination of relevant records.`

  cursorY = addWrappedText(bodyText, margin.left, cursorY)
  cursorY += 12 // Reduced spacing from 20 to 12

  // Enquiry Findings
  doc.setFont("helvetica", "bold")
  cursorY = addWrappedText("Enquiry Findings:", margin.left, cursorY)
  cursorY += 8 // Reduced spacing from 12 to 8
  doc.setFont("helvetica", "normal")

  autoTable(doc, {
    startY: cursorY,
    head: [["Sl. No.", "Particulars", "Details"]],
    body: data.enquiryFindings.map((f) => [f.serialNumber, f.particulars, f.details]),
    styles: {
      fontSize: 8, // Reduced from 10 to 8
      cellPadding: 2, // Reduced from 4 to 2
      lineColor: [0, 0, 0],
      lineWidth: 0.25,
      overflow: "linebreak",
      cellWidth: "wrap",
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: 0,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 40 }, // Reduced from 50 to 40
      1: { cellWidth: 120 }, // Reduced from 150 to 120
      2: { cellWidth: "auto" },
    },
    theme: "grid",
    margin: { left: margin.left, right: margin.right },
  })

  cursorY = (doc as any).lastAutoTable.finalY + 12 // Reduced spacing from 20 to 12

  // Documents Verified
  doc.setFont("helvetica", "bold")
  cursorY = addWrappedText("Documents Verified:", margin.left, cursorY)
  cursorY += 8 // Reduced spacing from 12 to 8
  doc.setFont("helvetica", "normal")

  data.documentsVerified.forEach((docItem) => {
    const docText = `• ${docItem.documentName}${docItem.documentNumber ? " No. " + docItem.documentNumber : ""} issued by ${docItem.issuedAuthority}`
    cursorY = addWrappedText(docText, margin.left + 10, cursorY)
    cursorY += 6 // Reduced spacing from 8 to 6
  })
  cursorY += 8 // Reduced spacing from 10 to 8

  // Final Report with proper wrapping
  doc.setFont("helvetica", "bold")
  cursorY = addWrappedText("Final Report:", margin.left, cursorY)
  cursorY += 6 // Reduced spacing from 8 to 6
  doc.setFont("helvetica", "normal")

  const finalText =
    "Based on the above enquiry and document verification, it is confirmed that " +
    `the applicant ${data.isPermanentResident ? "is" : "is not"} a permanent ` +
    "resident of the above-mentioned address."

  cursorY = addWrappedText(finalText, margin.left, cursorY)
  cursorY += 20 // Reduced spacing from 30 to 20

  // Signature Section
  cursorY = addWrappedText("Yours faithfully,", pageWidth - margin.right - 100, cursorY)

  // Open in new tab
  const blobUrl = doc.output("bloburl")
  if (typeof window !== "undefined") {
    window.open(blobUrl, "_blank")
  }
}
