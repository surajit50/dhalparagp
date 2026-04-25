import { z } from "zod"

export const quotationSchema = z.object({
  quotationType: z.enum(["WORK", "SUPPLY", "SALE"], {
    required_error: "Please select a quotation type",
  }),
  nitNo: z.string().min(1, "NIT/NIQ No. is required"),
  nitDate: z.string().min(1, "Date is required"),
  workName: z.string().min(1, "Name of Work/Material/Item is required"),
  estimatedAmount: z.string().min(1, "Estimated Amount is required"),
  submissionDate: z.string().min(1, "Submission Last Date is required"),
  submissionTime: z.string().min(1, "Submission Last Time is required"),
  openingDate: z.string().min(1, "Opening Date is required"),
  openingTime: z.string().min(1, "Opening Time is required"),
  description: z.string().optional(),
  eligibilityCriteria: z.string().optional(),
  itemCondition: z.string().optional(),
  specifications: z.string().optional(),
  workLocation: z.string().optional(),
  quantity: z.string().optional(),
  unit: z.string().optional(),
})

export const updateQuotationSchema = quotationSchema.partial()

export const quotationFiltersSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED", "CANCELLED"]).optional(),
  quotationType: z.enum(["WORK", "SUPPLY", "SALE"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
})

export type QuotationNoticeFormType = z.infer<typeof quotationSchema>
export type UpdateQuotationSchema = z.infer<typeof updateQuotationSchema>
export type QuotationFiltersSchema = z.infer<typeof quotationFiltersSchema>
