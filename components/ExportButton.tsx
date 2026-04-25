"use client"

import { jsPDF } from "jspdf"
import autoTable, { type RowInput } from "jspdf-autotable"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useState } from "react"

interface ExportButtonProps {
  members: {
    id: string
    salutation: string
    firstName: string
    middleName: string | null
    lastName: string | null
    fatherGuardianName: string | null
    dob: Date
    gender: string
    maritalStatus: string
    villageDataId: string | null
    photo: string | null
  }[]
}

// Helper function to convert image to base64 with CORS handling
async function imageToBase64(url: string): Promise<string | null> {
  try {
    // Create a proxy URL to handle CORS issues with S3
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`

    const response = await fetch(proxyUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const blob = await response.blob()

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error("Error converting image to base64:", error)
    return null
  }
}

export const ExportButton = ({ members }: ExportButtonProps) => {
  const [loading, setLoading] = useState(false)

  const exportToPDF = async () => {
    setLoading(true)
    try {
      const doc = new jsPDF("landscape")
      const currentDate = new Date().toLocaleDateString()
      const pageWidth = doc.internal.pageSize.getWidth()

      // Title
      doc.setFontSize(18)
      doc.setTextColor(33, 37, 41)
      doc.text("Members List", pageWidth / 2, 15, { align: "center" })

      // Subtitle
      doc.setFontSize(10)
      doc.setTextColor(108, 117, 125)
      doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 22, {
        align: "center",
      })

      // Prepare table data and store images separately
      const body: RowInput[] = []
      const imageData: { [key: string]: string } = {}

      for (let index = 0; index < members.length; index++) {
        const member = members[index]
        let photoBase64: string | null = null

        // Convert photo to data URL if exists
        if (member.photo) {
          photoBase64 = await imageToBase64(member.photo)
          if (photoBase64) {
            imageData[`row_${index}`] = photoBase64
          }
        }

        body.push([
          index + 1,
          photoBase64 ? "" : `${member.firstName[0]}${member.lastName?.[0] || ""}`,
          `${member.salutation} ${member.firstName} ${member.middleName || ""} ${member.lastName || ""}`.trim(),
          member.fatherGuardianName || "N/A",
          member.gender,
          member.maritalStatus,
          member.dob.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          member.villageDataId || "N/A",
        ])
      }

      // Table settings
      autoTable(doc, {
        startY: 30,
        head: [["#", "Photo", "Name", "Guardian", "Gender", "Marital Status", "Date of Birth", "Village ID"]],
        body: body,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 11,
        },
        styles: {
          cellPadding: 3,
          fontSize: 9,
          minCellHeight: 25,
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 25, halign: "center", valign: "middle" },
          2: { cellWidth: 40 },
          3: { cellWidth: 40 },
          4: { cellWidth: 20 },
          5: { cellWidth: 25 },
          6: { cellWidth: 30 },
          7: { cellWidth: 30 },
        },
        margin: { top: 10 },
        didDrawCell: (data) => {
          // Draw images in the photo column after the table is drawn
          if (data.section === "body" && data.column.index === 1) {
            const rowIndex = data.row.index
            const imageKey = `row_${rowIndex}`

            if (imageData[imageKey]) {
              try {
                const imgWidth = 20
                const imgHeight = 20
                const x = data.cell.x + (data.cell.width - imgWidth) / 2
                const y = data.cell.y + (data.cell.height - imgHeight) / 2

                doc.addImage(imageData[imageKey], "JPEG", x, y, imgWidth, imgHeight)
              } catch (error) {
                console.error("Error adding image to PDF:", error)
                // Fallback to initials if image fails
                const member = members[rowIndex]
                const initials = `${member.firstName[0]}${member.lastName?.[0] || ""}`.toUpperCase()
                doc.setFontSize(10)
                doc.setTextColor(100, 100, 100)
                doc.text(initials, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, {
                  align: "center",
                  baseline: "middle",
                })
              }
            } else if (!data.cell.text || data.cell.text.length === 0) {
              // Draw initials if no image and no text
              const member = members[rowIndex]
              const initials = `${member.firstName[0]}${member.lastName?.[0] || ""}`.toUpperCase()
              doc.setFontSize(10)
              doc.setTextColor(100, 100, 100)
              doc.text(initials, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, {
                align: "center",
                baseline: "middle",
              })
            }
          }
        },
      })

      doc.save(`members-list-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (error) {
      console.error("PDF generation failed:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={exportToPDF} variant="outline" className="ml-2" disabled={loading}>
      <Download className="mr-2 h-4 w-4" />
      {loading ? "Generating..." : "Export PDF"}
    </Button>
  )
}
