import { z } from "zod"

export const notificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.enum(["INFO", "WARNING", "SUCCESS", "ERROR"]).default("INFO"),
  quotationNo: z.string().optional(),
})

export type NotificationSchema = z.infer<typeof notificationSchema>
