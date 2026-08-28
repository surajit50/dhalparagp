import * as z from "zod";

// ============================================================
// Work Schema
// ============================================================

export const nregaWorkSchema = z.object({
  // Basic Information
  financialYear: z.string().min(4, { message: "Financial year is required" }),
  scheme: z.string().default("VB-GRAMG"),
  workName: z.string().min(3, { message: "Work name must be at least 3 characters" }),
  natureOfWork: z.string().optional(),
  masterCategory: z.string().optional(),
  subCategory: z.string().optional(),
  permissibleWorkSlNo: z.string().optional(),
  permissibleWorkDesc: z.string().optional(),

  // Location
  gramPanchayat: z.string().min(2, { message: "Gram Panchayat is required" }),
  gramSansadName: z.string().optional(),
  gramSansadNumber: z.string().optional(),
  block: z.string().min(2, { message: "Block is required" }),
  district: z.string().min(2, { message: "District is required" }),
  mouza: z.string().optional(),
  jlNumber: z.string().optional(),
  plotNumber: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  worksiteType: z.string().optional(),
  landArea: z.string().optional(),

  // Financial
  estimatedCost: z.coerce.number().nonnegative({ message: "Estimated cost must be non-negative" }).default(0),
  wageComponent: z.coerce.number().nonnegative().default(0),
  materialComponent: z.coerce.number().nonnegative().default(0),
  wageMaterialRatio: z.string().optional(),
  vbGramgShare: z.coerce.number().nonnegative().optional().default(0),
  convergenceDeptShare: z.coerce.number().nonnegative().optional().default(0),
  totalEstimatedCost: z.coerce.number().nonnegative().default(0),

  // Beneficiary
  beneficiaryType: z.string().optional(),
  beneficiaryName: z.string().optional(),
  jobCardNumber: z.string().optional(),
  beneficiaryCategory: z.string().optional(),

  // Administrative
  gramSabhaApprovalDate: z.coerce.date().optional().nullable(),
  adminApprovalNumber: z.string().optional(),
  adminApprovalDate: z.coerce.date().optional().nullable(),
  technicalSanctionNumber: z.string().optional(),
  technicalSanctionDate: z.coerce.date().optional().nullable(),
  dprNumber: z.string().optional(),
  dprDate: z.coerce.date().optional().nullable(),

  // Convergence
  convergingDepartment: z.string().optional(),
  convergingScheme: z.string().optional(),
  convergenceCategory: z.string().optional(),
  technicalKnowledgeProvided: z.string().optional(),
  nocReceived: z.string().optional(),
  nocMemoNumber: z.string().optional(),
  nocDate: z.coerce.date().optional().nullable(),

  // Other
  remarks: z.string().optional(),
  workStatus: z.enum(["DRAFT", "APPROVED", "ONGOING", "COMPLETED"]).default("DRAFT"),
  actionPlanId: z.string().optional(),
});

export type NregaWorkFormValues = z.infer<typeof nregaWorkSchema>;

// ============================================================
// Verification Schema
// ============================================================

export const nregaVerificationSchema = z.object({
  workId: z.string(),
  certificateNumber: z.coerce.number().int().min(2).max(8),
  verifications: z.array(
    z.object({
      parameterKey: z.string(),
      parameter: z.string(),
      status: z.enum(["YES", "NO", "NA", "PENDING"]).default("PENDING"),
      remarks: z.string().optional(),
    })
  ),
});

export type NregaVerificationFormValues = z.infer<typeof nregaVerificationSchema>;

// ============================================================
// Certificate Schema
// ============================================================

export const nregaCertificateSchema = z.object({
  workId: z.string(),
  certificateNumber: z.coerce.number().int().min(2).max(8),
  certificationText: z.string().optional(),
  signatureDesignation: z.string().optional(),
  signatureBlock: z.string().optional(),
  signatureDate: z.coerce.date().optional().nullable(),
});

export type NregaCertificateFormValues = z.infer<typeof nregaCertificateSchema>;

// ============================================================
// Master Data Schema
// ============================================================

export const nregaMasterDataSchema = z.object({
  type: z.string().min(1, { message: "Type is required" }),
  value: z.string().min(1, { message: "Value is required" }),
  label: z.string().min(1, { message: "Label is required" }),
  parentId: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  active: z.boolean().default(true),
});

export type NregaMasterDataFormValues = z.infer<typeof nregaMasterDataSchema>;

// ============================================================
// Signature Setting Schema
// ============================================================

export const nregaSignatureSettingSchema = z.object({
  designation: z.string().min(1, { message: "Designation is required" }),
  name: z.string().optional(),
  block: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export type NregaSignatureSettingFormValues = z.infer<typeof nregaSignatureSettingSchema>;
