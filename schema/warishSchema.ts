import * as z from "zod";

export const warishSchema: z.ZodType<any> = z.lazy(() =>
  z
    .object({
      name: z.string().min(1, "Name is required"),
      gender: z.enum(["male", "female", "other"], {
        errorMap: () => ({ message: "Please select a valid gender" }),
      }),
      relation: z.enum(
        [
          "Son",
          "Daughter",
          "Father",
          "Mother",
          "Brother",
          "Wife",
          "Husband",
          "Sister",
          "Grandfather",
          "Grandmother",
          "Grandson",
          "Granddaughter",
          "Uncle",
          "Aunt",
          "Nephew",
          "Niece",
          "Cousin",
          "Stepfather",
          "Stepmother",
          "Stepson",
          "Stepdaughter",
          "Stepbrother",
          "Stepsister",
          "HalfBrother",
          "HalfSister",
          "FatherInLaw",
          "MotherInLaw",
          "SonInLaw",
          "DaughterInLaw",
          "BrotherInLaw",
          "SisterInLaw",
          "Greatgranddaughter",
          "Greatgrandson",
          "GreatgranddaughterInLaw",
          "Great-Nephew",
          "GranddaughterInLaw",
          "Great-Niece",
        ],
        {
          errorMap: () => ({ message: "Please select a valid relation" }),
        }
      ),
      livingStatus: z.enum(["alive", "dead"], {
        errorMap: () => ({
          message: "Please specify if the person is alive or dead",
        }),
      }),
      maritialStatus: z.enum(["married", "unmarried", "divorced", "widowed"], {
        errorMap: () => ({ message: "Please select a valid marital status" }),
      }),
      husbandName: z.string().optional(),
      children: z.array(z.lazy(() => warishSchema)).optional(),
    })
    .refine(
      (data) => {
        if (data.maritialStatus === "married" && data.gender === "female") {
          return !!data.husbandName && data.husbandName.trim().length > 0;
        }
        return true;
      },
      {
        message: "Spouse name is required for married individuals",
        path: ["husbandName"],
      }
    )
);

export const warishFormSchema = z
  .object({
    reportingDate: z.date({
      required_error: "Reporting date is required",
      invalid_type_error: "Invalid date format for reporting date",
    }),
    applicantName: z.string().min(1, "Applicant name is required"),
    applicantMobileNumber: z
      .string()
      .min(10, "Mobile number must be at least 10 digits")
      .max(15, "Mobile number must not exceed 15 digits")
      .regex(/^\d+$/, "Mobile number must contain only digits"),
    nameOfDeceased: z.string().min(1, "Name of deceased is required"),
    relationwithdeceased: z
      .string()
      .min(1, "Relation with deceased is required"),
    dateOfDeath: z.date({
      required_error: "Date of death is required",
      invalid_type_error: "Invalid date format for date of death",
    }),
    deathcertificate: z
      .instanceof(File)
      .optional()
      .refine((file) => file === undefined || file.size > 0, {
        message: "Uploaded file must not be empty",
      }),

    gender: z.enum(["male", "female", "other"], {
      errorMap: () => ({ message: "Please select a valid gender" }),
    }),
    maritialStatus: z.enum(["married", "unmarried", "divorced", "widowed"], {
      errorMap: () => ({ message: "Please select a valid marital status" }),
    }),
    fatherName: z.string().min(1, "Father's name is required"),
    spouseName: z.string().optional(),
    villageName: z.string().min(1, "Village name is required"),
    postOffice: z.string().min(1, "Post office is required"),
    warishDetails: z
      .array(warishSchema)
      .min(1, "At least one warish detail is required")
      .refine(
        (details) => details.length <= 20,
        "Maximum of 20 warish details allowed"
      ),
  })
  .refine(
    (data) => {
      if (data.maritialStatus === "married") {
        return !!data.spouseName && data.spouseName.trim().length > 0;
      }
      return true;
    },
    {
      message: "Spouse name is required for married individuals",
      path: ["spouseName"],
    }
  );

export type WarishFormValuesType = z.infer<typeof warishFormSchema>;

export type WarishDetailInput = z.infer<typeof warishSchema>;

export const warishFormSchemas = z
  .object({
    reportingDate: z.date({
      required_error: "Reporting date is required",
      invalid_type_error: "Invalid date format for reporting date",
    }),
    applicantName: z.string().min(1, "Applicant name is required"),
    applicantMobileNumber: z
      .string()
      .min(10, "Mobile number must be at least 10 digits")
      .max(15, "Mobile number must not exceed 15 digits")
      .regex(/^\d+$/, "Mobile number must contain only digits"),
    nameOfDeceased: z.string().min(1, "Name of deceased is required"),
    relationwithdeceased: z
      .string()
      .min(1, "Relation with deceased is required"),
    dateOfDeath: z.date({
      required_error: "Date of death is required",
      invalid_type_error: "Invalid date format for date of death",
    }),
    gender: z.enum(["male", "female", "other"], {
      errorMap: () => ({ message: "Please select a valid gender" }),
    }),
    maritialStatus: z.enum(["married", "unmarried", "divorced", "widowed"], {
      errorMap: () => ({ message: "Please select a valid marital status" }),
    }),
    fatherName: z.string().min(1, "Father's name is required"),
    spouseName: z.string().optional(),
    villageName: z.string().min(1, "Village name is required"),
    postOffice: z.string().min(1, "Post office is required"),
  })
  .refine(
    (data) => {
      if (data.maritialStatus === "married") {
        return !!data.spouseName && data.spouseName.trim().length > 0;
      }
      return true;
    },
    {
      message: "Spouse name is required for married individuals",
      path: ["spouseName"],
    }
  );

export type WarishFormValuesTypes = z.infer<typeof warishFormSchemas>;
