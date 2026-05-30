import { z } from "zod";

export const budgetEntrySchema = z.object({
  financialYear: z.string().min(1, "Financial Year is required"),
  budgetType: z.enum(["CURRENT_YEAR", "NEXT_YEAR"]),
  fundName: z.string().min(1, "Fund Name is required"),
  receipts: z.number().nonnegative("Receipts must be a non-negative number").default(0),
  arthoOParikalpana: z.number().nonnegative().default(0),
  krishi: z.number().nonnegative().default(0),
  pranisampadBikash: z.number().nonnegative().default(0),
  siksha: z.number().nonnegative().default(0),
  janaswasthya: z.number().nonnegative().default(0),
  nariOSishuUnnoyan: z.number().nonnegative().default(0),
  samajkalyan: z.number().nonnegative().default(0),
  silpa: z.number().nonnegative().default(0),
  parikathamo: z.number().nonnegative().default(0),
});
