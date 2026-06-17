"use server";

import { db } from "@/lib/db";
import { PaymentMethod } from "@prisma/client";

export async function updateLabourCessPayment(
  ids: string[],
  paymentMethod: PaymentMethod,
  chequeNumber?: string
) {
  try {
    await db.labourWelfareCess.updateMany({
      where: { id: { in: ids } },
      data: {
        paid: true,
        paidAt: new Date(),
        paymentMethod,
        chequeNumber: paymentMethod === "CHEQUE" ? chequeNumber : null,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating Labour Cess payments:", error);
    return { success: false, error: "Failed to update Labour Cess payments" };
  }
}
