import { z } from "zod";

/** Coerces strings/numbers to a non-negative float, defaulting to 0. */
const coercedNumber = z.coerce.number().nonnegative().default(0);

export const form36Schema = z.object({
  financialYear: z.string().min(1, "Financial year is required"),
  fundName: z.string().min(1, "Fund name is required"),
  precedingYearActual: coercedNumber,
  currentYearEstimate: coercedNumber,
  nextYearEstimate: coercedNumber,
  remarks: z.string().optional().default(""),
});
