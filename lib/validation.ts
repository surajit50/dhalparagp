import { z } from "zod"

export const fetchApprovedActionPlansSchema = z.object({
  financialYear: z.string().optional(),
  searchTerm: z.string().optional().default(""),
  page: z.number().min(1).optional().default(1),
  pageSize: z.number().min(1).max(100).optional().default(20),
})

export const updateActionPlanParamsSchema = z.object({
  id: z.string().uuid("Invalid action plan ID"),
  data: z.object({
    // Add your actionplanschema fields here
    activityName: z.string().min(1, "Activity name is required"),
    schemeName: z.string().min(1, "Scheme name is required"),
    estimatedCost: z.string().min(1, "Estimated cost is required"),
    locationofAsset: z.string().min(1, "Location is required"),
    financialYear: z.string().min(1, "Financial year is required"),
    // Add other fields as needed
  }),
})



import {  SAMABYATHI_RELATIONS } from "@/constants/samabyathi";
import { villagenameOption } from "@/constants";

export const applicationSchema = z.object({
  applicantName: z.string().min(2, "Name is too short"),
  mobileNumber: z
    .string()
    .length(10, "Mobile number must be 10 digits")
    .regex(/^[0-9]+$/, "Mobile number must contain only digits"),
  villageName: z.enum(villagenameOption.map((item) => item.value) as [string, ...string[]]),
  deceasedName: z.string().min(2, "Deceased name is too short"),
  relation: z.enum(SAMABYATHI_RELATIONS as [string, ...string[]]),
  dateOfDeath: z.string().min(1, "Date of death is required"),
  voterId: z.string().min(1, "Voter ID is required"),
  aadhaarNumber: z
    .string()
    .length(12, "Aadhaar number must be 12 digits")
    .regex(/^[0-9]+$/, "Aadhaar number must contain only digits"),
});

export const allotmentSchema = z.object({
  amount: z.number().min(1),
  receivedDate: z.string(),
});

export const musterSchema = z.object({
  applicationId: z.string(),
  allottedAmount: z.number().min(1),
  paymentStatus: z.enum(["PENDING", "PAID"]),
});