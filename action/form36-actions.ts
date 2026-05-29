"use server";

import { db } from "@/lib/db";
import { form36Schema } from "@/schema/form36";
import { z } from "zod";
import { revalidatePath } from "next/cache";

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
    return { success: false, error: "Failed to save data" };
  }
}

export async function getForm36Budget(financialYear: string) {
  try {
    const data = await db.form36Budget.findMany({
      where: {
        financialYear,
      },
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching Form-36 budget data:", error);
    return { success: false, error: "Failed to fetch data" };
  }
}

// Fetch helper that aggregates CCER for preceding year and Approved Action Plans for estimates
export async function getForm36AutoFillData(currentFinancialYear: string) {
  try {
    // Determine the preceding and next financial years based on the current one
    const startYear = parseInt(currentFinancialYear.split("-")[0]);
    const precedingYear = `${startYear - 1}-${startYear}`;
    const nextYear = `${startYear + 1}-${startYear + 2}`;

    // 1. Fetch CCER Actuals for preceding year
    const ccerActuals = await db.ccerActuals.findMany({
      where: { financialYear: precedingYear }
    });

    // 2. Fetch Action Plans for current and next years
    const actionPlans = await db.approvedActionPlanDetails.findMany({
      where: {
        financialYear: { in: [currentFinancialYear, nextYear] }
      }
    });

    const actionPlansCurrent = actionPlans.filter(p => p.financialYear === currentFinancialYear);
    const actionPlansNext = actionPlans.filter(p => p.financialYear === nextYear);

    // Build lookup maps
    const ccerMap = new Map();
    ccerActuals.forEach(c => ccerMap.set(c.fundName, c.receipts));

    const estimateMapCurrent = new Map();
    actionPlansCurrent.forEach(p => {
      const fund = p.schemeName || "Unknown";
      estimateMapCurrent.set(fund, (estimateMapCurrent.get(fund) || 0) + (p.estimatedCost || 0));
    });

    const estimateMapNext = new Map();
    actionPlansNext.forEach(p => {
      const fund = p.schemeName || "Unknown";
      estimateMapNext.set(fund, (estimateMapNext.get(fund) || 0) + (p.estimatedCost || 0));
    });

    return {
      success: true,
      data: {
        precedingYear,
        nextYear,
        ccerMap: Object.fromEntries(ccerMap),
        estimateMapCurrent: Object.fromEntries(estimateMapCurrent),
        estimateMapNext: Object.fromEntries(estimateMapNext)
      }
    };

  } catch (error) {
    console.error("Error auto-filling Form-36 budget data:", error);
    return { success: false, error: "Failed to auto-fill data" };
  }
}
