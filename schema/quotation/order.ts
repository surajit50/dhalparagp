import { z } from "zod"

export const orderItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  specifications: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit: z.string().min(1, "Unit is required"),
  rate: z.number().min(0, "Rate must be positive"),
  amount: z.number().min(0, "Amount must be positive"),
})

export const orderSchema = z.object({
  orderNo: z.string().min(1, "Order number is required"),
  orderDate: z.string().min(1, "Order date is required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  specialInstructions: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
})

export const updateOrderSchema = orderSchema.partial()

export const orderFiltersSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "DELIVERED", "COMPLETED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["PENDING", "ADVANCE_PAID", "PROCESSING", "PAID", "OVERDUE"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
})

export type OrderSchema = z.infer<typeof orderSchema>
export type OrderItemSchema = z.infer<typeof orderItemSchema>
export type UpdateOrderSchema = z.infer<typeof updateOrderSchema>
export type OrderFiltersSchema = z.infer<typeof orderFiltersSchema>
