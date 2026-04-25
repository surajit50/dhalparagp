import { z } from "zod";

export const WarishVerificationSchema = z.object({
  warishRefNo: z.string().nonempty("Reference number is required"),
  warishRefDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "Invalid date format. Please use YYYY-MM-DD.",
  }),
});
