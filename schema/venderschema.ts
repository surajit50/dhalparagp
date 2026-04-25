import * as z from "zod";

export const vendorSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  mobileNumber: z.string().min(10, "Invalid mobile number"),
  email: z.string().email("Invalid email address"),
  pan: z.string()
    .min(10, "PAN must be 10 characters")
    .max(10, "PAN must be 10 characters"),
  tin: z.string().optional(),
  gst: z.string().optional(),
  postalAddress: z.string().min(10, "Address must be at least 10 characters"),
  agencyType: z.enum(["FARM", "INDIVIDUAL"]),
  proprietorName: z.string().optional(),
}).superRefine((data, ctx) => {
  // Conditional validation for proprietor name
  if (data.agencyType === "FARM" && !data.proprietorName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Proprietor name is required for farms",
      path: ["proprietorName"]
    });
  }
});

export type VendorSchemaType = z.infer<typeof vendorSchema>;
