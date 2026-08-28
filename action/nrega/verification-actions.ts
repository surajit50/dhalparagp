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
    for (const v of verifications) {
      const existing = await db.nregaCertificateVerification.findFirst({
        where: {
          workId,
          certificateNumber,
          parameterKey: v.parameterKey,
        },
      });

      if (existing) {
        await db.nregaCertificateVerification.update({
          where: { id: existing.id },
          data: {
            status: v.status as VerificationStatus,
            remarks: v.remarks || existing.remarks,
            verifiedDate: v.status !== "PENDING" ? new Date() : null,
          },
        });
      } else {
        await db.nregaCertificateVerification.create({
          data: {
            workId,
            certificateNumber,
            parameter: v.parameter,
            parameterKey: v.parameterKey,
            status: v.status as VerificationStatus,
            remarks: v.remarks,
            verifiedDate: v.status !== "PENDING" ? new Date() : null,
          },
        });
      }
    }

    // Check if all verifications are complete (not PENDING)
    const allVerifications = await db.nregaCertificateVerification.findMany({
      where: { workId, certificateNumber },
    });

    const allDone = allVerifications.every((v) => v.status !== "PENDING");

    // If all verifications complete, auto-update cert status to COMPLETED
    if (allDone && allVerifications.length > 0) {
      await db.nregaCertificate.update({
        where: { workId_certificateNumber: { workId, certificateNumber } },
        data: { status: "COMPLETED", generatedAt: new Date() },
      });
    }

    await db.nregaAuditLog.create({
      data: {
        action: "VERIFICATION_UPDATED",
        workId,
        certificateNumber,
        details: `Verification data updated for Certificate-${certificateNumber}`,
      },
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
