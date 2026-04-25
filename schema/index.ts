import { UserRole, Designation } from "@prisma/client";
import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
  code: z.optional(z.string()),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
});

export const NewPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(32, { message: "Password must be less than 32 characters" })
      .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Must contain at least one special character",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Minimum 6 characters is required",
  }),
  newpassword: z.string().min(6, {
    message: "Minimum 6 characters is required",
  }),
});

export const RegisterSchema = z
  .object({
    email: z.string().email({
      message: "Please enter a valid email address",
    }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(32, { message: "Password must be less than 32 characters" })
      .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Must contain at least one special character",
      }),
    confirmPassword: z.string(),
    mobileNumber: z.string().regex(/^[0-9]{10}$/, {
      message: "Mobile number must be a valid 10 digit number",
    }),
    name: z.string().min(1, {
      message: "Name is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const CreateUserSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  name: z.string().min(1, {
    message: "Name is required",
  }),
  role: z.enum([UserRole.admin, UserRole.user, UserRole.staff, UserRole.superadmin, UserRole.agency]),
  mobileNumber: z.string().regex(/^[0-9]{10}$/, {
    message: "Mobile number must be a valid 10 digit number",
  }),
  designation: z.optional(z.nativeEnum(Designation)),
  agencyDetailsId: z.optional(z.string()),
}).refine((data) => {
  if (data.role === "staff" && !data.designation) {
    return false;
  }
  return true;
}, {
  message: "Designation is required for staff members",
  path: ["designation"],
});

export const SettingsSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum([UserRole.admin, UserRole.user, UserRole.staff]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }

      return true;
    },
    {
      message: "New Password is required",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false;
      }

      return true;
    },
    {
      message: "Password is required",
      path: ["password"],
    }
  );

export const heroImageSchema = z.object({
  heroImageDescription: z.string().min(3),
});

export const userProfileUpdateSchema = z.object({
  email: z
    .string()
    .email({
      message: "Email is required",
    })
    .optional(),
  name: z
    .string()
    .min(1, {
      message: "Name is required",
    })
    .optional(),
});

export const SearchSchema = z.object({
  search: z
    .string()
    .trim()
    .min(1, "Search term cannot be empty")
    .max(100, "Search term is too long"),
});

export const NitBookValidationSchema = z
  .object({
    tendermemonumber: z
      .string()
      .nonempty("Tender Reference Number is required"),
    tendermemodate: z.coerce.date({
      required_error: "Memo date is required",
      invalid_type_error: "Invalid date format",
    }),
    tender_pulishing_Date: z.coerce.date({
      required_error: "Publishing date is required",
      invalid_type_error: "Invalid date format",
    }),
    tender_document_Download_from: z.coerce.date({
      required_error: "Document download date is required",
      invalid_type_error: "Invalid date format",
    }),
    tender_start_time_from: z.coerce.date({
      required_error: "Start time is required",
      invalid_type_error: "Invalid date format",
    }),
    tender_end_date_time_from: z.coerce.date({
      required_error: "End date/time is required",
      invalid_type_error: "Invalid date format",
    }),
    tender_techinical_bid_opening_date: z.coerce.date({
      required_error: "Technical bid opening date is required",
      invalid_type_error: "Invalid date format",
    }),
    tender_financial_bid_opening_date: z.coerce
      .date({
        required_error: "Financial bid opening date is required",
        invalid_type_error: "Invalid date format",
      })
      .optional(),
    tender_place_opening_bids: z
      .string()
      .nonempty("Place for Opening Bids is required")
      .min(3, "Place name must be at least 3 characters"),
    tender_vilidity_bids: z
      .string()
      .nonempty("Validity of Bids is required")
      .regex(/^\d+$/, "Validity must be a number"),
    supplynit: z.boolean().default(false),
    supplyitemname: z.string().optional(),
    nitCount: z
      .string()
      .nonempty("Call count is required")
      .regex(
        /^\d+(st|nd|rd|th) call$/,
        "Call count must be in the format '1st call', '2nd call', etc."
      ),
    percentageofworkvaluerequired: z.number().min(1).max(100).default(60),
    termsTemplateIds: z
      .array(z.string().min(1))
      .optional()
      .transform((value) => {
        if (!value) return [];
        const unique = Array.from(new Set(value.map((item) => item.trim()).filter(Boolean)));
        return unique;
      }),
  })
  .refine(
    (data) => {
      if (data.supplynit && !data.supplyitemname) {
        return false;
      }
      return true;
    },
    {
      message: "Supply item name is required when supply is true",
      path: ["supplyitemname"],
    }
  )
  .refine(
    (data) => {
      return data.tender_document_Download_from >= data.tender_pulishing_Date;
    },
    {
      message: "Document download date must be after publishing date",
      path: ["tender_document_Download_from"],
    }
  )
  .refine(
    (data) => {
      return data.tender_end_date_time_from > data.tender_start_time_from;
    },
    {
      message: "End date/time must be after start date/time",
      path: ["tender_end_date_time_from"],
    }
  );

export const NoticeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  department: z.string().min(1, "Department is required"),
  type: z.enum(["Tender", "Notice", "Circular", "Agency", "Other"]),
  reference: z.string().min(1, "Reference number is required"),
  agencyId: z.string().optional(),
  files: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        type: z.string(),
        cloudinaryId: z.string(),
      }),
    )
    .optional()
    .default([]),
})

export type NoticeSchemaType = z.infer<typeof NoticeSchema>


