

import { z } from "zod";

/* -----------------------------
   Pond Lease Schema
--------------------------------*/

export const PondLeaseSchema = z
  .object({
    pondId: z.string().min(1, "Pond is required"),

    leasePartyName: z
      .string()
      .trim()
      .min(1, "Lease party name is required"),

    leasePartyMobile: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Enter valid 10 digit mobile number"),

    leasePartyFatherName: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),

    leasePartyAddressLine1: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),

    leasePartyAddressLine2: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),

    leasePartyCity: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),

    leasePartyPin: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),

    leaseAmountYearly: z
      .number({
        required_error: "Lease amount is required",
      })
      .min(1, "Amount must be greater than 0"),

    leaseStartDate: z.date({
      required_error: "Start date is required",
    }),

    leasePeriod: z.enum(["1", "1.5", "2", "3", "CUSTOM"], {
      required_error: "Lease period is required",
    }),

    leaseEndDate: z.date().optional(),

    remarks: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),

    /* Added for calculation values */

    totalAmount: z.number().optional(),
    leaseYears: z.number().optional(),
    customMonths: z.number().optional(),
    customTotalAmount: z.number().optional(),
  });

export type PondLeaseFormValues = z.infer<typeof PondLeaseSchema>;

/* -----------------------------
   Pond Lease Payment Schema
--------------------------------*/

export const PondLeasePaymentSchema = z.object({
  pondLeaseId: z.string(),

  amountPaid: z
    .number({
      required_error: "Payment amount required",
    })
    .min(1, "Amount must be greater than 0"),

  paymentDate: z.date({
    required_error: "Payment date required",
  }),

  paymentMethod: z.enum([
    "CASH",
    "CHEQUE",
    "ONLINE_TRANSFER",
  ]),

  transactionId: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  remarks: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

export type PondLeasePaymentFormValues =
  z.infer<typeof PondLeasePaymentSchema>;

/* -----------------------------
   Pond Lease Extension Schema
--------------------------------*/

export const PondLeaseExtensionSchema = z.object({
  pondLeaseId: z.string(),

  extensionPeriod: z.enum(["6M", "1", "2", "3"], {
    required_error: "Extension period is required",
  }),

  extensionAmount: z
    .number({
      required_error: "Extension amount is required",
    })
    .min(1, "Amount must be greater than 0"),

  remarks: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  documentUrl: z.string().optional(),
  documentKey: z.string().optional(),
});

export type PondLeaseExtensionFormValues =
  z.infer<typeof PondLeaseExtensionSchema>;

/* -----------------------------
   Public Pond Payment Schema
--------------------------------*/

export const PondPublicPaymentSchema = z.object({
  pondId: z.string().min(1, "Pond is required"),

  amountPaid: z
    .number({
      required_error: "Payment amount required",
    })
    .min(1, "Amount must be greater than 0"),

  paymentDate: z.date({
    required_error: "Payment date required",
  }),

  paymentMethod: z.enum(["CASH", "CHEQUE", "ONLINE_TRANSFER"]),

  financialYear: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  transactionId: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  remarks: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

export type PondPublicPaymentFormValues =
  z.infer<typeof PondPublicPaymentSchema>;

/* -----------------------------
   Pond Lease Status Update Schema
--------------------------------*/

export const PondLeaseStatusUpdateSchema = z.object({
  id: z.string(),
  status: z.enum(["COMPLETED", "CANCELLED"]),
  remarks: z.string().optional().or(z.literal("")),
  documentUrl: z.string().min(1, "Resolution document is required"),
  documentKey: z.string().min(1, "Resolution document key is required"),
});

export type PondLeaseStatusUpdateValues = z.infer<typeof PondLeaseStatusUpdateSchema>;
