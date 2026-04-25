import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// Valid application fields
const VALID_APPLICATION_FIELDS = [
  "applicantName",
  "applicantMobileNumber", 
  "relationwithdeceased",
  "nameOfDeceased",
  "fatherName",
  "spouseName",
  "villageName",
  "postOffice",
  "gender",
  "maritialStatus",
  "dateOfDeath",
  "reportingDate"
]

// Valid detail fields
const VALID_DETAIL_FIELDS = [
  "name",
  "gender",
  "relation", 
  "livingStatus",
  "maritialStatus",
  "hasbandName"
]

export async function GET(req: NextRequest) {
  try {
    const warishApplicationId = req.nextUrl.searchParams.get("warishApplicationId")

    if (!warishApplicationId) {
      return NextResponse.json(
        {
          success: false,
          message: "warishApplicationId is required",
        },
        { status: 400 },
      )
    }

    const requests = await db.warishModificationRequest.findMany({
      where: {
        OR: [
          { warishApplicationId },
          {
            warishDetailId: {
              in: await db.warishDetail
                .findMany({
                  where: { warishApplicationId },
                  select: { id: true },
                })
                .then((details) => details.map((d) => d.id)),
            },
          },
        ],
      },
      orderBy: { requestedDate: "desc" },
      include: {
        warishApplication: {
          select: {
            id: true,
            acknowlegment: true,
            applicantName: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      requests,
    })
  } catch (error: any) {
    console.error("Error fetching correction requests:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch correction requests",
      },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      warishApplicationId,
      warishDetailId,
      modifications, // Array of { field, oldValue, newValue }
      reasonForModification,
      requestedBy,
    } = body

    // Support both single modification (old) and multiple (new)
    const finalModifications = modifications || [
      {
        field: body.fieldToModify,
        oldValue: body.currentValue || "",
        newValue: body.proposedValue,
      },
    ]

    // Validation
    if (!finalModifications || !Array.isArray(finalModifications) || finalModifications.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Modifications are required",
        },
        { status: 400 },
      )
    }

    if (!reasonForModification || !requestedBy) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: reasonForModification, requestedBy",
        },
        { status: 400 },
      )
    }

    if (!warishApplicationId && !warishDetailId) {
      return NextResponse.json(
        {
          success: false,
          message: "Either warishApplicationId or warishDetailId must be provided",
        },
        { status: 400 },
      )
    }

    // Determine target type and validate fields
    const targetType = warishDetailId ? "detail" : "application"
    const validFields = targetType === "application" ? VALID_APPLICATION_FIELDS : VALID_DETAIL_FIELDS
    
    for (const mod of finalModifications) {
      if (!mod.field || mod.newValue === undefined) {
        return NextResponse.json(
          {
            success: false,
            message: "Each modification must have a 'field' and 'newValue'",
          },
          { status: 400 },
        )
      }
      if (!validFields.includes(mod.field)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid field '${mod.field}' for ${targetType} corrections.`,
          },
          { status: 400 },
        )
      }
    }

    // Validate that the target exists
    if (targetType === "detail" && warishDetailId) {
      const detail = await db.warishDetail.findUnique({
        where: { id: warishDetailId },
      })
      if (!detail) {
        return NextResponse.json(
          {
            success: false,
            message: "Warish detail not found",
          },
          { status: 404 },
        )
      }
    } else if (targetType === "application" && warishApplicationId) {
      const application = await db.warishApplication.findUnique({
        where: { id: warishApplicationId },
      })
      if (!application) {
        return NextResponse.json(
          {
            success: false,
            message: "Warish application not found",
          },
          { status: 404 },
        )
      }
    }

    // Check if a similar pending request already exists for any of the fields
    const fieldsToModify = finalModifications.map(m => m.field)
    const existingRequest = await db.warishModificationRequest.findFirst({
      where: {
        warishApplicationId: warishApplicationId || undefined,
        warishDetailId: warishDetailId || undefined,
        status: "pending",
        OR: [
          { fieldToModify: { in: fieldsToModify } },
          // Note: Checking JSON field is harder in Prisma with MongoDB, 
          // but we can at least check if there's any pending request for this target
        ]
      },
    })

    if (existingRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "A pending correction request for this application/member already exists. Please wait for it to be reviewed.",
        },
        { status: 409 },
      )
    }

    const request = await db.warishModificationRequest.create({
      data: {
        warishApplicationId: warishApplicationId || undefined,
        warishDetailId: warishDetailId || undefined,
        targetType,
        modifications: finalModifications,
        // Keep these for backward compatibility (using the first one)
        fieldToModify: finalModifications[0].field,
        currentValue: String(finalModifications[0].oldValue || ""),
        proposedValue: String(finalModifications[0].newValue),
        reasonForModification,
        requestedBy,
        status: "pending",
        requestedDate: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Correction request submitted successfully",
      data: request,
    })
  } catch (error: any) {
    console.error("Error creating correction request:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create correction request",
      },
      { status: 500 },
    )
  }
}
