"use server";

import { z } from "zod";

const VerificationSchema = z.object({
  docType: z.enum(["warish", "residential", "income"]),
  docNumber: z.string().min(1),
  issueDate: z.string().min(1),
});

export type VerificationResult = {
  success: boolean;
  message: string;
};

export async function verifyDocument(
  prevState: VerificationResult | null,
  formData: FormData
): Promise<VerificationResult> {
  const validatedFields = VerificationSchema.safeParse({
    docType: formData.get("docType"),
    docNumber: formData.get("docNumber"),
    issueDate: formData.get("issueDate"),
  });

  if (!validatedFields.success) {
    return { success: false, message: "Invalid form data" };
  }

  // Simulate server-side verification process
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const isValid = Math.random() > 0.5;

  if (isValid) {
    return {
      success: true,
      message:
        "The document is authentic and was issued by Dhalpara Gram Panchayat.",
    };
  } else {
    return {
      success: false,
      message:
        "We couldn't verify the authenticity of this document. Please check the details and try again.",
    };
  }
}
