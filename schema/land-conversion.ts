import * as z from "zod"

export const landEntrySchema = z.object({
  khatianNo: z.string().min(1, "Khatian number is required"),
  plotNo: z.string().min(1, "Plot number is required"),
  mouza: z.string().min(1, "Mouza is required"),
  jlNo: z.string().min(1, "JL number is required"),
  
  
  landAreaDec: z.string().min(1, "Land area is required"),
  presentLandUse: z.string().min(1, "Present land use is required"),
  proposedLandUse: z.string().min(1, "Proposed land use is required"),
})

export type LandEntry = z.infer<typeof landEntrySchema>

export const landConversionApplicationSchema = z.object({
  applicantName: z.string().min(1, "Applicant name is required"),
  applicantPhone: z.string().min(5, "Phone is required"),
  applicantEmail: z.string().email().optional().or(z.literal("")),
  address: z.string().min(1, "Address is required"),

  // First land (required); additional lands in lands array
  khatianNo: z.string().min(1, "Khatian number is required"),
  plotNo: z.string().min(1, "Plot number is required"),
  mouza: z.string().min(1, "Mouza is required"),
  jlNo: z.string().min(1, "JL number is required"),
  
  landAreaDec: z.string().min(1, "Land area is required"),
  presentLandUse: z.string().min(1, "Present land use is required"),
  proposedLandUse: z.string().min(1, "Proposed land use is required"),

  // Additional land parcels (one certificate can cover multiple lands)
  additionalLands: z.array(landEntrySchema).optional().default([]),
})

export type LandConversionApplicationInput = z.infer<typeof landConversionApplicationSchema>

export type LandConversionCreateMode = "DRAFT" | "SUBMIT"

export const LAND_CONVERSION_DOCUMENT_TYPES = ["ID_PROOF", "LAND_DOCUMENT", "OTHER"] as const

