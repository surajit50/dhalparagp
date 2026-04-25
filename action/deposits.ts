"use server";

import { db } from "@/lib/db";

import { z } from "zod";

// Updated Zod validation schema
const formSchema = z.object({
  paymentMethod: z.enum(["CHEQUE", "ONLINE_TRANSFER", "CASH"], {
    required_error: "Please select a payment method",
  }),
  chequeNumber: z.string().optional(),
  chequeDate: z.coerce.date().optional(), // Changed to coerce date
  transactionId: z.string().optional(), // Added missing field
  paymentDate: z.coerce.date({ // Changed to coerce date
    required_error: "Payment date is required",
  }),
})
.refine(data => 
  data.paymentMethod !== "CHEQUE" || 
  (data.chequeNumber && data.chequeDate), 
  {
    message: "Cheque number and date are required for CHEQUE payments",
    path: ["chequeNumber"] // Points to first related field
  }
)
.refine(data => 
  data.paymentMethod !== "ONLINE_TRANSFER" || 
  data.transactionId, 
  {
    message: "Transaction ID is required for ONLINE_TRANSFER",
    path: ["transactionId"]
  }
);

type FormValues = z.infer<typeof formSchema>;

interface UpdateDepositParams extends FormValues {
  depositId: string;
}

export async function updateDepositStatus(params: UpdateDepositParams) {
  try {
    // Validate deposit ID separately
    if (!params.depositId || typeof params.depositId !== "string") {
      throw new Error("Invalid deposit ID");
    }

    // Validate and transform input data
    const validatedData = formSchema.parse({
      paymentMethod: params.paymentMethod,
      chequeNumber: params.chequeNumber,
      chequeDate: params.chequeDate,
      transactionId: params.transactionId, // Added missing field
      paymentDate: params.paymentDate,
    });

    // Prepare update data
    const updateData = {
      paymentstatus: "paid" as const,
      paymentDate: validatedData.paymentDate,
      paymentMethod: validatedData.paymentMethod,
      chequeNumber: validatedData.paymentMethod === "CHEQUE" 
        ? validatedData.chequeNumber 
        : undefined,
      chequeDate: validatedData.paymentMethod === "CHEQUE" 
        ? validatedData.chequeDate 
        : undefined,
      transactionID: validatedData.paymentMethod === "ONLINE_TRANSFER" 
        ? validatedData.transactionId 
        : undefined,
    };

    // Update the deposit
    await db.secrutityDeposit.update({
      where: { id: params.depositId },
      data: updateData,
    });

    return { success: true, message: "Deposit status updated successfully" };
  } catch (error) {
    console.error("Error updating deposit status:", error);
    
    return {
      success: false,
      message:
        error instanceof z.ZodError
          ? error.errors.map(e => e.message).join(", ")
          : error instanceof Error
          ? error.message
          : "Failed to update deposit status",
    };
  }
}
