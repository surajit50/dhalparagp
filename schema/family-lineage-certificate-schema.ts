import { z } from "zod";

export const familyMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  relation: z.string().min(1, "Relation is required"),
  age: z.number().min(0).max(150).optional(),
  occupation: z.string().optional(),
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  spouse: z.string().optional(),
  notes: z.string().optional(),
  parentId: z.string().optional(),
});

export const certificateFormSchema = z.object({
  // Applicant Information
  applicantName: z.string().min(1, "Applicant name is required"),
  applicantPhone: z.string().min(10, "Valid phone number is required"),
  applicantEmail: z.string().email().optional().or(z.literal("")),
  applicantAddress: z.string().min(1, "Address is required"),

  // Ancestor Information
  ancestorName: z.string().min(1, "Ancestor name is required"),
  casteCategory: z.string().min(1, "Caste category is required"),

  // Address Information
  village: z.string().min(1, "Village is required"),
  postOffice: z.string().min(1, "Post office is required"),
  block: z.string().min(1, "Block is required"),
  district: z.string().min(1, "District is required"),
  state: z.string().min(1, "State is required"),

  // Family Members
  familyMembers: z
    .array(familyMemberSchema)
    .min(1, "At least one family member is required"),
});

export const fieldEnquirySchema = z.object({
  certificateId: z.string().min(1, "Certificate ID is required"),
  enquiryOfficer: z.string().min(1, "Enquiry officer name is required"),
  findings: z.string().min(1, "Findings are required"),
  recommendations: z.string().min(1, "Recommendations are required"),
  witnessNames: z.array(z.string()).optional(),
  documentsVerified: z.array(z.string()).optional(),
  communityVerified: z.boolean().default(false),
});

export const approvalSchema = z.object({
  certificateId: z.string().min(1, "Certificate ID is required"),
  approverName: z.string().min(1, "Approver name is required"),
  designation: z.string().min(1, "Designation is required"),
  status: z.enum(["APPROVED", "REJECTED", "RETURNED_FOR_CLARIFICATION"]),
  comments: z.string().optional(),
  level: z.number().min(1).default(1),
});

export const renewalSchema = z.object({
  originalCertificateId: z.string().min(1, "Certificate ID is required"),
  renewalReason: z.string().min(1, "Renewal reason is required"),
  additionalNotes: z.string().optional(),
});

export type CertificateFormInput = z.infer<typeof certificateFormSchema>;
export type FieldEnquiryInput = z.infer<typeof fieldEnquirySchema>;
export type ApprovalInput = z.infer<typeof approvalSchema>;
export type RenewalInput = z.infer<typeof renewalSchema>;
