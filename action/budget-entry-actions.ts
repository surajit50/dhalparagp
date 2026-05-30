"use server";

import { db } from "@/lib/db";
import { budgetEntrySchema } from "@/schema/budget-entry";
import { normalizeFundName, SECTOR_KEYS, SectorKey } from "@/types/budget-row";
import { UpasamitiName } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SectorTotals = Record<SectorKey, number> & { receipts: number };

export type ActionPlanTotals = Record<string, SectorTotals>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function revalidateBudgetPaths() {
  revalidatePath("/admindashboard/reports/budget-entry");
  revalidatePath("/admindashboard/reports");
}

const EMPTY_SECTOR_TOTALS = (): SectorTotals => ({
  receipts: 0,
  arthoOParikalpana: 0,
  krishi: 0,
  pranisampadBikash: 0,
  siksha: 0,
  janaswasthya: 0,
  nariOSishuUnnoyan: 0,
  samajkalyan: 0,
  silpa: 0,
  parikathamo: 0,
});

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function saveBudgetEntry(
  data: z.infer<typeof budgetEntrySchema>
) {
  try {
    const validatedData = budgetEntrySchema.parse(data);

    await db.budgetEntry.upsert({
      where: {
        financialYear_budgetType_fundName: {
          financialYear: validatedData.financialYear,
          budgetType: validatedData.budgetType,
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

    revalidateBudgetPaths();
    return { success: true, message: "Budget entry saved successfully" };
  } catch (error) {
    console.error("Error saving budget entry:", error);
    return { success: false, message: "Failed to save budget entry" };
  }
}

export async function getBudgetEntries(
  financialYear: string,
  budgetType: "CURRENT_YEAR" | "NEXT_YEAR"
) {
  try {
    const entries = await db.budgetEntry.findMany({
      where: { financialYear, budgetType },
      orderBy: { createdAt: "asc" },
    });

    const actionPlanTotals: ActionPlanTotals = {};

    if (budgetType === "NEXT_YEAR") {
      const startYear = parseInt(financialYear.split("-")[0]);
      const nextYear1 = `${startYear + 1}-${startYear + 2}`;
      const nextYear2 = `${startYear + 1}-${(startYear + 2).toString().slice(2)}`;

      const plans = await db.approvedActionPlanDetails.findMany({
        where: { financialYear: { in: [nextYear1, nextYear2] } },
      });

      for (const plan of plans) {
        const fundName = normalizeFundName(plan.schemeName);

        if (!actionPlanTotals[fundName]) {
          actionPlanTotals[fundName] = EMPTY_SECTOR_TOTALS();
        }

        const cost = plan.estimatedCost ?? 0;
        const totals = actionPlanTotals[fundName];

        switch (plan.upasamiti) {
          case UpasamitiName.Janasastha:
            totals.janaswasthya += cost;
            break;
          case UpasamitiName.Nari_O_Sishu:
            totals.nariOSishuUnnoyan += cost;
            break;
          case UpasamitiName.Samajkalyan:
            totals.samajkalyan += cost;
            break;
          case UpasamitiName.Krishi:
            totals.krishi += cost;
            break;
          case UpasamitiName.Pranisampad_Bikash:
            totals.pranisampadBikash += cost;
            break;
          case UpasamitiName.Silpa:
            totals.silpa += cost;
            break;
          case UpasamitiName.Parikathama:
            totals.parikathamo += cost;
            break;
          default:
            // Artho O Parikalpana (Finance & Planning) as fallback
            totals.arthoOParikalpana += cost;
        }
      }
    }

    return { success: true, data: entries, actionPlanTotals };
  } catch (error) {
    console.error("Error fetching budget entries:", error);
    return { success: false, data: [], actionPlanTotals: {} as ActionPlanTotals };
  }
}

export async function deleteBudgetEntry(id: string) {
  if (!id) {
    return { success: false, message: "Invalid entry id" };
  }
  try {
    await db.budgetEntry.delete({ where: { id } });
    revalidateBudgetPaths();
    return { success: true, message: "Row deleted successfully" };
  } catch (error) {
    console.error("Error deleting budget entry:", error);
    return { success: false, message: "Failed to delete row" };
  }
}
