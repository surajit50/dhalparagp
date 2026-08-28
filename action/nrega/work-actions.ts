"use server";

import { db } from "@/lib/db";
import { nregaWorkSchema } from "@/schema/nrega";
import type { NregaWork, NregaWorkStatus, Prisma } from "@prisma/client";
import type { z } from "zod";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NregaWorkWithCerts extends NregaWork {
  certificates: {
    id: string;
    certificateNumber: number;
    certificateName: string;
    status: string;
  }[];
  _count?: {
    verifications: number;
  };
}

interface FetchNregaWorksResult {
  works: NregaWorkWithCerts[];
  totalCount: number;
  hasMore: boolean;
}

interface WorkStats {
  total: number;
  draft: number;
  approved: number;
  ongoing: number;
  completed: number;
  certificatesGenerated: number;
  certificatesPending: number;
}

// ---------------------------------------------------------------------------
// Generate Work ID
// ---------------------------------------------------------------------------

async function generateWorkId(financialYear: string): Promise<string> {
  const fy = financialYear.replace(/\D/g, "").slice(-4) || "2526";
  const count = await db.nregaWork.count({
    where: { financialYear },
  });
  const serial = String(count + 1).padStart(3, "0");
  return `NREGA-${fy}-${serial}`;
}

// ---------------------------------------------------------------------------
// Create Work
// ---------------------------------------------------------------------------

export async function createNregaWork(
  data: z.infer<typeof nregaWorkSchema>
): Promise<{ success: boolean; message: string; workId?: string }> {
  try {
    const validated = nregaWorkSchema.parse(data);
    const workId = await generateWorkId(validated.financialYear);

    // Clean date fields
    const cleanData = {
      ...validated,
      workId,
      gramSabhaApprovalDate: validated.gramSabhaApprovalDate || undefined,
      adminApprovalDate: validated.adminApprovalDate || undefined,
      technicalSanctionDate: validated.technicalSanctionDate || undefined,
      dprDate: validated.dprDate || undefined,
      nocDate: validated.nocDate || undefined,
    };

    const work = await db.nregaWork.create({
      data: cleanData,
    });

    // Create audit log
    await db.nregaAuditLog.create({
      data: {
        action: "WORK_CREATED",
        workId: work.id,
        details: `Work ${workId} - ${validated.workName} created`,
      },
    });

    return { success: true, message: "Work created successfully", workId: work.id };
  } catch (error) {
    console.error("Error creating NREGA work:", error);
    return { success: false, message: "Failed to create work" };
  }
}

// ---------------------------------------------------------------------------
// Update Work
// ---------------------------------------------------------------------------

export async function updateNregaWork(
  id: string,
  data: z.infer<typeof nregaWorkSchema>
): Promise<{ success: boolean; message: string }> {
  try {
    const validated = nregaWorkSchema.parse(data);

    const cleanData = {
      ...validated,
      gramSabhaApprovalDate: validated.gramSabhaApprovalDate || undefined,
      adminApprovalDate: validated.adminApprovalDate || undefined,
      technicalSanctionDate: validated.technicalSanctionDate || undefined,
      dprDate: validated.dprDate || undefined,
      nocDate: validated.nocDate || undefined,
    };

    await db.nregaWork.update({
      where: { id },
      data: cleanData,
    });

    await db.nregaAuditLog.create({
      data: {
        action: "WORK_EDITED",
        workId: id,
        details: `Work updated: ${validated.workName}`,
      },
    });

    return { success: true, message: "Work updated successfully" };
  } catch (error) {
    console.error("Error updating NREGA work:", error);
    return { success: false, message: "Failed to update work" };
  }
}

// ---------------------------------------------------------------------------
// Delete Work
// ---------------------------------------------------------------------------

export async function deleteNregaWork(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    await db.nregaWork.delete({ where: { id } });
    return { success: true, message: "Work deleted successfully" };
  } catch (error) {
    console.error("Error deleting NREGA work:", error);
    return { success: false, message: "Failed to delete work" };
  }
}

// ---------------------------------------------------------------------------
// Fetch Works (paginated, with search/filter)
// ---------------------------------------------------------------------------

export async function fetchNregaWorks(
  page = 1,
  pageSize = 20,
  searchTerm = "",
  financialYear = "",
  workStatus = "",
  gramSansad = "",
): Promise<FetchNregaWorksResult> {
  try {
    const skip = (page - 1) * pageSize;

    const whereConditions: Prisma.NregaWorkWhereInput[] = [];

    if (searchTerm) {
      whereConditions.push({
        OR: [
          { workName: { contains: searchTerm, mode: "insensitive" } },
          { workId: { contains: searchTerm, mode: "insensitive" } },
          { gramPanchayat: { contains: searchTerm, mode: "insensitive" } },
          { masterCategory: { contains: searchTerm, mode: "insensitive" } },
        ],
      });
    }

    if (financialYear && financialYear !== "all") {
      whereConditions.push({ financialYear });
    }

    if (workStatus && workStatus !== "all") {
      whereConditions.push({ workStatus: workStatus as NregaWorkStatus });
    }

    if (gramSansad && gramSansad !== "all") {
      whereConditions.push({ gramSansadName: gramSansad });
    }

    const where: Prisma.NregaWorkWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    const [works, totalCount] = await Promise.all([
      db.nregaWork.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: pageSize,
        include: {
          certificates: {
            select: {
              id: true,
              certificateNumber: true,
              certificateName: true,
              status: true,
            },
          },
          _count: {
            select: { verifications: true },
          },
        },
      }),
      db.nregaWork.count({ where }),
    ]);

    return {
      works: works as NregaWorkWithCerts[],
      totalCount,
      hasMore: totalCount > skip + works.length,
    };
  } catch (error) {
    console.error("Error fetching NREGA works:", error);
    throw new Error("Failed to fetch works");
  }
}

// ---------------------------------------------------------------------------
// Fetch Single Work
// ---------------------------------------------------------------------------

export async function fetchNregaWorkById(id: string) {
  try {
    const work = await db.nregaWork.findUnique({
      where: { id },
      include: {
        certificates: true,
        verifications: true,
      },
    });
    return work;
  } catch (error) {
    console.error("Error fetching NREGA work:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Get Dashboard Stats
// ---------------------------------------------------------------------------

export async function getNregaDashboardStats(): Promise<WorkStats> {
  try {
    const [total, draft, approved, ongoing, completed] = await Promise.all([
      db.nregaWork.count(),
      db.nregaWork.count({ where: { workStatus: "DRAFT" } }),
      db.nregaWork.count({ where: { workStatus: "APPROVED" } }),
      db.nregaWork.count({ where: { workStatus: "ONGOING" } }),
      db.nregaWork.count({ where: { workStatus: "COMPLETED" } }),
    ]);

    const [certificatesGenerated, totalCertsExpected] = await Promise.all([
      db.nregaCertificate.count({
        where: { status: { in: ["COMPLETED", "PRINTED"] } },
      }),
      db.nregaCertificate.count(),
    ]);

    return {
      total,
      draft,
      approved,
      ongoing,
      completed,
      certificatesGenerated,
      certificatesPending: totalCertsExpected - certificatesGenerated,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      total: 0,
      draft: 0,
      approved: 0,
      ongoing: 0,
      completed: 0,
      certificatesGenerated: 0,
      certificatesPending: 0,
    };
  }
}

// ---------------------------------------------------------------------------
// Duplicate Work
// ---------------------------------------------------------------------------

export async function duplicateNregaWork(
  id: string
): Promise<{ success: boolean; message: string; newWorkId?: string }> {
  try {
    const original = await db.nregaWork.findUnique({ where: { id } });
    if (!original) return { success: false, message: "Work not found" };

    const newWorkId = await generateWorkId(original.financialYear);

    const {
      id: _id,
      workId: _workId,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...workData
    } = original;

    const newWork = await db.nregaWork.create({
      data: {
        ...workData,
        workId: newWorkId,
        workStatus: "DRAFT",
        remarks: `Duplicated from ${original.workId}`,
      },
    });

    await db.nregaAuditLog.create({
      data: {
        action: "WORK_DUPLICATED",
        workId: newWork.id,
        details: `Duplicated from ${original.workId}`,
      },
    });

    return {
      success: true,
      message: "Work duplicated successfully",
      newWorkId: newWork.id,
    };
  } catch (error) {
    console.error("Error duplicating NREGA work:", error);
    return { success: false, message: "Failed to duplicate work" };
  }
}

// ---------------------------------------------------------------------------
// Fetch Financial Years
// ---------------------------------------------------------------------------

export async function fetchNregaFinancialYears(): Promise<string[]> {
  try {
    const result = await db.nregaWork.findMany({
      select: { financialYear: true },
      distinct: ["financialYear"],
      orderBy: { financialYear: "desc" },
    });
    return result.map((r) => r.financialYear);
  } catch (error) {
    console.error("Error fetching financial years:", error);
    return [];
  }
}
