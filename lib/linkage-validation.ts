import { z } from "zod";


export const BeneficiarySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  relation: z.string().trim().min(1, "Relation is required"),
  
  gender: z.enum(["male", "female", "other"]).optional(),
  parentId: z.string().optional(),
  livingStatus: z.enum(["alive", "dead"]).optional(),
  children: z.array(z.any()).optional(),
});

export type BeneficiaryInput = z.infer<typeof BeneficiarySchema>;

export const BeneficiaryTreeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    name: z.string().min(1, "Name is required"),
    relation: z.string().trim().min(1, "Relation is required"),
   
    gender: z.enum(["male", "female", "other"]).optional(),
    livingStatus: z.enum(["alive", "dead"]).optional(),
    children: z.array(BeneficiaryTreeSchema).optional(),
  })
);

export const CreateLinkageApplicationSchema = z.object({
  applicationNo: z.string().optional(),
  applicantName: z.string().min(1, "Applicant name is required"),
  applicantPhone: z.string().min(1, "Applicant phone is required"),
  applicantEmail: z.string().email().optional().or(z.literal("")),
  applicantAddress: z.string().min(1, "Applicant address is required"),
  applicantVillage: z.string().optional(),
  applicantPostOffice: z.string().optional(),
  applicantBlock: z.string().optional(),
  applicantDistrict: z.string().optional(),
  applicantState: z.string().optional(),
  linkageType: z.string().optional(),
  linkageCategory: z.string().optional(),
  linkageReason: z.string().optional(),
  linkedEntityName: z.string().optional(),
  linkedEntityAddress: z.string().optional(),
  documents: z.array(z.string()).optional(),
  beneficiariesTree: z.array(BeneficiaryTreeSchema).optional(),
  beneficiaries: z.array(BeneficiarySchema).optional(),
});

export const ValidateApplicationSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  validatorName: z.string().min(1, "Validator name is required"),
  findings: z.string().optional(),
  approved: z.boolean(),
});

export const VerifyOwnershipSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  officerName: z.string().min(1, "Officer name is required"),
  remarks: z.string().optional(),
  confirmed: z.boolean(),
});

export const IssueCertificateSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  certificateNo: z.string().min(1, "Certificate number is required"),
  memoNo: z.string().optional(),
  referenceNo: z.string().optional(),
  certificateType: z.string().optional(),
  certificateBody: z.string().optional(),
  conditions: z.array(z.string()).optional(),
  signedBy: z.string().min(1, "Signed by is required"),
  signedDesignation: z.string().min(1, "Designation is required"),
  beneficiariesTree: z.array(BeneficiaryTreeSchema).optional(),
  beneficiaries: z.array(BeneficiarySchema).optional(),
});

export const CreateRenewalSchema = z.object({
  certificateId: z.string().min(1, "Certificate ID is required"),
  newExpiryDate: z.date().optional(),
  renewalReason: z.string().min(1, "Renewal reason is required"),
  processedBy: z.string().optional(),
});

export const CreateDisputeSchema = z.object({
  certificateId: z.string().min(1, "Certificate ID is required"),
  raisedByName: z.string().min(1, "Name is required"),
  raisedByPhone: z.string().min(1, "Phone is required"),
  reason: z.string().min(1, "Reason is required"),
});
