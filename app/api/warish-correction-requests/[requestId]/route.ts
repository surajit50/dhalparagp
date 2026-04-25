import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await params
    const body = await req.json()
    const { approve, reviewedBy, reviewComments } = body

    if (typeof approve !== "boolean" || !reviewedBy) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: approve (boolean) and reviewedBy",
        },
        { status: 400 },
      )
    }

    const request = await db.warishModificationRequest.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      return NextResponse.json(
        {
          success: false,
          message: "Request not found",
        },
        { status: 404 },
      )
    }

    if (request.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message: "Request has already been reviewed",
        },
        { status: 400 },
      )
    }

    // If approved, apply the changes
    if (approve) {
      try {
        const updateData: any = {}
        
        // Handle multiple modifications
        if (request.modifications && Array.isArray(request.modifications)) {
          request.modifications.forEach((mod: any) => {
            updateData[mod.field] = mod.newValue
          })
        } 
        // Fallback for old single-field requests
        else if (request.fieldToModify && request.proposedValue) {
          updateData[request.fieldToModify] = request.proposedValue
        }

        if (Object.keys(updateData).length === 0) {
          return NextResponse.json(
            {
              success: false,
              message: "No modifications found to apply",
            },
            { status: 400 },
          )
        }

        if (request.targetType === "detail" && request.warishDetailId) {
          await db.warishDetail.update({
            where: { id: request.warishDetailId },
            data: updateData,
          })
        } else if (request.targetType === "application" && request.warishApplicationId) {
          const warishdata = await db.warishApplication.update({
            where: { id: request.warishApplicationId },
            data: updateData,
          })

          // When application is modified, existing documents (certificates) might be invalid
          await db.warishDocument.deleteMany({
            where: {
              warishId: warishdata.id
            }
          })
        } else {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid correction request target",
            },
            { status: 400 },
          )
        }
      } catch (updateError: any) {
        console.error("Error applying correction:", updateError)
        return NextResponse.json(
          {
            success: false,
            message: `Failed to apply correction: ${updateError.message}`,
          },
          { status: 500 },
        )
      }
    }

    // Update the request status
    const updatedRequest = await db.warishModificationRequest.update({
      where: { id: requestId },
      data: {
        status: approve ? "approved" : "rejected",
        reviewedBy,
        reviewedDate: new Date(),
        reviewComments: reviewComments || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: approve ? "Correction approved and applied" : "Correction rejected",
      data: updatedRequest,
    })
  } catch (error: any) {
    console.error("Error reviewing correction request:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to review correction request",
      },
      { status: 500 },
    )
  }
}
