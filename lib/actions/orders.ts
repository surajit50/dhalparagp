"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { orderSchema, orderFiltersSchema } from "@/lib/schemas/order"
import type { ApiResponse, OrderFormData, OrderFilters } from "@/lib/types"

export async function createOrder(
  quotationId: string,
  supplierId: string,
  data: OrderFormData,
  userId: string,
): Promise<ApiResponse> {
  try {
    const validatedData = orderSchema.parse(data)

    // Get quotation and supplier details
    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
    })

    const supplier = await db.agencyDetails.findUnique({
      where: { id: supplierId },
    })

    if (!quotation || !supplier) {
      return {
        success: false,
        error: "Quotation or supplier not found",
      }
    }

    const totalAmount = validatedData.items.reduce((sum, item) => sum + item.amount, 0)
    const savings = quotation.estimatedAmount - totalAmount

    const order = await db.order.create({
      data: {
        orderNo: validatedData.orderNo,
        orderDate: new Date(validatedData.orderDate),
        deliveryDate: new Date(validatedData.deliveryDate),
        orderAmount: totalAmount,
        estimatedAmount: quotation.estimatedAmount,
        savings,
        deliveryAddress: `${quotation.workName} - Delivery Address`, // You can customize this
        specialInstructions: validatedData.specialInstructions,
        quotationId,
        agencyDetailsId: supplierId,
        createdById: userId,
        items: {
          create: validatedData.items,
        },
        timeline: {
          create: [
            {
              date: new Date(),
              event: "Order Placed",
              status: "COMPLETED",
            },
          ],
        },
      },
      include: {
        items: true,
        agencyDetails: true,
        quotation: true,
        timeline: true,
      },
    })

   

    revalidatePath("/orders")

    return {
      success: true,
      data: order,
      message: "Order created successfully",
    }
  } catch (error) {
    console.error("Error creating order:", error)
    return {
      success: false,
      error: "Failed to create order",
    }
  }
}

export async function updateOrderStatus(id: string, status: string, userId: string): Promise<ApiResponse> {
  try {
    const order = await db.order.update({
      where: { id },
      data: { status: status as any },
    })

    // Add timeline entry
    await db.orderTimeline.create({
      data: {
        orderId: id,
        date: new Date(),
        event: `Status updated to ${status}`,
        status: "COMPLETED",
      },
    })

    

    revalidatePath("/orders")

    return {
      success: true,
      data: order,
      message: "Order status updated successfully",
    }
  } catch (error) {
    console.error("Error updating order status:", error)
    return {
      success: false,
      error: "Failed to update order status",
    }
  }
}

export async function updateOrderProgress(
  id: string,
  completionPercentage: number,
  userId: string,
): Promise<ApiResponse> {
  try {
    const order = await db.order.update({
      where: { id },
      data: { completionPercentage },
    })

    // Add timeline entry
    await db.orderTimeline.create({
      data: {
        orderId: id,
        date: new Date(),
        event: `Progress updated to ${completionPercentage}%`,
        status: "IN_PROGRESS",
      },
    })

    revalidatePath("/orders")

    return {
      success: true,
      data: order,
      message: "Order progress updated successfully",
    }
  } catch (error) {
    console.error("Error updating order progress:", error)
    return {
      success: false,
      error: "Failed to update order progress",
    }
  }
}

export async function getOrders(filters?: OrderFilters) {
  try {
    const validatedFilters = orderFiltersSchema.parse(filters || {})

    const where: any = {}

    if (validatedFilters.status) {
      where.status = validatedFilters.status
    }

    if (validatedFilters.paymentStatus) {
      where.paymentStatus = validatedFilters.paymentStatus
    }

    if (validatedFilters.search) {
      where.OR = [
        { orderNo: { contains: validatedFilters.search, mode: "insensitive" } },
        { quotation: { workName: { contains: validatedFilters.search, mode: "insensitive" } } },
        { supplier: { name: { contains: validatedFilters.search, mode: "insensitive" } } },
      ]
    }

    if (validatedFilters.dateFrom || validatedFilters.dateTo) {
      where.orderDate = {}
      if (validatedFilters.dateFrom) {
        where.orderDate.gte = new Date(validatedFilters.dateFrom)
      }
      if (validatedFilters.dateTo) {
        where.orderDate.lte = new Date(validatedFilters.dateTo)
      }
    }

    const orders = await db.order.findMany({
      where,
      include: {
        quotation: true,
        agencyDetails: true,
        items: true,
        timeline: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      success: true,
      data: orders,
    }
  } catch (error) {
    console.error("Error fetching orders:", error)
    return {
      success: false,
      error: "Failed to fetch orders",
    }
  }
}

export async function getOrderById(id: string) {
  try {
    const order = await db.order.findUnique({
      where: { id },
      include: {
        quotation: true,
        agencyDetails: true,
        createdBy: true,
        items: true,
        timeline: {
          orderBy: {
            date: "asc",
          },
        },
        documents: true,
      },
    })

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      }
    }

    return {
      success: true,
      data: order,
    }
  } catch (error) {
    console.error("Error fetching order:", error)
    return {
      success: false,
      error: "Failed to fetch order",
    }
  }
}
