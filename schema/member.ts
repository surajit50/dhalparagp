import { z } from "zod";

export const memberFormSchema = z.object({
  salutation: z.string(),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  fatherGuardianName: z.string().optional(),
  dob: z
    .string()
    .regex(/^\d{2}-\d{2}-\d{4}$/, "Invalid date format. Use DD-MM-YYYY"),
  gender: z.string(),
  maritalStatus: z.string(),
  religion: z.string().min(1, "Religion is required"),
  caste: z.string().optional(),
  eduQualification: z.string().min(1, "Education qualification is required"),
  computerLiterate: z.string(),
  motherTongue: z.string().min(1, "Mother tongue is required"),
  bloodGroup: z.string(),
  contactNo: z.string().regex(/^\d{10}$/, "Invalid phone number"),
  whatsappNo: z
    .string()
    .regex(/^\d{10}$/, "Invalid WhatsApp number")
    .optional(),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  village: z.string().min(1),
  pin: z.string().regex(/^\d{6}$/, "Invalid PIN code"),
  postOffice: z.string().min(1, "Post office is required"),
  district: z.string().min(1, "District is required"),
  policeStation: z.string().min(1, "Police station is required"),
  aadhar: z.string().regex(/^\d{12}$/, "Invalid Aadhar number").optional(),
  pan: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number")
    .optional(),
  epic: z.string().optional(),
  profession: z.string().min(1, "Profession is required"),
  annualFamilyIncome: z.string().min(1, "Annual family income is required"),
  mouzaIds: z.array(z.string()).min(1, "At least one village must be assigned"),
  politicalParty: z.string().min(1, "Political party is required"),
  photo: z.union([z.instanceof(File), z.string()]).optional(),
});

export type MemberFormData = z.infer<typeof memberFormSchema>;
