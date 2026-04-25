
import { z } from "zod";

export const PondSchema = z.object({
  name: z.string().min(1, "Pond name is required"),
  location: z.string().min(1, "Location is required"),
  area: z.string().optional().or(z.literal("")),
  status: z.enum(["AVAILABLE", "LEASED"]).default("AVAILABLE"),
});

export type PondFormValues = z.infer<typeof PondSchema>;
