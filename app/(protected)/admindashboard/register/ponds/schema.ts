
import { z } from "zod";

export const PondSchema = z
  .object({
    name: z.string().min(1, "Pond name is required"),
    jlNo: z.string().trim().optional().or(z.literal("")),
    plotNo: z.string().trim().optional().or(z.literal("")),
    mouzaName: z.string().trim().min(1, "Mouza Name is required"),
    area: z.string().optional().or(z.literal("")),
    pondType: z.enum(["LEASEABLE", "PUBLIC"]).default("LEASEABLE"),
    publicYearlyAmount: z.coerce.number().optional(),
    resolutionNo: z.string().trim().optional().or(z.literal("")),
    resolutionDate: z.date().optional().nullable(),
    status: z
      .enum(["AVAILABLE", "LEASED", "PUBLIC_USE"])
      .default("AVAILABLE"),
  })
  .superRefine((data, ctx) => {
    if (data.pondType === "PUBLIC") {
      if (!data.publicYearlyAmount || data.publicYearlyAmount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["publicYearlyAmount"],
          message: "Yearly amount as per resolution is required",
        });
      }

      if (!data.resolutionNo?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["resolutionNo"],
          message: "GP resolution number is required",
        });
      }
    }
  });

export type PondFormValues = z.infer<typeof PondSchema>;
