"use server"

import { db } from "@/lib/db"
import { currentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const QuotationSchema = z.object({
  nitNo: z.string().min(1, "NIT No is required"),
  nitDate: z.date(),
  categoryId: z.string().min(1, "Category is required"),
  workName: z.string().min(1, "Work Name is required"),
  description: z.string().optional(),
  estimatedAmount: z.number().min(0),
  submissionDate: z.date(),
  submissionTime: z.string(),
  openingDate: z.date(),
  openingTime: z.string(),
  dynamicData: z.any().optional(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().min(0),
    unit: z.string().min(1),
    rate: z.number().optional(),
    amount: z.number().optional(),
  })),
})

export async function createQuotation(data: any) {
  try {
    const user = await currentUser()
    if (!user || !user.id) return { success: false, error: "Unauthorized" }

    const validated = QuotationSchema.parse(data)

    const quotation = await db.procurementQuotation.create({
      data: {
        nitNo: validated.nitNo,
        nitDate: validated.nitDate,
        categoryId: validated.categoryId,
        workName: validated.workName,
        description: validated.description,
        estimatedAmount: validated.estimatedAmount,
        submissionDate: validated.submissionDate,
        submissionTime: validated.submissionTime,
        openingDate: validated.openingDate,
        openingTime: validated.openingTime,
        dynamicData: validated.dynamicData,
        createdById: user.id,
        items: {
          create: validated.items
        }
      }
    })

    revalidatePath("/admindashboard/manage-quotation/view")
    return { success: true, data: quotation }
  } catch (error) {
    console.error("Error creating quotation:", error)
    return { success: false, error: "Failed to create quotation" }
  }
}

export async function getQuotationById(id: string) {
  try {
    return await db.procurementQuotation.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            fields: true
          }
        },
        items: true,
        bidders: {
          include: {
            agency: true
          }
        },
        order: true,
        comparativeStatement: true
      }
    })
  } catch (error) {
    console.error("Error fetching quotation:", error)
    return null
  }
}

export async function getQuotations() {
  try {
    return await db.procurementQuotation.findMany({
      include: {
        category: true,
        items: true,
        _count: {
          select: { bidders: true }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })
  } catch (error) {
    console.error("Error fetching quotations:", error)
    return []
  }
}
