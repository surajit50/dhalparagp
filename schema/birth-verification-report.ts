import { z } from "zod";

export const birthVerificationReportSchema = z.object({
  memoNo: z.string().min(1, "Memo number is required"),
  memoDate: z.date({
    required_error: "Memo date is required",
    invalid_type_error: "Invalid date format for memo date",
  }),
  toAuthority: z.string().min(1, "Recipient authority is required"),
  toZone: z.string().min(1, "Recipient zone is required"),
  subject: z.string().min(1, "Subject is required"),
  
  // Certificate particulars
  certificateHolder: z.string().min(2, "Certificate holder name must be at least 2 characters"),
  motherName: z.string().min(2, "Mother's name must be at least 2 characters"),
  fatherName: z.string().min(2, "Father's name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
    invalid_type_error: "Invalid date format for date of birth",
  }),
  registrationNo: z.string().min(1, "Registration number is required"),
  dateOfRegistration: z.date({
    required_error: "Registration date is required",
    invalid_type_error: "Invalid date format for registration date",
  }),
  placeOfRegistration: z.string().min(1, "Place of registration is required"),
  
  isGenuine: z.boolean().default(true),
  remarks: z.string().optional(),
});

export type BirthVerificationReportFormData = z.infer<typeof birthVerificationReportSchema>;

export const updateBirthVerificationReportSchema = birthVerificationReportSchema.partial();

export const birthVerificationFiltersSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  certificateHolder: z.string().optional(),
  registrationNo: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export type BirthVerificationFilters = z.infer<typeof birthVerificationFiltersSchema>;
