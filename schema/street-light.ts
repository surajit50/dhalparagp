import { z } from "zod";

// ─── Mouza Master ────────────────────────────────────────────────────────────

export const MouzaMasterSchema = z.object({
  mouzaName: z.string().min(1, "Mouza name is required"),
  jlNo: z.string().optional(),
  gramSansad: z.string().min(1, "Gram Sansad is required"),
  ward: z.string().optional(),
  mouzaCode: z
    .string()
    .min(2)
    .max(6)
    .regex(/^[A-Z0-9]+$/, "Mouza code must be uppercase letters/numbers only")
    .describe("Short code used in Light ID, e.g. DHP"),
  sansadCode: z
    .string()
    .min(2)
    .max(6)
    .regex(/^[A-Z0-9]+$/, "Sansad code must be uppercase letters/numbers only")
    .optional()
    .describe("Short code used in Light ID, e.g. LAL"),
});

export type MouzaMasterInput = z.infer<typeof MouzaMasterSchema>;

// ─── Street Light ────────────────────────────────────────────────────────────

export const StreetLightSchema = z.object({
  mouzaId: z.string().min(1, "Mouza is required"),

  sansad: z.string().optional(),
  ward: z.string().optional(),
  landmark: z.string().optional(),
  roadName: z.string().optional(),
  poleNo: z.string().optional(),
  installYear: z.coerce.number().int().min(1950).max(2100).optional(),
  ownership: z
    .enum(["GP", "ELECTRICITY_DEPARTMENT", "OTHER"])
    .optional(),

  // GPS
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  gpsAccuracy: z.coerce.number().optional(),

  // Light info
  lightType: z.enum(["LED", "SODIUM", "CFL", "HALOGEN", "OTHER"]).optional(),
  wattage: z.coerce.number().int().min(1).max(2000).optional(),
  poleType: z
    .enum(["ELECTRIC_POLE", "RCC", "MS", "WOODEN", "OTHER"])
    .optional(),

  // Status
  lightCondition: z
    .enum(["GOOD", "REPAIR_REQUIRED", "DEFECTIVE", "MISSING"])
    .default("GOOD"),
  workingStatus: z.enum(["WORKING", "NOT_WORKING"]).default("WORKING"),
  bulbInstallationDate: z.string().optional(),
  lastInspection: z.string().optional(),
  remarks: z.string().optional(),

  // Cloudinary
  lightImageUrl: z.string().optional(),
  lightImagePublicId: z.string().optional(),
  poleImageUrl: z.string().optional(),
  poleImagePublicId: z.string().optional(),
});

export type StreetLightInput = z.infer<typeof StreetLightSchema>;

// ─── Street Light Complaint ───────────────────────────────────────────────────

export const StreetLightComplaintSchema = z.object({
  streetLightId: z.string().min(1, "Street light ID is required"),
  complaintType: z
    .enum(["NOT_WORKING", "DAMAGED", "MISSING", "WIRE_ISSUE", "OTHER"])
    .optional(),
  description: z.string().optional(),
  reportedBy: z.string().optional(),
  reporterMobile: z.string().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),

  // Cloudinary complaint image
  complaintImageUrl: z.string().optional(),
  complaintImagePublicId: z.string().optional(),
});

export type StreetLightComplaintInput = z.infer<
  typeof StreetLightComplaintSchema
>;

// ─── Complaint Update (status / repair) ──────────────────────────────────────

export const ComplaintUpdateSchema = z.object({
  status: z
    .enum(["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"])
    .optional(),
  assignedTo: z.string().optional(),
  assignedStaffId: z.string().optional(),
  assignedAgencyId: z.string().optional(),
  assignedDate: z.string().optional(),
  repairDate: z.string().optional(),
  resolvedDate: z.string().optional(),
  completionImageUrl: z.string().optional(),
  completionImagePublicId: z.string().optional(),
  repairRemarks: z.string().optional(),
});

export type ComplaintUpdateInput = z.infer<typeof ComplaintUpdateSchema>;

// ─── Report Query Params ──────────────────────────────────────────────────────

export const ReportQuerySchema = z.object({
  type: z
    .enum([
      "mouza-wise",
      "sansad-wise",
      "working-status",
      "defective",
      "repair-required",
      "no-photo",
      "gps-survey",
      "led-total",
      "wattage-total",
      "new-installation",
    ])
    .default("mouza-wise"),
  mouzaId: z.string().optional(),
  sansad: z.string().optional(),
  status: z.string().optional(),
});
