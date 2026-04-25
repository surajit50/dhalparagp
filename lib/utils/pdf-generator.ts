import jsPDF from "jspdf"
import "jspdf-autotable"
import { formatCurrency, formatDate } from "@/lib/utils/date"

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface QuotationData {
  nitNo: string
  workName: string
  estimatedAmount: number
  nitDate: Date
  submissionDate: Date
  openingDate: Date
  publishedAt: Date | null
}

interface BidData {
  rank: number
  bidderName: string
  bidderType: string
  bidAmount: number
  differenceFromEstimate: number
  percentageDifference: number
}

interface ComparativeStatementPDFData {
  quotation: QuotationData
  bids: BidData[]
  statistics: {
    totalBids: number
    lowestBid: number
    highestBid: number
    averageBid: number
  }
  createdAt: string
  remarks?: string
}

export function generateComparativeStatementPDF(data: ComparativeStatementPDFData): jsPDF {
  const doc = new jsPDF()

  // Set up fonts and colors
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.setTextColor(40, 40, 40)

  // Header
  doc.text("COMPARATIVE STATEMENT", 105, 20, { align: "center" })

  // Quotation details
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")

  const startY = 35
  let currentY = startY

  // Quotation info box (without Work Name)
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(248, 249, 250)
  doc.rect(15, currentY, 180, 38, "FD") // Reduced height

  doc.setFont("helvetica", "bold")
  doc.text("Quotation Details:", 20, currentY + 8)

  doc.setFont("helvetica", "normal")
  doc.text(`NIT/NIQ No: ${data.quotation.nitNo}`, 20, currentY + 16)
  doc.text(`Estimated Amount: ${formatCurrency(data.quotation.estimatedAmount)}`, 20, currentY + 24)
  doc.text(
    `Published Date: ${data.quotation.nitDate ? formatDate(data.quotation.nitDate) : "N/A"}`,
    110,
    currentY + 16,
  )
  doc.text(`Submission Date: ${formatDate(data.quotation.submissionDate)}`, 110, currentY + 24)
  doc.text(`Opening Date: ${formatDate(data.quotation.openingDate)}`, 110, currentY + 32)
  doc.text(`Total Bids Received: ${data.statistics.totalBids}`, 20, currentY + 32)

  currentY += 45 // Move below the box

  // Work Name section
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("Work Name:", 20, currentY + 8)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  const workNameLines = doc.splitTextToSize(data.quotation.workName, 170)
  doc.text(workNameLines, 20, currentY + 16)

  currentY += 16 + workNameLines.length * 6 // Move Y below work name

  // Bids table
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("Bid Analysis:", 20, currentY)

  currentY += 10

  const tableData = data.bids.map((bid) => [
    bid.rank.toString(),
    bid.bidderName,
    formatCurrency(bid.bidAmount),
    bid.differenceFromEstimate >= 0
      ? `+${formatCurrency(bid.differenceFromEstimate)}`
      : `-${formatCurrency(Math.abs(bid.differenceFromEstimate))}`,
    `${bid.percentageDifference >= 0 ? "+" : ""}${bid.percentageDifference.toFixed(2)}%`,
  ])

  doc.autoTable({
    startY: currentY,
    head: [["Rank", "Bidder Name", "Bid Amount", "Difference", "Percentage"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 20 },
      1: { cellWidth: 70 }, // Increased width for Bidder Name
      2: { halign: "right", cellWidth: 35 },
      3: { halign: "right", cellWidth: 30 },
      4: { halign: "right", cellWidth: 25 },
    },
  })

  // Statistics section
  const finalY = (doc as any).lastAutoTable.finalY + 15

  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(248, 249, 250)
  doc.rect(15, finalY, 180, 35, "FD")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("Statistics:", 20, finalY + 8)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(`Lowest Bid: ${formatCurrency(data.statistics.lowestBid)}`, 20, finalY + 16)
  doc.text(`Highest Bid: ${formatCurrency(data.statistics.highestBid)}`, 20, finalY + 24)
  doc.text(`Average Bid: ${formatCurrency(data.statistics.averageBid)}`, 110, finalY + 16)
  doc.text(`Total Bids: ${data.statistics.totalBids}`, 110, finalY + 24)

  // Savings/Loss analysis
  const lowestBid = data.statistics.lowestBid
  const estimatedAmount = data.quotation.estimatedAmount
  const savings = estimatedAmount - lowestBid
  const savingsPercentage = (savings / estimatedAmount) * 100

  doc.text(
    `Estimated vs Lowest: ${savings >= 0 ? "Savings" : "Excess"} of ${formatCurrency(Math.abs(savings))} (${savingsPercentage >= 0 ? "+" : ""}${savingsPercentage.toFixed(2)}%)`,
    20,
    finalY + 32,
  )

  // Remarks if any
  if (data.remarks) {
    const remarksY = finalY + 45
    doc.setFont("helvetica", "bold")
    doc.text("Remarks:", 20, remarksY)
    doc.setFont("helvetica", "normal")
    const splitRemarks = doc.splitTextToSize(data.remarks, 170)
    doc.text(splitRemarks, 20, remarksY + 8)
  }

  // Footer
  const footerPageHeight = doc.internal.pageSize.height
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, footerPageHeight - 20)
  doc.text(`Page 1 of 1`, 105, footerPageHeight - 20, { align: "center" })
  doc.text("Gram Panchayat Management System", 190, footerPageHeight - 20, { align: "right" })

  return doc
}
