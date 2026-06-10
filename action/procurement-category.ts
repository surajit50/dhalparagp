"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const CategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
})

const FieldSchema = z.object({
  label: z.string().min(1, "Label is required"),
  name: z.string().min(1, "Field name is required"),
  type: z.string().min(1, "Type is required"),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(false),
  order: z.number().default(0),
})

export async function getProcurementCategories() {
  try {
    const categories = await db.procurementCategory.findMany({
      include: {
        fields: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })
    return categories
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function createProcurementCategory(data: z.infer<typeof CategorySchema>) {
  try {
    const validated = CategorySchema.parse(data)
    const category = await db.procurementCategory.create({
      data: validated,
    })
    revalidatePath("/admindashboard/manage-quotation/categories")
    return { success: true, data: category }
  } catch (error) {
    console.error("Error creating category:", error)
    return { success: false, error: "Failed to create category" }
  }
}

export async function updateProcurementCategory(id: string, data: z.infer<typeof CategorySchema>) {
  try {
    const validated = CategorySchema.parse(data)
    const category = await db.procurementCategory.update({
      where: { id },
      data: validated,
    })
    revalidatePath("/admindashboard/manage-quotation/categories")
    return { success: true, data: category }
  } catch (error) {
    console.error("Error updating category:", error)
    return { success: false, error: "Failed to update category" }
  }
}

export async function deleteProcurementCategory(id: string) {
  try {
    await db.procurementCategory.delete({
      where: { id },
    })
    revalidatePath("/admindashboard/manage-quotation/categories")
    return { success: true }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { success: false, error: "Failed to delete category" }
  }
}

export async function addProcurementField(categoryId: string, data: z.infer<typeof FieldSchema>) {
  try {
    const validated = FieldSchema.parse(data)
    const field = await db.procurementField.create({
      data: {
        ...validated,
        categoryId,
      },
    })
    revalidatePath("/admindashboard/manage-quotation/categories")
    return { success: true, data: field }
  } catch (error) {
    console.error("Error adding field:", error)
    return { success: false, error: "Failed to add field" }
  }
}

export async function deleteProcurementField(fieldId: string) {
  try {
    await db.procurementField.delete({
      where: { id: fieldId },
    })
    revalidatePath("/admindashboard/manage-quotation/categories")
    return { success: true }
  } catch (error) {
    console.error("Error deleting field:", error)
    return { success: false, error: "Failed to delete field" }
  }
}
