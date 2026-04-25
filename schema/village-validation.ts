import * as z from "zod";

export const mouzaSchema = z.object({
  name: z.string().min(1, "Mouza name is required"),
  jlno: z.string().min(1, "J.L. No. is required"),
  totalHouseholds: z.coerce.number().int().nonnegative().optional(),
});

export const sansadSchema = z.object({
  sansadname: z.string().min(1, "Sansad name is required"),
  sansadnumber: z.string().min(1, "Sansad number is required"),
});

export const populationSchema = z.object({
  mouzaId: z.string().min(1, "Mouza selection is required"),
  male: z.coerce.number().int().nonnegative(),
  female: z.coerce.number().int().nonnegative(),
  st: z.coerce.number().int().nonnegative(),
  sc: z.coerce.number().int().nonnegative(),
  obc: z.coerce.number().int().nonnegative(),
  other: z.coerce.number().int().nonnegative(),
  hindu: z.coerce.number().int().nonnegative(),
  muslim: z.coerce.number().int().nonnegative(),
  christian: z.coerce.number().int().nonnegative(),
  otherReligion: z.coerce.number().int().nonnegative(),
});

export const populationSummarySchema = z.object({
  mouzaId: z.string().min(1, "Mouza selection is required"),
  totalMale: z.coerce.number().int().nonnegative(),
  totalFemale: z.coerce.number().int().nonnegative(),
  scMale: z.coerce.number().int().nonnegative(),
  scFemale: z.coerce.number().int().nonnegative(),
  stMale: z.coerce.number().int().nonnegative(),
  stFemale: z.coerce.number().int().nonnegative(),
  obcMale: z.coerce.number().int().nonnegative(),
  obcFemale: z.coerce.number().int().nonnegative(),
  genMale: z.coerce.number().int().nonnegative(),
  genFemale: z.coerce.number().int().nonnegative(),
});

export const voterSummarySchema = z.object({
  pollingStationNo: z.string().min(1, "Polling station number is required"),
  pollingStationName: z.string().min(1, "Polling station name is required"),
  mouzaIds: z.array(z.string()).min(1, "At least one Mouza selection is required"),
  totalMaleVoter: z.coerce.number().int().nonnegative(),
  totalFemaleVoter: z.coerce.number().int().nonnegative(),
  scMaleVoter: z.coerce.number().int().nonnegative(),
  scFemaleVoter: z.coerce.number().int().nonnegative(),
  stMaleVoter: z.coerce.number().int().nonnegative(),
  stFemaleVoter: z.coerce.number().int().nonnegative(),
  obcMaleVoter: z.coerce.number().int().nonnegative(),
  obcFemaleVoter: z.coerce.number().int().nonnegative(),
  genMaleVoter: z.coerce.number().int().nonnegative(),
  genFemaleVoter: z.coerce.number().int().nonnegative(),
});

export const toiletSummarySchema = z.object({
  mouzaId: z.string().min(1, "Mouza selection is required"),
  totalHousehold: z.coerce.number().int().nonnegative(),
  toiletAvailable: z.coerce.number().int().nonnegative(),
  toiletNotAvailable: z.coerce.number().int().nonnegative(),
});

export const waterSummarySchema = z.object({
  mouzaId: z.string().min(1, "Mouza selection is required"),
  tapWater: z.coerce.number().int().nonnegative(),
  handPump: z.coerce.number().int().nonnegative(),
  well: z.coerce.number().int().nonnegative(),
  pond: z.coerce.number().int().nonnegative(),
  other: z.coerce.number().int().nonnegative(),
});

export const educationSummarySchema = z.object({
  mouzaId: z.string().min(1, "Mouza selection is required"),
  ssk: z.coerce.number().int().nonnegative(),
  anganwadi: z.coerce.number().int().nonnegative(),
  primarySchool: z.coerce.number().int().nonnegative(),
  upperPrimary: z.coerce.number().int().nonnegative(),
  highSchool: z.coerce.number().int().nonnegative(),
  higherSecondary: z.coerce.number().int().nonnegative(),
  madrasah: z.coerce.number().int().nonnegative(),
  juniorHigh: z.coerce.number().int().nonnegative(),
  college: z.coerce.number().int().nonnegative(),
  university: z.coerce.number().int().nonnegative(),
  technicalInstitute: z.coerce.number().int().nonnegative(),
  vocationalCenter: z.coerce.number().int().nonnegative(),
  adultEducationCenter: z.coerce.number().int().nonnegative(),
  libraryCount: z.coerce.number().int().nonnegative(),
  computerCenter: z.coerce.number().int().nonnegative(),
});

export const memberSchema = z.object({
  salutation: z.string().min(1, "Salutation is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  religion: z.string().min(1, "Religion is required"),
  aadhar: z.string().length(12, "Aadhar number must be 12 digits"),
  email: z.string().email("Invalid email address"),
  contactNo: z.string().min(10, "Contact number must be at least 10 digits"),
  eduQualification: z.string().min(1, "Education qualification is required"),
  profession: z.string().min(1, "Profession is required"),
  address: z.string().min(1, "Address is required"),
  village: z.string().min(1, "Village is required"),
  pin: z.string().length(6, "PIN code must be 6 digits"),
  mouzaIds: z.array(z.string()).min(1, "At least one Village selection is required"),
  politicalParty: z.string().min(1, "Political Party is required"),
});
