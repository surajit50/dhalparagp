"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface MarkMusterCompletedResult {
  success: boolean;
  message: string;
  count?: number;
  error?: string;
}

export async function markMusterRollCompleted(
  musterRollIds: string[]
): Promise<MarkMusterCompletedResult> {
  try {
    // Validate input
    if (!musterRollIds || musterRollIds.length === 0) {
      return {
        success: false,
        message: "No valid muster rolls provided",
        error: "No valid muster rolls provided",
      };
    }

    // Verify all IDs exist
    const existingRolls = await db.musterRoll.findMany({
      where: {
        id: { in: musterRollIds },
      },
      select: { id: true },
    });

    if (existingRolls.length !== musterRollIds.length) {
      return {
        success: false,
        message: "One or more muster rolls not found",
        error: "One or more muster rolls not found",
      };
    }

    // Update Muster Rolls
    await db.musterRoll.updateMany({
      where: {
        id: { in: musterRollIds },
      },
      data: {
        paymentStatus: "COMPLETED",
      },
    });

    // Get the updated Muster Rolls to find their application IDs
    const updatedMusterRolls = await db.musterRoll.findMany({
      where: {
        id: { in: musterRollIds },
      },
      select: {
        applicationId: true,
      },
    });

    const applicationIds = updatedMusterRolls.map((mr) => mr.applicationId);

    // Update the associated applications
    await db.samabyathiApplication.updateMany({
      where: {
        id: { in: applicationIds },
      },
      data: {
        status: "COMPLETED",
      },
    });

    // Clear page cache so the table refreshes
    revalidatePath("/admindashboard/manage-samabyathi/muster-roll", "page");
    revalidatePath("/admindashboard/manage-samabyathi/applications", "page");

    return {
      success: true,
      message: `Successfully marked ${musterRollIds.length} muster roll(s) as completed`,
      count: musterRollIds.length,
    };
  } catch (error) {
    console.error("[v0] MARK COMPLETED ERROR:", error);

    let errorMessage = "Failed to mark muster roll as completed";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: "Internal Server Error",
      error: errorMessage,
    };
  }
}
