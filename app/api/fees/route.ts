import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ServiceType } from "@prisma/client";
import { currentUser } from "@/lib/auth";

// PUT - Update Fee
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, serviceType, feeId } = body;

    // Validation
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 }
      );
    }

    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    if (feeId) {
      await db.serviceFee.update({
        where: { id: feeId },
        data: {
          amount,
          updatedBy: user.id,
        },
      });
    } else {
      await db.serviceFee.create({
        data: {
          serviceType: serviceType as ServiceType,
          amount,
          updatedBy: user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Fee updated successfully",
    });
  } catch (error) {
    console.error("Fee update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update fee" },
      { status: 500 }
    );
  }
}
