import React from 'react';
import { db } from '@/lib/db';
import { Form35Table } from '@/components/reports/form-35-table';
import YearFilter from '../upasamiti-plan/year-filter';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Form35KoPSBPage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const financialYearFilter = resolved?.financialYear as string;

  const distinctYears = await db.approvedActionPlanDetails.findMany({
    select: { financialYear: true },
    distinct: ["financialYear"],
    orderBy: { financialYear: "desc" },
  });
  const yearsList = distinctYears.map((y) => y.financialYear).filter(Boolean);
  const selectedYear = financialYearFilter || yearsList[0] || "2025-2026";

  const parts = selectedYear.split("-");
  const start = parseInt(parts[0]);
  const isShortFormat = parts.length > 1 && parts[1].length === 2;
  const formatEnd = (y: number) => isShortFormat ? y.toString().substring(2) : y.toString();
  const currentYearLabel = !isNaN(start) ? `${start - 1}-${formatEnd(start)}` : "Current";
  const nextYearLabel = selectedYear;

  const currentBudgets = await db.budgetEntry.findMany({
    where: { financialYear: selectedYear, budgetType: "CURRENT_YEAR" }
  });

  const nextBudgets = await db.budgetEntry.findMany({
    where: { financialYear: selectedYear, budgetType: "NEXT_YEAR" }
  });

  return (
    <div className="flex flex-col gap-4 p-4 w-full">
      <div className="flex justify-end">
        <YearFilter years={yearsList} />
      </div>
      <Form35Table
        title="Krishi o Prani Sampad Bikash"
        groups={[
          { label: "Krishi", columnKey: "krishi" },
          { label: "Prani Sampad", columnKey: "pranisampadBikash" }
        ]}
        currentBudgets={currentBudgets}
        nextBudgets={nextBudgets}
        selectedYear={selectedYear}
        currentYearLabel={currentYearLabel}
        nextYearLabel={nextYearLabel}
      />
    </div>
  );
}
