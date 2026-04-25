import { z } from "zod";

// Schema for individual enquiry finding
export const enquiryFindingSchema = z.object({
  serialNumber: z.number().min(1, "Serial number must be at least 1"),
  particulars: z.string().min(1, "Particulars are required"),
  details: z.string().min(1, "Details are required"),
});

// Schema for individual document verification
export const documentVerifiedSchema = z.object({
  serialNumber: z.number().min(1, "Serial number must be at least 1"),
  documentName: z.string().min(1, "Document name is required"),
  documentNumber: z.string().optional(),
  issuedAuthority: z.string().min(1, "Issuing authority is required"),
});

// Main form schema
export const domicileCertificateEnquirySchema = z.object({
  // Header Information
  memoNo: z.string().min(1, "Memo number is required"),
  memoDate: z.date({
    required_error: "Memo date is required",
    invalid_type_error: "Invalid date format for memo date",
  }),
  
  // Reference Information
  letterNumber: z.string().optional(),
  letterDate: z.date({
    required_error: "Letter date is required",
    invalid_type_error: "Invalid date format for letter date",
  }).optional(),
  
  // Applicant Information
  applicantName: z.string().min(2, "Applicant name must be at least 2 characters"),
  applicantFatherName: z.string().min(2, "Father's/Mother's name must be at least 2 characters"),
  applicantAddress: z.string().min(10, "Address must be at least 10 characters"),
  applicantVillage: z.string().min(2, "Village name must be at least 2 characters"),
  applicantPostOffice: z.string().min(2, "Post office must be at least 2 characters"),
  applicantDistrict: z.string().min(2, "District must be at least 2 characters"),
  applicantState: z.string().min(2, "State must be at least 2 characters"),
  
  // Enquiry Findings (Array of findings)
  enquiryFindings: z.array(enquiryFindingSchema).min(1, "At least one enquiry finding is required"),
  
  // Documents Verified (Array of documents)
  documentsVerified: z.array(documentVerifiedSchema).min(1, "At least one document verification is required"),
  
  // Final Report
  isPermanentResident: z.boolean({
    required_error: "Please specify if the applicant is a permanent resident",
  }),
  finalRemarks: z.string().optional(),
});

// Type inference
export type DomicileCertificateEnquiryFormData = z.infer<typeof domicileCertificateEnquirySchema>;
export type EnquiryFindingData = z.infer<typeof enquiryFindingSchema>;
export type DocumentVerifiedData = z.infer<typeof documentVerifiedSchema>;

// Schema for updating existing enquiry
export const updateDomicileCertificateEnquirySchema = domicileCertificateEnquirySchema.partial();

// Schema for filtering enquiries
export const enquiryFiltersSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  applicantName: z.string().optional(),
  applicantVillage: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export type EnquiryFilters = z.infer<typeof enquiryFiltersSchema>;
