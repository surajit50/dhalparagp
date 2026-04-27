"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { SAMABYATHI_CONFIG } from "@/constants/samabyathi";

export interface GenerateMusterRollResult {
  success: boolean;
  message: string;
  count?: number;
  totalAmount?: number;
  musterRollNo?: string;
  error?: string;
}

const CHUNK_SIZE = SAMABYATHI_CONFIG.CHUNK_SIZE;
const FETCH_LIMIT = 200; 
const AMOUNT_PER_APP = SAMABYATHI_CONFIG.AMOUNT_PER_APP;

export async function getEligibleApplicationIds(): Promise<string[]> {
  const applications = await db.samabyathiApplication.findMany({
    where: {
      status: "APPROVED",
      musterRolls: { none: {} },
    },
    select: { id: true },
    orderBy: { createdAt: "asc" },
    take: FETCH_LIMIT,
  });
  return applications.map((app) => app.id);
}

export async function generateMusterRollBatch(
  applicationIds: string[],
  musterRollNo: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.$transaction(
      applicationIds.map((id) =>
        db.musterRoll.create({
          data: {
            applicationId: id,
            musterRollNo,
            allottedAmount: AMOUNT_PER_APP,
            paymentStatus: "PENDING",
          },
        })
      )
    );
    return { success: true };
  } catch (error) {
    console.error("Error generating muster roll batch:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function finalizeMusterRollGeneration() {
  revalidatePath("/admindashboard/manage-samabyathi/applications", "page");
  revalidatePath("/admindashboard/manage-samabyathi/muster-roll", "page");
}

export async function generateMusterRoll(): Promise<GenerateMusterRollResult> {
  try {
    // ✅ 1. Fetch eligible applications
    const applications = await db.samabyathiApplication.findMany({
      where: {
        status: "APPROVED",
        musterRolls: { none: {} }, // prevent duplicates
      },
      orderBy: { createdAt: "asc" },
      take: FETCH_LIMIT,
    });

    if (!applications.length) {
      return {
        success: false,
        message: "No eligible applications found",
        error: "No eligible applications found",
      };
    }

    // ✅ 2. Generate Muster Roll Number
    const musterRollNo = `MR-${new Date().getFullYear()}-${Date.now()}`;

    // ✅ 3. Chunked insert (PREVENT P2028)
    for (let i = 0; i < applications.length; i += CHUNK_SIZE) {
      const chunk = applications.slice(i, i + CHUNK_SIZE);

      await db.$transaction(
        chunk.map((app) =>
          db.musterRoll.create({
            data: {
              applicationId: app.id,
              musterRollNo,
              allottedAmount: AMOUNT_PER_APP,
              paymentStatus: "PENDING",
            },
          })
        )
      );
    }

    // ✅ 4. Revalidate UI
    revalidatePath("/admindashboard/manage-samabyathi/applications", "page");
    revalidatePath("/admindashboard/manage-samabyathi/muster-roll", "page");

    return {
      success: true,
      message: "Muster generated successfully",
      count: applications.length,
      totalAmount: applications.length * AMOUNT_PER_APP,
      musterRollNo,
    };
  } catch (error) {
    console.error("[MUSTER ERROR]:", error);

    return {
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
