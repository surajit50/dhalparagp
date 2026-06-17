"use server";

import { db } from "@/lib/db";
import { PaymentMethod } from "@prisma/client";

export async function updateGstPayment(
  cgstIds: string[],
  paymentMethod: PaymentMethod,
  chequeNumber?: string
) {
  try {
    // 1. Update the TdsCgst records
    await db.tdsCgst.updateMany({
      where: { id: { in: cgstIds } },
      data: {
        paid: true,
        paidAt: new Date(),
        paymentMethod,
        chequeNumber: paymentMethod === "CHEQUE" ? chequeNumber : null,
      },
    });

    // 2. Find the corresponding TdsSgst IDs via PaymentDetails
    const paymentDetails = await db.paymentDetails.findMany({
      where: { tdsCgstId: { in: cgstIds } },
      select: { tdsSgstId: true },
    });
    const sgstIds = paymentDetails.map((pd) => pd.tdsSgstId).filter(Boolean);

    // 3. Update the TdsSgst records
    if (sgstIds.length > 0) {
      await db.tdsSgst.updateMany({
        where: { id: { in: sgstIds } },
        data: {
          paid: true,
          paidAt: new Date(),
          paymentMethod,
          chequeNumber: paymentMethod === "CHEQUE" ? chequeNumber : null,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating GST payments:", error);
    return { success: false, error: "Failed to update GST payments" };
  }
}
