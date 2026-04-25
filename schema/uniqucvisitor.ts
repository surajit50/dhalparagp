import { z } from "zod";

// Define a Zod schema for the visitor object
export const VisitorSchema = z.object({
  id: z.string(), // Assuming id is a string
  totalVisits: z.number(), // Assuming totalVisits is a number
});

// Optionally, you can create a type alias for the visitor object
export type Visitor = z.infer<typeof VisitorSchema>;
