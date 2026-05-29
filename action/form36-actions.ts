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
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: `Validation failed: ${error.errors.map(e => e.message).join(", ")}` 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to save data" 
    };
  }
}

export async function getForm36Budget(financialYear: string) {
  try {
    const data = await db.form36Budget.findMany({
      where: {
        financialYear: financialYear.trim(),
      },
      orderBy: { fundName: "asc" },
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching Form-36 budget data:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch data",
      data: [] 
    };
  }
}

export async function getForm36AutoFillData(currentFinancialYear: string) {
  try {
    const startYear = parseInt(currentFinancialYear.split("-")[0]);
    const precedingYear = `${startYear - 1}-${(startYear).toString().slice(2)}`;
    const nextYear = `${startYear + 1}-${(startYear + 2).toString().slice(2)}`;

    const ccerActuals = await db.ccerActuals.findMany({
      where: { financialYear: precedingYear }
    });

    const actionPlans = await db.approvedActionPlanDetails.findMany({
      where: {
        financialYear: { in: [currentFinancialYear, nextYear] }
      }
    });

    const actionPlansCurrent = actionPlans.filter(p => p.financialYear === currentFinancialYear);
    const actionPlansNext = actionPlans.filter(p => p.financialYear === nextYear);

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
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to auto-fill data" 
    };
  }
}
