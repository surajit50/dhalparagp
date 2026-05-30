"use server";

import { db } from "@/lib/db";
import { form36Schema } from "@/schema/form36";
import { normalizeFundName } from "@/types/budget-row";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Save
// ---------------------------------------------------------------------------

export async function saveForm36Budget(data: z.infer<typeof form36Schema>) {
  try {
    const validatedData = form36Schema.parse(data);

    const result = await db.form36Budget.upsert({
      where: {
        financialYear_fundName: {
          financialYear: validatedData.financialYear,
          fundName: validatedData.fundName,
        },
      },
      update: {
        precedingYearActual: validatedData.precedingYearActual,
        currentYearEstimate: validatedData.currentYearEstimate,
        nextYearEstimate: validatedData.nextYearEstimate,
        remarks: validatedData.remarks,
      },
      create: {
        financialYear: validatedData.financialYear,
        fundName: validatedData.fundName,
        precedingYearActual: validatedData.precedingYearActual,
        currentYearEstimate: validatedData.currentYearEstimate,
        nextYearEstimate: validatedData.nextYearEstimate,
        remarks: validatedData.remarks,
      },
    });

    revalidatePath("/admindashboard/reports/form-36");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error saving Form-36 budget data:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation failed: ${error.errors.map((e) => e.message).join(", ")}`,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save data",
    };
  }
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

export async function getForm36Budget(financialYear: string) {
  try {
    const data = await db.form36Budget.findMany({
      where: { financialYear: financialYear.trim() },
      // Order by creation so restored rows respect the STATUTORY_FUNDS structure
      orderBy: { createdAt: "asc" },
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching Form-36 budget data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch data",
      data: [],
    };
  }
}

// ---------------------------------------------------------------------------
// Auto-fill
// ---------------------------------------------------------------------------

export async function getForm36AutoFillData(currentFinancialYear: string) {
  try {
    const startYear = parseInt(currentFinancialYear.split("-")[0]);
    const precedingYear = `${startYear - 1}-${startYear}`;
    const nextYear = `${startYear + 1}-${startYear + 2}`;

    const [ccerActuals, budgetCurrent, budgetNext] = await Promise.all([
      db.ccerActuals.findMany({ where: { financialYear: precedingYear } }),
      db.budgetEntry.findMany({
        where: { financialYear: currentFinancialYear, budgetType: "CURRENT_YEAR" },
      }),
      db.budgetEntry.findMany({
        where: { financialYear: currentFinancialYear, budgetType: "NEXT_YEAR" },
      }),
    ]);

    // Map ccer receipts by fund name
    const ccerMap = new Map<string, number>();
    for (const c of ccerActuals) {
      ccerMap.set(c.fundName, (ccerMap.get(c.fundName) ?? 0) + (c.receipts ?? 0));
    }

    const estimateMapCurrent = new Map<string, number>();
    for (const b of budgetCurrent) {
      estimateMapCurrent.set(b.fundName, (estimateMapCurrent.get(b.fundName) ?? 0) + (b.receipts ?? 0));
    }

    const estimateMapNext = new Map<string, number>();
    for (const b of budgetNext) {
      // Using receipts as the plan value estimate for next year
      estimateMapNext.set(b.fundName, (estimateMapNext.get(b.fundName) ?? 0) + (b.receipts ?? 0));
    }

    return {
      success: true,
      data: {
        precedingYear,
        nextYear,
        ccerMap: Object.fromEntries(ccerMap),
        estimateMapCurrent: Object.fromEntries(estimateMapCurrent),
        estimateMapNext: Object.fromEntries(estimateMapNext),
      },
    };
  } catch (error) {
    console.error("Error auto-filling Form-36 budget data:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to auto-fill data",
    };
  }
}
