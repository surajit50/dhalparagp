"use server";

import { db } from "@/lib/db";
import { nregaMasterDataSchema } from "@/schema/nrega";
import type { z } from "zod";

// ---------------------------------------------------------------------------
// Fetch Master Data by Type
// ---------------------------------------------------------------------------

export async function fetchMasterDataByType(type: string) {
  try {
    const data = await db.nregaMasterData.findMany({
      where: { type, active: true },
      orderBy: { sortOrder: "asc" },
    });
    return data;
  } catch (error) {
    console.error("Error fetching master data:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Fetch All Master Data grouped
// ---------------------------------------------------------------------------

export async function fetchAllMasterData() {
  try {
    const data = await db.nregaMasterData.findMany({
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
    });

    // Group by type
    const grouped: Record<string, typeof data> = {};
    for (const item of data) {
      if (!grouped[item.type]) grouped[item.type] = [];
      grouped[item.type].push(item);
    }

    return grouped;
  } catch (error) {
    console.error("Error fetching all master data:", error);
    return {};
  }
}

// ---------------------------------------------------------------------------
// Create Master Data
// ---------------------------------------------------------------------------

export async function createMasterData(
  data: z.infer<typeof nregaMasterDataSchema>
): Promise<{ success: boolean; message: string }> {
  try {
    const validated = nregaMasterDataSchema.parse(data);
    await db.nregaMasterData.create({ data: validated });
    return { success: true, message: "Master data created successfully" };
  } catch (error) {
    console.error("Error creating master data:", error);
    return { success: false, message: "Failed to create master data" };
  }
}

// ---------------------------------------------------------------------------
// Update Master Data
// ---------------------------------------------------------------------------

export async function updateMasterData(
  id: string,
  data: z.infer<typeof nregaMasterDataSchema>
): Promise<{ success: boolean; message: string }> {
  try {
    const validated = nregaMasterDataSchema.parse(data);
    await db.nregaMasterData.update({ where: { id }, data: validated });
    return { success: true, message: "Master data updated successfully" };
  } catch (error) {
    console.error("Error updating master data:", error);
    return { success: false, message: "Failed to update master data" };
  }
}

// ---------------------------------------------------------------------------
// Delete Master Data
// ---------------------------------------------------------------------------

export async function deleteMasterData(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    await db.nregaMasterData.delete({ where: { id } });
    return { success: true, message: "Master data deleted successfully" };
  } catch (error) {
    console.error("Error deleting master data:", error);
    return { success: false, message: "Failed to delete master data" };
  }
}

// ---------------------------------------------------------------------------
// Fetch Templates
// ---------------------------------------------------------------------------

export async function fetchCertificateTemplates() {
  try {
    return await db.nregaCertificateTemplate.findMany({
      where: { active: true },
      orderBy: { certificateNumber: "asc" },
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Fetch Signature Settings
// ---------------------------------------------------------------------------

export async function fetchSignatureSettings() {
  try {
    return await db.nregaSignatureSetting.findMany({
      orderBy: { designation: "asc" },
    });
  } catch (error) {
    console.error("Error fetching signature settings:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Create / Update Signature Setting
// ---------------------------------------------------------------------------

export async function upsertSignatureSetting(
  data: { designation: string; name?: string; block?: string; isDefault?: boolean },
  id?: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (id) {
      await db.nregaSignatureSetting.update({ where: { id }, data });
    } else {
      // If setting as default, unset other defaults
      if (data.isDefault) {
        await db.nregaSignatureSetting.updateMany({
          data: { isDefault: false },
        });
      }
      await db.nregaSignatureSetting.create({ data });
    }
    return { success: true, message: "Signature setting saved" };
  } catch (error) {
    console.error("Error saving signature setting:", error);
    return { success: false, message: "Failed to save signature setting" };
  }
}
