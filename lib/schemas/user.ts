import { z } from "zod"

export const userSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["admin", "user", "viewer"]).default("user"),
  designation: z.string().optional(),
  phone: z.string().optional(),
})

export const updateUserSchema = userSchema.partial()

export type UserSchema = z.infer<typeof userSchema>
export type UpdateUserSchema = z.infer<typeof updateUserSchema>
