import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import {
  EarnestMoneyRegisterEntryStatus,
  EarnestMoneyStatus,
  PaymentMethod,
} from "@prisma/client";

function mapRegisterStatusToLegacy(
  status: EarnestMoneyRegisterEntryStatus
): EarnestMoneyStatus {
  switch (status) {
    case "RECEIVED":
      return "paid";
    case "REFUNDED":
      return "refunded";
    case "FORFEITED":
      return "forfeited";
    case "HELD":
    case "REFUND_DUE":
    case "ADJUSTED":
    default:
      return "pending";
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      // New-style fields (from UpdateStatusDialog)
      registerStatus,
      paymentMethod,
      amountReceived,
      receiptNumber,
      receiptDate,
      remarks,
      // Legacy fields (from old inline dialogs, kept for backward compat)
      paymentstatus,
      paymentDate,
      chequeNumber,
      chequeDate,
    } = body;

    // Build update data
    const updateData: any = {};

    if (
      registerStatus &&
      Object.values(EarnestMoneyRegisterEntryStatus).includes(registerStatus)
    ) {
      updateData.registerStatus = registerStatus;
      updateData.paymentstatus = mapRegisterStatusToLegacy(registerStatus);
    } else if (
      paymentstatus &&
      ["pending", "paid", "refunded", "forfeited"].includes(paymentstatus)
    ) {
      // Legacy path
      updateData.paymentstatus = paymentstatus;
    }

    if (
      paymentMethod &&
      Object.values(PaymentMethod).includes(paymentMethod as PaymentMethod)
    ) {
      updateData.paymentMethod = paymentMethod;
    }

    if (typeof amountReceived === "number") {
      updateData.amountReceived = amountReceived;
    }

    if (receiptNumber !== undefined) {
      updateData.receiptNumber = receiptNumber;
    }

    if (receiptDate !== undefined) {
      updateData.receiptDate = receiptDate ? new Date(receiptDate) : null;
      // Also keep paymentDate in sync
      updateData.paymentDate = receiptDate ? new Date(receiptDate) : null;
    } else if (paymentDate !== undefined) {
      updateData.paymentDate = paymentDate ? new Date(paymentDate) : null;
    }

    if (remarks !== undefined) {
      updateData.remarks = remarks;
    }

    // Legacy cheque fields
    if (chequeNumber !== undefined) {
      updateData.chequeNumber = chequeNumber;
    }
    if (chequeDate !== undefined) {
      updateData.chequeDate = chequeDate ? new Date(chequeDate) : null;
    }

    const updatedEmd = await db.earnestMoneyRegister.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedEmd);
  } catch (error) {
    console.error("[EMD_PAYMENT_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
