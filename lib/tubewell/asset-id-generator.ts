// lib/tubewell/asset-id-generator.ts
/**
 * Generate unique asset ID for tube wells
 * Format: GP-TW-YYYY-XXXX (e.g., GP-TW-2026-0001)
 */

import { prisma } from '@/lib/prisma';

export async function generateTubeWellAssetId(): Promise<string> {
  const year = new Date().getFullYear();
  
  // Get the last tube well created this year
  const lastTubeWell = await prisma.tubeWell.findMany({
    where: {
      assetId: {
        startsWith: `GP-TW-${year}`,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 1,
  });

  let nextNumber = 1;
  
  if (lastTubeWell.length > 0) {
    const lastAssetId = lastTubeWell[0].assetId;
    const matches = lastAssetId.match(/GP-TW-\d{4}-(\d{4})/);
    if (matches) {
      nextNumber = parseInt(matches[1]) + 1;
    }
  }

  const paddedNumber = String(nextNumber).padStart(4, '0');
  return `GP-TW-${year}-${paddedNumber}`;
}

/**
 * Generate Complaint ID
 * Format: CMP-TW-YYYY-XXXX
 */
export async function generateComplaintId(): Promise<string> {
  const year = new Date().getFullYear();
  
  const lastComplaint = await prisma.tubeWellComplaint.findMany({
    where: {
      complaintId: {
        startsWith: `CMP-TW-${year}`,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 1,
  });

  let nextNumber = 1;
  
  if (lastComplaint.length > 0) {
    const lastComplaintId = lastComplaint[0].complaintId;
    const matches = lastComplaintId.match(/CMP-TW-\d{4}-(\d{4})/);
    if (matches) {
      nextNumber = parseInt(matches[1]) + 1;
    }
  }

  const paddedNumber = String(nextNumber).padStart(4, '0');
  return `CMP-TW-${year}-${paddedNumber}`;
}

/**
 * Generate Repair ID
 * Format: REP-TW-YYYY-XXXX
 */
export async function generateRepairId(): Promise<string> {
  const year = new Date().getFullYear();
  
  const lastRepair = await prisma.tubeWellRepair.findMany({
    where: {
      repairId: {
        startsWith: `REP-TW-${year}`,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 1,
  });

  let nextNumber = 1;
  
  if (lastRepair.length > 0) {
    const lastRepairId = lastRepair[0].repairId;
    const matches = lastRepairId.match(/REP-TW-\d{4}-(\d{4})/);
    if (matches) {
      nextNumber = parseInt(matches[1]) + 1;
    }
  }

  const paddedNumber = String(nextNumber).padStart(4, '0');
  return `REP-TW-${year}-${paddedNumber}`;
}
