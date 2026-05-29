"use server";

import { db } from "@/lib/db";
import { ccerSchema } from "@/schema/ccer";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function saveCcerActual(data: z.infer<typeof ccerSchema>) {
  try {
    const validatedData = ccerSchema.parse(data);

    // Upsert based on financialYear and fundName
    await db.ccerActuals.upsert({
      where: {
        financialYear_fundName: {
          financialYear: validatedData.financialYear,
          fundName: validatedData.fundName,
        },
      },
      update: {
        receipts: validatedData.receipts,
        arthoOParikalpana: validatedData.arthoOParikalpana,
        krishi: validatedData.krishi,
        pranisampadBikash: validatedData.pranisampadBikash,
        siksha: validatedData.siksha,
        janaswasthya: validatedData.janaswasthya,
        nariOSishuUnnoyan: validatedData.nariOSishuUnnoyan,
        samajkalyan: validatedData.samajkalyan,
        silpa: validatedData.silpa,
        parikathamo: validatedData.parikathamo,
      },
      create: validatedData,
    });

    revalidatePath("/admindashboard/ccer-entry");
    return { success: true, message: "CCER actuals saved successfully" };
  } catch (error) {
    console.error("Error saving CCER actual:", error);
    return { success: false, message: "Failed to save CCER actuals" };
  }
}

export async function getCcerActuals(financialYear: string) {
  try {
    const actuals = await db.ccerActuals.findMany({
      where: { financialYear },
      orderBy: { createdAt: "asc" },
    });
    return { success: true, data: actuals };
  } catch (error) {
    console.error("Error fetching CCER actuals:", error);
    return { success: false, data: [] };
  }
}

export async function deleteCcerActual(id: string) {
  try {
    await db.ccerActuals.delete({ where: { id } });
    revalidatePath("/admindashboard/ccer-entry");
    return { success: true, message: "Row deleted successfully" };
  } catch (error) {
    console.error("Error deleting CCER actual:", error);
    return { success: false, message: "Failed to delete row" };
  }
}
