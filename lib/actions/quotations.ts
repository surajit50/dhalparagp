"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { quotationSchema, updateQuotationSchema, quotationFiltersSchema } from "@/lib/schemas/quotation"
import type { ApiResponse, QuotationFormData, QuotationFilters } from "@/lib/types"
import { QuotationType } from "@prisma/client"

/**
 * Enhanced Quotation Creation with proper validation and error handling
 */
export async function createQuotation(data: QuotationFormData, userId: string): Promise<ApiResponse> {
  try {
    // 1. Validate input data
    const validatedData = quotationSchema.parse(data)

    // 2. Check if user exists and is authorized
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return {
        success: false,
        error: "User not found or unauthorized",
      }
    }

    // 3. Check for duplicate NIT/NIQ number
    const existingQuotation = await db.quotation.findFirst({
      where: {
        nitNo: validatedData.nitNo,
      },
    })

    if (existingQuotation) {
      return {
        success: false,
        error: `Quotation with NIT/NIQ No. "${validatedData.nitNo}" already exists`,
      }
    }

    // 4. Validate dates
    const submissionDate = new Date(validatedData.submissionDate)
    const openingDate = new Date(validatedData.openingDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (submissionDate < today) {
      return {
        success: false,
        error: "Submission date cannot be in the past",
      }
    }

    if (openingDate <= submissionDate) {
      return {
        success: false,
        error: "Opening date must be after submission date",
      }
    }

    // 5. Validate times
    const submissionTimeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    const openingTimeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

    if (!submissionTimeRegex.test(validatedData.submissionTime)) {
      return {
        success: false,
        error: "Invalid submission time format",
      }
    }

    if (!openingTimeRegex.test(validatedData.openingTime)) {
      return {
        success: false,
        error: "Invalid opening time format",
      }
    }

    // 6. Validate amount
    const amount = Number.parseFloat(validatedData.estimatedAmount)
    if (isNaN(amount) || amount <= 0) {
      return {
        success: false,
        error: "Estimated amount must be a positive number",
      }
    }

    // 7. Create quotation in database
    const quotation = await db.quotation.create({
      data: {
        ...validatedData,
        quotationType: QuotationType[validatedData.quotationType as keyof typeof QuotationType],
        nitDate: new Date(validatedData.nitDate),
        submissionDate: submissionDate,
        openingDate: openingDate,
        submissionTime: validatedData.submissionTime,
        openingTime: validatedData.openingTime,
        estimatedAmount: amount,
        status: "DRAFT",
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // 8. Create audit log
    await db.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "Quotation",
        entityId: quotation.id,
        userId,
        description: `Created quotation ${quotation.nitNo}`,
      },
    })

    // 9. Revalidate cache
    revalidatePath("/admindashboard/manage-qatation")
    revalidatePath("/admindashboard/manage-qatation/publish")

    return {
      success: true,
      data: quotation,
      message: "Quotation created successfully",
    }
  } catch (error) {
    console.error("Error creating quotation:", error)
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return {
          success: false,
          error: "A quotation with this NIT/NIQ number already exists",
        }
      }
      return {
        success: false,
        error: error.message || "Failed to create quotation",
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred while creating the quotation",
    }
  }
}

/**
 * Enhanced Quotation Update with validation
 */
export async function updateQuotation(
  id: string,
  data: Partial<QuotationFormData>,
  userId: string,
): Promise<ApiResponse> {
  try {
    // 1. Validate input
    const validatedData = updateQuotationSchema.parse(data)

    // 2. Find existing quotation
    const existingQuotation = await db.quotation.findUnique({
      where: { id },
    })

    if (!existingQuotation) {
      return {
        success: false,
        error: "Quotation not found",
      }
    }

    // 3. Check if user is authorized to update
    if (existingQuotation.createdById !== userId) {
      return {
        success: false,
        error: "You are not authorized to update this quotation",
      }
    }

    // 4. Check if quotation is published
    if (existingQuotation.status === "PUBLISHED") {
      return {
        success: false,
        error: "Cannot update a published quotation. Create a new version instead.",
      }
    }

    // 5. Prepare update data
    const updateData: any = { ...validatedData }

    // 6. Convert enum types if needed
    if (validatedData.quotationType) {
      updateData.quotationType = QuotationType[validatedData.quotationType as keyof typeof QuotationType]
    }

    // 7. Convert dates if needed
    if (validatedData.nitDate) {
      updateData.nitDate = new Date(validatedData.nitDate)
    }
    if (validatedData.submissionDate) {
      updateData.submissionDate = new Date(validatedData.submissionDate)
    }
    if (validatedData.openingDate) {
      updateData.openingDate = new Date(validatedData.openingDate)
    }
    if (validatedData.estimatedAmount) {
      updateData.estimatedAmount = Number.parseFloat(validatedData.estimatedAmount)
    }

    // 8. Validate date relationships if both are present
    if (validatedData.submissionDate && validatedData.openingDate) {
      const subDate = new Date(validatedData.submissionDate)
      const opDate = new Date(validatedData.openingDate)
      if (opDate <= subDate) {
        return {
          success: false,
          error: "Opening date must be after submission date",
        }
      }
    }

    // 9. Update quotation
    const quotation = await db.quotation.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // 10. Create audit log
    await db.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "Quotation",
        entityId: id,
        userId,
        description: `Updated quotation ${quotation.nitNo}`,
      },
    })

    revalidatePath("/admindashboard/manage-qatation")

    return {
      success: true,
      data: quotation,
      message: "Quotation updated successfully",
    }
  } catch (error) {
    console.error("Error updating quotation:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update quotation",
    }
  }
}

/**
 * Enhanced Quotation Deletion with audit trail
 */
export async function deleteQuotation(id: string, userId: string): Promise<ApiResponse> {
  try {
    // 1. Find quotation
    const existingQuotation = await db.quotation.findUnique({
      where: { id },
    })

    if (!existingQuotation) {
      return {
        success: false,
        error: "Quotation not found",
      }
    }

    // 2. Check authorization
    if (existingQuotation.createdById !== userId) {
      return {
        success: false,
        error: "You are not authorized to delete this quotation",
      }
    }

    // 3. Check if published
    if (existingQuotation.status === "PUBLISHED") {
      return {
        success: false,
        error: "Cannot delete a published quotation",
      }
    }

    // 4. Delete quotation
    await db.quotation.delete({
      where: { id },
    })

    // 5. Create audit log
    await db.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "Quotation",
        entityId: id,
        userId,
        description: `Deleted quotation ${existingQuotation.nitNo}`,
      },
    })

    revalidatePath("/admindashboard/manage-qatation")

    return {
      success: true,
      message: "Quotation deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting quotation:", error)
    return {
      success: false,
      error: "Failed to delete quotation",
    }
  }
}

/**
 * Enhanced Quotation Publishing with validation
 */
export async function publishQuotation(id: string, userId: string): Promise<ApiResponse> {
  try {
    // 1. Find quotation
    const quotation = await db.quotation.findUnique({
      where: { id },
    })

    if (!quotation) {
      return {
        success: false,
        error: "Quotation not found",
      }
    }

    // 2. Check authorization
    if (quotation.createdById !== userId) {
      return {
        success: false,
        error: "You are not authorized to publish this quotation",
      }
    }

    // 3. Check if already published
    if (quotation.status === "PUBLISHED") {
      return {
        success: false,
        error: "Quotation is already published",
      }
    }

    // 4. Validate quotation is complete
    if (!quotation.nitNo || !quotation.workName || !quotation.estimatedAmount) {
      return {
        success: false,
        error: "Cannot publish incomplete quotation. All required fields must be filled.",
      }
    }

    // 5. Validate dates are in future
    const submissionDate = new Date(quotation.submissionDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (submissionDate <= today) {
      return {
        success: false,
        error: "Submission date must be in the future",
      }
    }

    // 6. Publish quotation
    const publishedQuotation = await db.quotation.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // 7. Create audit log
    await db.auditLog.create({
      data: {
        action: "PUBLISH",
        entityType: "Quotation",
        entityId: id,
        userId,
        description: `Published quotation ${quotation.nitNo}`,
      },
    })

    revalidatePath("/admindashboard/manage-qatation")
    revalidatePath("/admindashboard/manage-qatation/published")

    return {
      success: true,
      data: publishedQuotation,
      message: "Quotation published successfully",
    }
  } catch (error) {
    console.error("Error publishing quotation:", error)
    return {
      success: false,
      error: "Failed to publish quotation",
    }
  }
}

/**
 * Get quotations with filtering
 */
export async function getQuotations(filters?: QuotationFilters) {
  try {
    const validatedFilters = quotationFiltersSchema.parse(filters || {})

    const where: any = {}

    if (validatedFilters.status) {
      where.status = validatedFilters.status
    }

    if (validatedFilters.quotationType) {
      where.quotationType = validatedFilters.quotationType
    }

    if (validatedFilters.search) {
      where.OR = [
        { nitNo: { contains: validatedFilters.search, mode: "insensitive" } },
        { workName: { contains: validatedFilters.search, mode: "insensitive" } },
      ]
    }

    if (validatedFilters.dateFrom || validatedFilters.dateTo) {
      where.nitDate = {}
      if (validatedFilters.dateFrom) {
        where.nitDate.gte = new Date(validatedFilters.dateFrom)
      }
      if (validatedFilters.dateTo) {
        where.nitDate.lte = new Date(validatedFilters.dateTo)
      }
    }

    const quotations = await db.quotation.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bids: {
          include: {
            agencyDetails: true,
          },
        },
        order: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      success: true,
      data: quotations,
    }
  } catch (error) {
    console.error("Error fetching quotations:", error)
    return {
      success: false,
      error: "Failed to fetch quotations",
    }
  }
}

/**
 * Get single quotation by ID
 */
export async function getQuotationById(id: string) {
  try {
    const quotation = await db.quotation.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bids: {
          include: {
            agencyDetails: true,
          },
        },
        comparativeStatement: true,
        order: {
          include: {
            items: true,
            agencyDetails: true,
          },
        },
        documents: true,
      },
    })

    if (!quotation) {
      return {
        success: false,
        error: "Quotation not found",
      }
    }

    return {
      success: true,
      data: quotation,
    }
  } catch (error) {
    console.error("Error fetching quotation:", error)
    return {
      success: false,
      error: "Failed to fetch quotation",
    }
  }
}

/**
 * Get quotation statistics
 */
export async function getQuotationStats(userId?: string) {
  try {
    const where = userId ? { createdById: userId } : {}

    const stats = await db.quotation.groupBy({
      by: ["status"],
      where,
      _count: {
        id: true,
      },
    })

    const totalAmount = await db.quotation.aggregate({
      where,
      _sum: {
        estimatedAmount: true,
      },
    })

    return {
      success: true,
      data: {
        byStatus: stats,
        totalAmount: totalAmount._sum.estimatedAmount || 0,
      },
    }
  } catch (error) {
    console.error("Error fetching quotation stats:", error)
    return {
      success: false,
      error: "Failed to fetch statistics",
    }
  }
}
