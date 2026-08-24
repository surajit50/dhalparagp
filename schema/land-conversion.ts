import * as z from "zod"

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

const phoneSchema = z
  .string()
  .trim()
  .min(10, "Phone must be at least 10 digits")
  .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number")

const landAreaSchema = z
  .string()
  .trim()
  .min(1, "Land area is required")
  .regex(/^\d+(\.\d+)?$/, "Land area must be a valid number")

export const landEntrySchema = z.object({
  khatianNo: requiredText("Khatian number"),
  plotNo: requiredText("Plot number"),
  mouza: requiredText("Mouza"),
  jlNo: requiredText("JL number"),
  landAreaDec: landAreaSchema,
  presentLandUse: requiredText("Present land use"),
  proposedLandUse: requiredText("Proposed land use"),
})

export type LandEntry = z.infer<typeof landEntrySchema>

export const landConversionApplicationSchema = z.object({
  applicantName: requiredText("Applicant name"),
  applicantPhone: phoneSchema,
  applicantEmail: z.string().trim().email("Enter a valid email address").optional().or(z.literal("")),
  village: requiredText("Village"),
  postOffice: z.string().default("Trimohini"),
  ps: z.string().default("Hili"),
  state: z.string().default("West Bengal"),
  district: z.string().default("Dakshin Dinajpur"),
  address: z.string().optional(),

  gender: z.enum(["male", "female", "other"], {
    required_error: "Gender is required",
  }),
  fatherName: z.string().trim().optional(),
  husbandName: z.string().trim().optional(),

  // First land (required); additional lands in lands array
  khatianNo: requiredText("Khatian number"),
  plotNo: requiredText("Plot number"),
  mouza: requiredText("Mouza"),
  jlNo: requiredText("JL number"),
  landAreaDec: landAreaSchema,
  presentLandUse: requiredText("Present land use"),
  proposedLandUse: requiredText("Proposed land use"),

  // Additional land parcels (one certificate can cover multiple lands)
  additionalLands: z.array(landEntrySchema).optional().default([]),
})
  .superRefine((data, ctx) => {
    if (data.gender === "female") {
      if (!data.husbandName || data.husbandName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Husband name is required for female applicants",
          path: ["husbandName"],
        })
      }
    } else {
      if (!data.fatherName || data.fatherName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Father name is required",
          path: ["fatherName"],
        })
      }
    }
  })

export type LandConversionApplicationInput = z.infer<typeof landConversionApplicationSchema>

export type LandConversionCreateMode = "DRAFT" | "SUBMIT"

export const LAND_CONVERSION_DOCUMENT_TYPES = ["ID_PROOF", "LAND_DOCUMENT", "OTHER"] as const

