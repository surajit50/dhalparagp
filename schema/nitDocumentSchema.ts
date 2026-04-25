import { z } from "zod";

export const nitDocumentSchema = z.object({
  file: z.instanceof(File).nullable(),
});

export type NITDocumentSchema = z.infer<typeof nitDocumentSchema>;
