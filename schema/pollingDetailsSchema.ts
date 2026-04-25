import * as z from "zod";

// Define the schema
export const pollingDetailsSchema = z.object({
  pollingdetailsno: z.string().min(1, "Field is required"),
  pollingdetailsname: z.string().min(1, "Field is required"),
  malevoter: z.string().min(1, "Field is required"),
  femalevoter: z.string().min(1, "Field is required"),
});

export type PollingDetailsType = z.infer<typeof pollingDetailsSchema>;

{
  /*pollingdetailsno   Int    @unique
pollingdetailsname String
malevoter          Int
femalevoter        Int*/
}
