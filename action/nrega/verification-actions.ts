"use server";

import { db } from "@/lib/db";
import type { VerificationStatus } from "@prisma/client";

// ---------------------------------------------------------------------------
// Save / Update Verifications
// ---------------------------------------------------------------------------

export async function saveVerifications(
  workId: string,
  certificateNumber: number,
  verifications: Array<{
    parameterKey: string;
    parameter: string;
    status: string;
    remarks?: string;
  }>
): Promise<{ success: boolean; message: string }> {
  try {
    const now = new Date();

    // Use transaction for atomicity — batch all upserts + audit into one commit
    await db.$transaction(async (tx) => {
      // Pre-fetch all existing verifications in a single query
      const existingRecords = await tx.nregaCertificateVerification.findMany({
        where: { workId, certificateNumber },
      });
      const existingByKey = new Map(
        existingRecords.map((r) => [r.parameterKey, r])
      );

      // Upsert each verification (no more N+1 findFirst per row)
      for (const v of verifications) {
        const existing = existingByKey.get(v.parameterKey);
        const isResolved = v.status !== "PENDING";
        const resolvedDate = isResolved ? now : null;

        if (existing) {
          await tx.nregaCertificateVerification.update({
            where: { id: existing.id },
            data: {
              status: v.status as VerificationStatus,
              remarks: v.remarks ?? existing.remarks ?? undefined,
              verifiedDate: resolvedDate,
            },
          });
        } else {
          await tx.nregaCertificateVerification.create({
            data: {
              workId,
              certificateNumber,
              parameter: v.parameter,
              parameterKey: v.parameterKey,
              status: v.status as VerificationStatus,
              remarks: v.remarks ?? undefined,
              verifiedDate: resolvedDate,
            },
          });
        }
      }

      // Audit log inside the same transaction
      await tx.nregaAuditLog.create({
        data: {
          action: "VERIFICATION_UPDATED",
          workId,
          certificateNumber,
          details: `Verification data updated for Certificate-${certificateNumber}`,
        },
      });
    });

    return { success: true, message: "Verification data saved successfully" };
  } catch (error) {
    console.error("Error saving verifications:", error);
    return { success: false, message: "Failed to save verification data" };
  }
}

// ---------------------------------------------------------------------------
// Fetch Verifications
// ---------------------------------------------------------------------------

export async function fetchVerifications(workId: string, certificateNumber: number) {
  try {
    const verifications = await db.nregaCertificateVerification.findMany({
      where: { workId, certificateNumber },
      orderBy: { createdAt: "asc" },
    });
    return verifications;
  } catch (error) {
    console.error("Error fetching verifications:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Check All Verifications Status
// ---------------------------------------------------------------------------

export async function checkVerificationStatus(workId: string, certificateNumber: number) {
  try {
    const verifications = await db.nregaCertificateVerification.findMany({
      where: { workId, certificateNumber },
    });

    const total = verifications.length;
    const completed = verifications.filter((v) => v.status !== "PENDING").length;
    const pending = total - completed;

    return {
      total,
      completed,
      pending,
      allDone: pending === 0 && total > 0,
    };
  } catch (error) {
    console.error("Error checking verification status:", error);
    return { total: 0, completed: 0, pending: 0, allDone: false };
  }
}
