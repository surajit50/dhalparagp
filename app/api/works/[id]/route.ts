import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { workStatus, finalEstimateAmount, participationFee } = body;

    if (
      workStatus === undefined &&
      finalEstimateAmount === undefined &&
      participationFee === undefined
    ) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Build update data object
    const updateData: any = {};
    if (workStatus !== undefined) updateData.workStatus = workStatus;
    if (finalEstimateAmount !== undefined) updateData.finalEstimateAmount = finalEstimateAmount;
    if (participationFee !== undefined) updateData.participationFee = participationFee;

    const updatedWork = await db.worksDetail.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admindashboard/manage-tender/add");

    return NextResponse.json({
      success: true,
      data: updatedWork,
    });
  } catch (error) {
    console.error("Work update error:", error);
    return NextResponse.json(
      { error: "Failed to update work" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const { id } = await params;
    const deletedWork = await db.worksDetail.delete({
      where: { id },
    });

    revalidatePath("/admindashboard/manage-tender/add");

    return NextResponse.json({
      success: true,
      data: deletedWork,
    });
  } catch (error) {
    console.error("Work delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete work" },
      { status: 500 }
    );
  }
} 