import { z } from "zod";

export const form36Schema = z.object({
  financialYear: z.string().min(1, "Financial year is required"),
  fundName: z.string().min(1, "Fund name is required"),
  precedingYearActual: z.union([z.number(), z.string()])
    .transform(v => {
      const num = typeof v === 'string' ? parseFloat(v) : v;
      return isNaN(num) ? 0 : num;
    }),
  currentYearEstimate: z.union([z.number(), z.string()])
    .transform(v => {
      const num = typeof v === 'string' ? parseFloat(v) : v;
      return isNaN(num) ? 0 : num;
    }),
  nextYearEstimate: z.union([z.number(), z.string()])
    .transform(v => {
      const num = typeof v === 'string' ? parseFloat(v) : v;
      return isNaN(num) ? 0 : num;
    }),
  remarks: z.string().optional().default(""),
});
