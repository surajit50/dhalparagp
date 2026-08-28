"use server";

import { db } from "@/lib/db";
import type { NregaCertificateStatus } from "@prisma/client";

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

    // Check which certificates already exist
    const existing = await db.nregaCertificate.findMany({
      where: { workId },
      select: { certificateNumber: true },
    });
    const existingNums = new Set(existing.map((c) => c.certificateNumber));

    // Get work for context
    const work = await db.nregaWork.findUnique({ where: { id: workId } });
    if (!work) return { success: false, message: "Work not found" };

    const toCreate = templates.filter((t) => !existingNums.has(t.certificateNumber));

    if (toCreate.length === 0) {
      return { success: true, message: "All certificates already initialized" };
    }

    // Create certificates and verification records
    for (const template of toCreate) {
      // Determine if certificate is applicable
      let status: NregaCertificateStatus = "DRAFT";

      // Certificate 5 (IBS) — not applicable for community works
      if (template.certificateNumber === 5 && work.beneficiaryType === "Community") {
        status = "NOT_APPLICABLE";
      }

      // Certificate 7 (Convergence) — not applicable if no convergence
      if (
        template.certificateNumber === 7 &&
        (!work.convergingDepartment || work.convergingDepartment === "")
      ) {
        status = "NOT_APPLICABLE";
      }

      // Create the certificate record
      await db.nregaCertificate.create({
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
        await db.nregaCertificateVerification.createMany({
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

    return { success: true, message: "Certificates initialized successfully" };
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
    const updateData: Record<string, unknown> = { status };

    if (certificationText !== undefined) updateData.certificationText = certificationText;
    if (signatureDesignation !== undefined) updateData.signatureDesignation = signatureDesignation;
    if (signatureBlock !== undefined) updateData.signatureBlock = signatureBlock;

    if (status === "COMPLETED") {
      updateData.generatedAt = new Date();
    }
    if (status === "PRINTED") {
      updateData.printedAt = new Date();
    }

    await db.nregaCertificate.update({
      where: { workId_certificateNumber: { workId, certificateNumber } },
      data: updateData,
    });

    await db.nregaAuditLog.create({
      data: {
        action: status === "PRINTED" ? "CERT_PRINTED" : "CERT_GENERATED",
        workId,
        certificateNumber,
        details: `Certificate-${certificateNumber} marked as ${status}`,
      },
    });

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
