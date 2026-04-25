import { z } from "zod";

export const approvedSchema = z
  .object({
    status: z.enum(["approved", "rejected"], {
      required_error: "You need to select a status.",
    }),
    memonumber: z.string().optional(),
    memodate: z.date().optional(),
    remarks: z.string().min(3, {
      message: "Remarks must be at least 3 characters.",
    }),
  })
  .refine(
    (data) => {
      if (data.status === "approved") {
        // Ensure memonumber and memodate are both provided
        return data.memonumber !== undefined && data.memodate !== undefined;
      }
      return true;
    },
    {
      message: "Memo number and date are required when status is approved",
      path: ["memonumber", "memodate"],
    }
  );

export type ApprovedSchemaType = z.infer<typeof approvedSchema>;
