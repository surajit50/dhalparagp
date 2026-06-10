"use server"

import { db } from "@/lib/db"
import { currentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createProcurementOrder(data: {
  orderNo: string,
  orderDate: Date,
  orderType: string,
  quotationId: string,
  agencyId: string,
  amount: number,
  deliveryDate?: Date,
  terms?: string
}) {
  try {
    const user = await currentUser()
    if (!user || !user.id) return { success: false, error: "Unauthorized" }

    const order = await db.procurementOrder.create({
      data: {
        ...data,
        createdById: user.id
      }
    })

    // Update quotation status
    await db.procurementQuotation.update({
      where: { id: data.quotationId },
      data: { status: "CLOSED" }
    })

    revalidatePath("/admindashboard/manage-qatation/orders")
    return { success: true, data: order }
  } catch (error) {
    console.error("Error creating order:", error)
    return { success: false, error: "Failed to create order" }
  }
}

export async function getOrders() {
  try {
    return await db.procurementOrder.findMany({
      include: {
        quotation: {
          include: { category: true }
        },
        agency: true,
        bills: true,
        certificate: true
      },
      orderBy: { orderDate: "desc" }
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return []
  }
}
