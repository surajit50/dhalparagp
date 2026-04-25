
import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ bidderId: string }> }) {
  try {
    const { bidderId } = await params

    const bidder = await db.bidagency.findUnique({
      where: { id: bidderId },
      include: {
        technicalEvelution: {
          include: {
            credencial: true,
            validityofdocument: true,
          },
        },
        agencydetails: true,
      },
    })

    if (!bidder || !bidder.technicalEvelution) {
      return NextResponse.json({ error: "Technical details not found" }, { status: 404 })
    }

    // Get the technical evaluation document
    const technicalDoc = bidder.technicalEvelution

    const technicalDetails = {
      id: technicalDoc.id,
      remarks: technicalDoc.remarks,
      qualify: technicalDoc.qualify,
      // Document checks
      byelow: technicalDoc.byelow,
      pfregistrationupdatechalan: technicalDoc.pfregistrationupdatechalan,
      declaration: technicalDoc.declaration,
      machinary: technicalDoc.machinary,
      // Credential checks
      credencial: {
        sixtyperamtput: technicalDoc.credencial.sixtyperamtput,
        workorder: technicalDoc.credencial.workorder,
        paymentcertificate: technicalDoc.credencial.paymentcertificate,
        comcertificat: technicalDoc.credencial.comcertificat,
      },
      // Validity checks
      validityofdocument: {
        itreturn: technicalDoc.validityofdocument.itreturn,
        gst: technicalDoc.validityofdocument.gst,
        tradelicence: technicalDoc.validityofdocument.tradelicence,
        ptax: technicalDoc.validityofdocument.ptax,
      },
    }

    return NextResponse.json(technicalDetails)
  } catch (error) {
    console.error("Error fetching technical details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ bidderId: string }> }) {
  try {
    const { bidderId } = await params
    const data = await request.json()

    // Find the bidder and their technical evaluation document
    const bidder = await db.bidagency.findUnique({
      where: { id: bidderId },
      include: {
        technicalEvelution: true,
      },
    })

    if (!bidder || !bidder.technicalEvelution) {
      return NextResponse.json({ error: "Technical details not found" }, { status: 404 })
    }

    const technicalDoc = bidder.technicalEvelution

    // Update credential data
    await db.credencial.update({
      where: { id: technicalDoc.credencialId },
      data: {
        sixtyperamtput: data.credencial.sixtyperamtput,
        workorder: data.credencial.workorder,
        paymentcertificate: data.credencial.paymentcertificate,
        comcertificat: data.credencial.comcertificat,
      },
    })

    // Update validity document data
    await db.validityofdocument.update({
      where: { id: technicalDoc.validityofdocumentId },
      data: {
        itreturn: data.validityofdocument.itreturn,
        gst: data.validityofdocument.gst,
        tradelicence: data.validityofdocument.tradelicence,
        ptax: data.validityofdocument.ptax,
      },
    })

    // Update technical evaluation document
    const updatedTechnicalDoc = await db.technicalEvelutiondocument.update({
      where: { id: technicalDoc.id },
      data: {
        qualify: data.qualify,
        remarks: data.remarks,
        byelow: data.byelow,
        pfregistrationupdatechalan: data.pfregistrationupdatechalan,
        declaration: data.declaration,
        machinary: data.machinary,
      },
    })

    return NextResponse.json({
      message: "Technical details updated successfully",
      data: updatedTechnicalDoc,
    })
  } catch (error) {
    console.error("Error updating technical details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
