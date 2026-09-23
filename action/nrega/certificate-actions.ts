"use server";

import { db } from "@/lib/db";
import type { NregaCertificateStatus } from "@prisma/client";
import { getCertificateApplicabilityStatus } from "@/lib/utils/nrega";
export { getCertificateApplicabilityStatus };


// ---------------------------------------------------------------------------
// Fetch active template count / range info (to avoid hardcoded 1-8 checks)
// ---------------------------------------------------------------------------

export async function fetchCertificateTemplateRange() {
  try {
    const templates = await db.nregaCertificateTemplate.findMany({
      where: { active: true },
      select: { certificateNumber: true },
      orderBy: { certificateNumber: "asc" },
    });
    const nums = templates.map((t) => t.certificateNumber);
    return {
      total: nums.length,
      min: nums.length > 0 ? Math.min(...nums) : 1,
      max: nums.length > 0 ? Math.max(...nums) : 8,
      numbers: nums,
    };
  } catch (error) {
    console.error("Error fetching template range:", error);
    return { total: 8, min: 1, max: 8, numbers: [1, 2, 3, 4, 5, 6, 7, 8] };
  }
}

// ---------------------------------------------------------------------------
// Initialize Certificates for a Work
// ---------------------------------------------------------------------------

export async function initializeCertificates(workId: string) {
  try {
    // Fetch templates
    const templates = await db.nregaCertificateTemplate.findMany({
      where: { active: true },
      orderBy: { certificateNumber: "asc" },
    });

    if (templates.length === 0) {
      return { success: false, message: "No certificate templates found. Please seed templates first." };
    }

    // Check which certificates already exist and get work in parallel
    const [existing, work] = await Promise.all([
      db.nregaCertificate.findMany({
        where: { workId },
        select: { certificateNumber: true },
      }),
      db.nregaWork.findUnique({ where: { id: workId } }),
    ]);

    if (!work) return { success: false, message: "Work not found" };

    const existingNums = new Set(existing.map((c) => c.certificateNumber));
    const toCreate = templates.filter((t) => !existingNums.has(t.certificateNumber));

    if (toCreate.length === 0) {
      return { success: true, message: "All certificates already initialized" };
    }

    // Use a transaction so all-or-nothing creation
    await db.$transaction(async (tx) => {
      for (const template of toCreate) {
        const status = getCertificateApplicabilityStatus(
          template.certificateNumber,
          work
        );

        // Create the certificate record
        await tx.nregaCertificate.create({
          data: {
            workId,
            certificateNumber: template.certificateNumber,
            certificateName: template.certificateName,
            status,
            certificationText: template.certificationText,
            signatureDesignation: template.signatureDesignation,
          },
        });

        // Create verification records from template
        const verificationFields = template.verificationFields as Array<{
          key: string;
          label: string;
          defaultStatus?: string;
        }>;

        if (Array.isArray(verificationFields) && verificationFields.length > 0) {
          await tx.nregaCertificateVerification.createMany({
            data: verificationFields.map((field) => ({
              workId,
              certificateNumber: template.certificateNumber,
              parameter: field.label,
              parameterKey: field.key,
              status: "PENDING",
            })),
          });
        }
      }
    });

    return { success: true, message: `Created ${toCreate.length} certificate(s) successfully` };
  } catch (error) {
    console.error("Error initializing certificates:", error);
    return { success: false, message: "Failed to initialize certificates" };
  }
}

// ---------------------------------------------------------------------------
// Fetch Certificates for a Work
// ---------------------------------------------------------------------------

export async function fetchWorkCertificates(workId: string) {
  try {
    const certificates = await db.nregaCertificate.findMany({
      where: { workId },
      orderBy: { certificateNumber: "asc" },
    });
    return certificates;
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Fetch Single Certificate with Verifications
// ---------------------------------------------------------------------------

export async function fetchCertificateDetail(workId: string, certificateNumber: number) {
  try {
    const [certificate, verifications, work, template] = await Promise.all([
      db.nregaCertificate.findUnique({
        where: { workId_certificateNumber: { workId, certificateNumber } },
      }),
      db.nregaCertificateVerification.findMany({
        where: { workId, certificateNumber },
        orderBy: { createdAt: "asc" },
      }),
      db.nregaWork.findUnique({ where: { id: workId } }),
      db.nregaCertificateTemplate.findFirst({
        where: { certificateNumber, active: true },
      }),
    ]);

    return { certificate, verifications, work, template };
  } catch (error) {
    console.error("Error fetching certificate detail:", error);
    return { certificate: null, verifications: [], work: null, template: null };
  }
}

// ---------------------------------------------------------------------------
// Update Certificate Status
// ---------------------------------------------------------------------------

export async function updateCertificateStatus(
  workId: string,
  certificateNumber: number,
  status: NregaCertificateStatus,
  certificationText?: string,
  signatureDesignation?: string,
  signatureBlock?: string,
) {
  try {
    const now = new Date();
    const updateData: Record<string, unknown> = { status };

    if (certificationText !== undefined) updateData.certificationText = certificationText;
    if (signatureDesignation !== undefined) updateData.signatureDesignation = signatureDesignation;
    if (signatureBlock !== undefined) updateData.signatureBlock = signatureBlock;

    if (status === "COMPLETED") {
      updateData.generatedAt = now;
      updateData.signatureDate = now;
    }
    if (status === "PRINTED") {
      updateData.printedAt = now;
      // Ensure signature date exists when printing
      updateData.signatureDate = now;
    }

    await db.$transaction([
      db.nregaCertificate.update({
        where: { workId_certificateNumber: { workId, certificateNumber } },
        data: updateData,
      }),
      db.nregaAuditLog.create({
        data: {
          action: status === "PRINTED" ? "CERT_PRINTED" : "CERT_GENERATED",
          workId,
          certificateNumber,
          details: `Certificate-${certificateNumber} marked as ${status}`,
        },
      }),
    ]);

    return { success: true, message: `Certificate-${certificateNumber} updated` };
  } catch (error) {
    console.error("Error updating certificate:", error);
    return { success: false, message: "Failed to update certificate" };
  }
}

// ---------------------------------------------------------------------------
// Get Certificate Summary for a Work
// ---------------------------------------------------------------------------

export async function getCertificateSummary(workId: string) {
  try {
    const certificates = await db.nregaCertificate.findMany({
      where: { workId },
      select: {
        certificateNumber: true,
        certificateName: true,
        status: true,
        generatedAt: true,
        printedAt: true,
      },
      orderBy: { certificateNumber: "asc" },
    });
    return certificates;
  } catch (error) {
    console.error("Error fetching certificate summary:", error);
    return [];
  }
}
