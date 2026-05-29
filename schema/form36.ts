import { z } from "zod";

export const form36Schema = z.object({
  financialYear: z.string().min(1, "Financial Year is required"),
  fundName: z.string().min(1, "Fund Name is required"),
  precedingYearActual: z.number().nonnegative("Must be a non-negative number").default(0),
  currentYearEstimate: z.number().nonnegative("Must be a non-negative number").default(0),
  nextYearEstimate: z.number().nonnegative("Must be a non-negative number").default(0),
  remarks: z.string().optional().nullable(),
});
