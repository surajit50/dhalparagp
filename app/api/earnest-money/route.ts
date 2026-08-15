import {
  EarnestMoneyRegisterEntryStatus,
  PaymentMethod,
} from "@prisma/client";
import { NextResponse } from "next/server";
import { createEarnestMoneyRegisterEntry } from "@/lib/earnest-money";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const emds = await db.earnestMoneyRegister.findMany({
      include: {
        bidderName: {
          include: {
            agencydetails: true,
            workorderdetails: {
              include: {
                awardofcontractdetails: true,
              },
            },
            WorksDetail: {
              include: {
                nitDetails: true,
                ApprovedActionPlanDetails: true,
                biddingAgencies: {
                  include: {
                    agencydetails: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(emds);
  } catch (error) {
    console.error("Error fetching EMD data:", error);
    return NextResponse.json(
      { error: "Failed to fetch EMD data" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const bidderId = String(body.bidderId || "");
    const paymentMethod = body.paymentMethod as PaymentMethod | undefined;
    const registerStatus = body.registerStatus as
      | EarnestMoneyRegisterEntryStatus
      | undefined;
    const amountReceived = Number(body.amountReceived);
    const receiptNumber =
      typeof body.receiptNumber === "string" ? body.receiptNumber.trim() : "";
    const receiptDate = body.receiptDate ? new Date(body.receiptDate) : null;
    const remarks =
      typeof body.remarks === "string" ? body.remarks.trim() : undefined;

    if (!bidderId) {
      return NextResponse.json(
        { error: "Bidder is required." },
        { status: 400 }
      );
    }

    if (!paymentMethod || !Object.values(PaymentMethod).includes(paymentMethod)) {
      return NextResponse.json(
        { error: "A valid earnest money mode is required." },
        { status: 400 }
      );
    }

    if (
      !registerStatus ||
      !Object.values(EarnestMoneyRegisterEntryStatus).includes(registerStatus)
    ) {
      return NextResponse.json(
        { error: "A valid register status is required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amountReceived) || amountReceived <= 0) {
      return NextResponse.json(
        { error: "Amount received must be greater than zero." },
        { status: 400 }
      );
    }

    if (!receiptDate || Number.isNaN(receiptDate.getTime())) {
      return NextResponse.json(
        { error: "Receipt date is required." },
        { status: 400 }
      );
    }

    const entry = await createEarnestMoneyRegisterEntry({
      bidderId,
      paymentMethod,
      registerStatus,
      amountReceived,
      receiptNumber,
      receiptDate,
      remarks,
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Error creating EMD data:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create EMD data",
      },
      { status: 500 }
    );
  }
}
