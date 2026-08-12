import { z } from "zod";

export const CertificateTypeEnum = z.enum(["BIRTH", "DEATH"]);
export type CertificateType = z.infer<typeof CertificateTypeEnum>;

// Updated statuses: SUBMITTED, UNDER_ENQUIRY, APPROVED, REJECTED
export const ApplicationStatusEnum = z.enum([
  "SUBMITTED",
  "UNDER_ENQUIRY",
  "APPROVED",
  "REJECTED",
]);
export type ApplicationStatus = z.infer<typeof ApplicationStatusEnum>;

export const digitalCertificateApplicationSchema = z
  .object({
    certificateType: CertificateTypeEnum,

    // Section A: Applicant's Details
    applicantName: z
      .string()
      .min(2, "Applicant name must be at least 2 characters")
      .max(100, "Applicant name cannot exceed 100 characters"),
    relationshipWithPerson: z.string().optional().nullable(),
    fatherOrHusbandName: z
      .string()
      .min(2, "Father's / Husband's Name is required")
      .max(100),
    postalAddress: z
      .string()
      .min(5, "Complete postal address is required")
      .max(300),
    mobileNumber: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),

    // Section B: Particulars of Birth / Death
    personName: z
      .string()
      .min(2, "Name of the person is required")
      .max(100),
    fatherName: z.string().optional().nullable(),
    motherName: z.string().optional().nullable(),
    deceasedFatherOrHusbandName: z.string().optional().nullable(),
    dateOfEvent: z.coerce.date({
      required_error: "Date of Birth / Death is required",
      invalid_type_error: "Invalid date format",
    }),
    placeOfEvent: z
      .string()
      .min(2, "Place of Birth / Death is required")
      .max(150),
    registrationYear: z
      .string()
      .min(4, "Registration year must be 4 digits (e.g., 2024)")
      .max(4, "Registration year must be 4 digits"),
    registrationNumber: z
      .string()
      .min(1, "Registration number is required")
      .max(50),
    purpose: z
      .string()
      .min(2, "Purpose for obtaining certificate is required")
      .max(200),

    // Section C: Documents Enclosed (PDF under 250 KB)
    docProofOfIdentity: z.boolean().default(false),
    docProofOfIdentityUrl: z.string().optional().nullable(),
    docProofOfIdentityPublicId: z.string().optional().nullable(),

    docPreviousCertificate: z.boolean().default(false),
    docPreviousCertificateUrl: z.string().optional().nullable(),
    docPreviousCertificatePublicId: z.string().optional().nullable(),

    docGeneralDiary: z.boolean().default(false),
    docGeneralDiaryUrl: z.string().optional().nullable(),
    docGeneralDiaryPublicId: z.string().optional().nullable(),

    docRegistrationDetails: z.boolean().default(false),
    docRegistrationDetailsUrl: z.string().optional().nullable(),
    docRegistrationDetailsPublicId: z.string().optional().nullable(),

    docOtherDocument: z.boolean().default(false),
    docOtherDetails: z.string().optional().nullable(),
    docOtherDocumentUrl: z.string().optional().nullable(),
    docOtherDocumentPublicId: z.string().optional().nullable(),

    // Section C2: Identity Documents for Verification (Father)
    docFatherAadhaar: z.boolean().default(false),
    docFatherAadhaarUrl: z.string().optional().nullable(),
    docFatherAadhaarPublicId: z.string().optional().nullable(),

    docFatherVoter: z.boolean().default(false),
    docFatherVoterUrl: z.string().optional().nullable(),
    docFatherVoterPublicId: z.string().optional().nullable(),

    // Section C2: Identity Documents for Verification (Mother)
    docMotherAadhaar: z.boolean().default(false),
    docMotherAadhaarUrl: z.string().optional().nullable(),
    docMotherAadhaarPublicId: z.string().optional().nullable(),

    docMotherVoter: z.boolean().default(false),
    docMotherVoterUrl: z.string().optional().nullable(),
    docMotherVoterPublicId: z.string().optional().nullable(),

    // Section C2: Identity Documents for Verification (Child - Birth Certificate Only)
    docChildAadhaar: z.boolean().default(false),
    docChildAadhaarUrl: z.string().optional().nullable(),
    docChildAadhaarPublicId: z.string().optional().nullable(),

    // Section D: Declaration
    declarationPlace: z.string().default("Dhalpara"),
    declarationDate: z.coerce.date().default(() => new Date()),
    applicantSignatureName: z.string().optional().nullable(),
    declarationAgreed: z.boolean().refine((val) => val === true, {
      message: "You must accept the declaration to proceed",
    }),
  })
  .refine(
    (data) => {
      if (data.certificateType === "DEATH") {
        return (
          data.relationshipWithPerson &&
          data.relationshipWithPerson.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Relationship with the deceased is required for Death Certificate",
      path: ["relationshipWithPerson"],
    }
  );

export type DigitalCertificateApplicationFormData = z.infer<
  typeof digitalCertificateApplicationSchema
>;

// Office verification schema – changed to use UNDER_ENQUIRY instead of PENDING
export const officeVerificationSchema = z.object({
  applicationReceivedOn: z.coerce.date().optional().nullable(),
  registerNoPageNoSerialNo: z.string().optional().nullable(),
  officeRegistrationYear: z.string().optional().nullable(),
  officeRegistrationNo: z.string().optional().nullable(),
  dateOfVerification: z.coerce.date().optional().nullable(),
  recordAvailable: z.boolean().optional().nullable(),
  registrationVerified: z.boolean().optional().nullable(),
  subRegistrarOrder: z.enum(["UNDER_ENQUIRY", "APPROVED", "REJECTED"]).optional().nullable(),
  rejectionReason: z.string().optional().nullable(),
  dataEntryOperatorSignature: z.string().optional().nullable(),
  dataEntryOperatorName: z.string().optional().nullable(),
  dataEntryOperatorDate: z.coerce.date().optional().nullable(),
  subRegistrarSignature: z.string().optional().nullable(),
  subRegistrarName: z.string().optional().nullable(),
  subRegistrarDate: z.coerce.date().optional().nullable(),
  issuedCertificateUrl: z.string().optional().nullable(),
});

export type OfficeVerificationFormData = z.infer<typeof officeVerificationSchema>;

// Filters schema – updated status options
export const digitalCertificateFilterSchema = z.object({
  certificateType: z.enum(["ALL", "BIRTH", "DEATH"]).optional(),
  status: z.enum(["ALL", "SUBMITTED", "UNDER_ENQUIRY", "APPROVED", "REJECTED"]).optional(),
  search: z.string().optional(),
  year: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
});

export type DigitalCertificateFilters = z.infer<
  typeof digitalCertificateFilterSchema
>;
