"use client"

import { Button } from "@/components/ui/button"
import { PrinterIcon, DownloadIcon } from "lucide-react"
import { useState } from "react"

export function PrintButton() {
  const [isGenerating, setIsGenerating] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleGeneratePDF = async () => {
    setIsGenerating(true)

    try {
      // Dynamically import the libraries to reduce bundle size
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([import("jspdf"), import("html2canvas")])

      // Find the printable area
      const printArea = document.querySelector(".print-area") as HTMLElement
      if (!printArea) {
        throw new Error("Print area not found")
      }

      // Configure html2canvas options for better quality
      const canvas = await html2canvas(printArea, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: printArea.scrollWidth,
        height: printArea.scrollHeight,
      })

      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Calculate dimensions to fit A4
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      // Add the image to PDF
      const imgData = canvas.toDataURL("image/png")
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add new pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0]
      const filename = `work-order-${currentDate}.pdf`

      // Save the PDF
      pdf.save(filename)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2 bg-transparent">
        <PrinterIcon className="h-4 w-4" />
        Print Document
      </Button>
      <Button onClick={handleGeneratePDF} disabled={isGenerating} className="flex items-center gap-2">
        <DownloadIcon className="h-4 w-4" />
        {isGenerating ? "Generating PDF..." : "Download PDF"}
      </Button>
    </div>
  )
}
