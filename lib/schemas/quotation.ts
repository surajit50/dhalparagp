import { z } from "zod"

/**
 * Enhanced Quotation Schema supporting:
 * - SUPPLY: Material/Items procurement
 * - WORK: Construction/Maintenance works
 * - SERVICE: Equipment/Machinery/Vehicle hiring, Services engagement
 */
export const baseQuotationSchema = z.object({
  quotationType: z.enum(["SUPPLY", "WORK", "SERVICE", "SALE"], {
    required_error: "Please select a quotation type",
  }),
  
  nitNo: z
    .string()
    .min(1, "NIT/NIQ No. is required")
    .max(50, "NIT/NIQ No. must be less than 50 characters")
    .regex(/^[a-zA-Z0-9/-]+$/, "NIT/NIQ No. can only contain letters, numbers, slashes and hyphens"),
  
  nitDate: z
    .string()
    .min(1, "Date is required")
    .refine((date) => {
      const d = new Date(date)
      return !isNaN(d.getTime())
    }, "Invalid date format"),
  
  workName: z
    .string()
    .min(5, "Name/Title must be at least 5 characters")
    .max(200, "Name/Title must be less than 200 characters"),
  
  estimatedAmount: z
    .string()
    .refine((val) => {
      const num = Number.parseFloat(val)
      return !isNaN(num) && num > 0
    }, "Estimated Amount must be a positive number")
    .refine((val) => {
      const num = Number.parseFloat(val)
      return num <= 999999999
    }, "Estimated Amount exceeds maximum allowed value"),
  
  submissionDate: z
    .string()
    .min(1, "Submission Last Date is required")
    .refine((date) => {
      const d = new Date(date)
      return !isNaN(d.getTime())
    }, "Invalid submission date format")
    .refine((date) => {
      const d = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return d >= today
    }, "Submission date cannot be in the past"),
  
  submissionTime: z
    .string()
    .min(1, "Submission Last Time is required")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM format"),
  
  openingDate: z
    .string()
    .min(1, "Opening Date is required")
    .refine((date) => {
      const d = new Date(date)
      return !isNaN(d.getTime())
    }, "Invalid opening date format"),
  
  openingTime: z
    .string()
    .min(1, "Opening Time is required")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM format"),
  
  description: z
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .optional()
    .nullable(),
  
  eligibilityCriteria: z
    .string()
    .max(2000, "Eligibility Criteria must be less than 2000 characters")
    .optional()
    .nullable(),
  
  itemCondition: z
    .string()
    .max(1000, "Item Condition must be less than 1000 characters")
    .optional()
    .nullable(),
  
  specifications: z
    .string()
    .max(2000, "Specifications must be less than 2000 characters")
    .optional()
    .nullable(),
  
  workLocation: z
    .string()
    .max(500, "Work Location must be less than 500 characters")
    .optional()
    .nullable(),
  
  quantity: z
    .string()
    .refine((val) => {
      if (!val) return true // Optional field
      const num = Number.parseFloat(val)
      return !isNaN(num) && num > 0
    }, "Quantity must be a positive number")
    .optional()
    .nullable(),
  
  unit: z
    .string()
    .max(100, "Unit must be less than 100 characters")
    .optional()
    .nullable(),

  // Service-specific fields for hiring/services
  rateType: z
    .enum(["HOURLY", "DAILY", "TRIP", "MONTHLY", "FIXED", "OTHER"])
    .optional()
    .nullable(),
  
  serviceCategory: z
    .enum([
      "JCB_HIRING",
      "TRACTOR_HIRING",
      "WATER_TANKER",
      "VEHICLE_HIRING",
      "GENERATOR_HIRING",
      "SOUND_SYSTEM",
      "EQUIPMENT_MAINTENANCE",
      "LABOR_ENGAGEMENT",
      "OTHER_SERVICE"
    ])
    .optional()
})

export const quotationSchema = baseQuotationSchema.refine(
  (data) => {
    // Opening date must be after submission date
    const submissionDate = new Date(data.submissionDate)
    const openingDate = new Date(data.openingDate)
    return openingDate > submissionDate
  },
  {
    message: "Opening date must be after submission date",
    path: ["openingDate"],
  }
).refine(
  (data) => {
    // If same date, opening time must be after submission time
    const submissionDate = new Date(data.submissionDate)
    const openingDate = new Date(data.openingDate)
    
    if (submissionDate.toDateString() === openingDate.toDateString()) {
      const [subHour, subMin] = data.submissionTime.split(":").map(Number)
      const [opHour, opMin] = data.openingTime.split(":").map(Number)
      const subTotalMin = subHour * 60 + subMin
      const opTotalMin = opHour * 60 + opMin
      return opTotalMin > subTotalMin
    }
    return true
  },
  {
    message: "Opening time must be after submission time (if same date)",
    path: ["openingTime"],
  }
)

/**
 * Update schema - all fields optional
 */
export const updateQuotationSchema = baseQuotationSchema.partial()

/**
 * Filters schema for querying quotations
 */
export const quotationFiltersSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED", "CANCELLED"]).optional(),
  quotationType: z.enum(["SUPPLY", "WORK", "SERVICE"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().max(100).optional(),
  limit: z.number().min(1).max(100).default(10).optional(),
  offset: z.number().min(0).default(0).optional(),
})

/**
 * Type exports
 */
export type QuotationSchema = z.infer<typeof quotationSchema>
export type UpdateQuotationSchema = z.infer<typeof updateQuotationSchema>
export type QuotationFiltersSchema = z.infer<typeof quotationFiltersSchema>

/**
 * Helper types for different quotation categories
 */
export type QuotationType = "SUPPLY" | "WORK" | "SERVICE"
export type RateType = "HOURLY" | "DAILY" | "TRIP" | "MONTHLY" | "FIXED" | "OTHER"
export type ServiceCategory = 
  | "JCB_HIRING"
  | "TRACTOR_HIRING"
  | "WATER_TANKER"
  | "VEHICLE_HIRING"
  | "GENERATOR_HIRING"
  | "SOUND_SYSTEM"
  | "EQUIPMENT_MAINTENANCE"
  | "LABOR_ENGAGEMENT"
  | "OTHER_SERVICE"
