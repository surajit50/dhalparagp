import { z } from "zod"

export const bidderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CONTRACTOR", "SUPPLIER", "SERVICE_PROVIDER", "BUYER"], {
    required_error: "Please select bidder type",
  }),
  contactPerson: z.string().min(1, "Contact person is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  address: z.string().min(1, "Address is required"),
  gstNo: z.string().min(15, "Valid GST number is required"),
  panNo: z.string().optional(),
  experience: z.string().optional(),
  specialization: z.string().optional(),
})

export const updateBidderSchema = bidderSchema.partial()

export const bidSchema = z.object({
  amount: z.number().min(0, "Bid amount must be positive"),
  remarks: z.string().optional(),
})

export const bidderFiltersSchema = z.object({
  type: z.enum(["CONTRACTOR", "SUPPLIER", "SERVICE_PROVIDER", "BUYER"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "BLACKLISTED"]).optional(),
  search: z.string().optional(),
})

export type BidderSchema = z.infer<typeof bidderSchema>
export type UpdateBidderSchema = z.infer<typeof updateBidderSchema>
export type BidSchema = z.infer<typeof bidSchema>
export type BidderFiltersSchema = z.infer<typeof bidderFiltersSchema>
