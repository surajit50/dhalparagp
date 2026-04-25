"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { quotationSchema, updateQuotationSchema, quotationFiltersSchema } from "@/lib/schemas/quotation"
import type { ApiResponse, QuotationFormData, QuotationFilters } from "@/lib/types"
import { QuotationType } from "@prisma/client"

export async function createQuotation(data: QuotationFormData, userId: string): Promise<ApiResponse> {
  try {
    const validatedData = quotationSchema.parse(data)

   

    const quotation = await db.quotation.create({
      data: {
        ...validatedData,
        quotationType: QuotationType[validatedData.quotationType as keyof typeof QuotationType],
        nitDate: new Date(validatedData.nitDate),
        submissionDate: new Date(validatedData.submissionDate),
        openingDate: new Date(validatedData.openingDate),
        estimatedAmount: Number.parseFloat(validatedData.estimatedAmount),
        createdById: userId,
      },
      include: {
        createdBy: true,
      },
    })

   

    revalidatePath("/quotations")

    return {
      success: true,
      data: quotation,
      message: "Quotation created successfully",
    }
  } catch (error) {
    console.error("Error creating quotation:", error)
    return {
      success: false,
      error: "Failed to create quotation",
    }
  }
}

export async function updateQuotation(
  id: string,
  data: Partial<QuotationFormData>,
  userId: string,
): Promise<ApiResponse> {
  try {
    const validatedData = updateQuotationSchema.parse(data)

    const existingQuotation = await db.quotation.findUnique({
      where: { id },
    })

    if (!existingQuotation) {
      return {
        success: false,
        error: "Quotation not found",
      }
    }

    const updateData: any = { ...validatedData }

    // Map form values to database enum values if quotationType is being updated
    if (validatedData.quotationType) {
      const quotationTypeMap = {
        work: "WORK",
        supply: "SUPPLY",
        sale: "SALE",
      } as const
      updateData.quotationType = quotationTypeMap[validatedData.quotationType as keyof typeof quotationTypeMap]
    }

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

    const quotation = await db.quotation.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: true,
      },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "quotation update",
        entityId: userId,
        userId,
      },
    })

    revalidatePath("/quotations")

    return {
      success: true,
      data: quotation,
      message: "Quotation updated successfully",
    }
  } catch (error) {
    console.error("Error updating quotation:", error)
    return {
      success: false,
      error: "Failed to update quotation",
    }
  }
}

export async function deleteQuotation(id: string, userId: string): Promise<ApiResponse> {
  try {
    const existingQuotation = await db.quotation.findUnique({
      where: { id },
    })

    if (!existingQuotation) {
      return {
        success: false,
        error: "Quotation not found",
      }
    }

    await db.quotation.delete({
      where: { id },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "Quotation",
        entityId: id,
        userId,
      },
    })

    revalidatePath("/quotations")

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

export async function publishQuotation(id: string, userId: string): Promise<ApiResponse> {
  try {
    const quotation = await db.quotation.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        action: "PUBLISH",
        entityType: "Quotation",
        entityId: id,
        userId,
      },
    })

    revalidatePath("/quotations")

    return {
      success: true,
      data: quotation,
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
        createdBy: true,
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

export async function getQuotationById(id: string) {
  try {
    const quotation = await db.quotation.findUnique({
      where: { id },
      include: {
        createdBy: true,
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
