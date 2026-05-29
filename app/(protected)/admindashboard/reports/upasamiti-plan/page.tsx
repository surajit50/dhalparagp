import React from "react";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import YearFilter from "./year-filter";
import { STATUTORY_FUNDS, FLAT_STATUTORY_FUNDS } from "@/constants/funds";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getYearLabels(selected: string) {
  const parts = selected.split("-");
  if (parts.length !== 2) return { preceding: "Preceding", current: "Current", next: selected };
  
  const start = parseInt(parts[0]);
  if (isNaN(start)) return { preceding: "Preceding", current: "Current", next: selected };
  
  const isShortFormat = parts[1].length === 2; 
  const formatEnd = (y: number) => isShortFormat ? y.toString().substring(2) : y.toString();
  
  const current = `${start - 1}-${formatEnd(start)}`;
  const preceding = `${start - 2}-${formatEnd(start - 1)}`;
  
  return { preceding, current, next: selected };
}

const UPASAMITI_COLUMNS = [
  "Janasastha",
  "Nari_O_Sishu",
  "Samajkalyan",
  "Krishi",
  "Pranisampad_Bikash",
  "Silpa",
  "Parikathama",
  "Annayna_o_Bividho",
  "Unassigned"
];

export default async function UpasamitiReportPage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const financialYearFilter = resolved?.financialYear as string;

  // Get distinct financial years to populate the dropdown
  const distinctYears = await db.approvedActionPlanDetails.findMany({
    select: { financialYear: true },
    distinct: ["financialYear"],
    orderBy: { financialYear: "desc" },
  });
  const yearsList = distinctYears.map((y) => y.financialYear).filter(Boolean);
  const selectedYear = financialYearFilter || yearsList[0] || "2025-2026";

  const { preceding, current, next } = getYearLabels(selectedYear);
  const targetYears = [preceding, current, next];

  // Fetch plans
  const plans = await db.approvedActionPlanDetails.findMany({
    where: { financialYear: { in: targetYears } },
  });

  // Aggregation Structure
  type YearData = Record<string, number>;
  type SchemeData = {
    preceding: YearData;
    current: YearData;
    next: YearData;
  };

  const matrix: Record<string, SchemeData> = {};

  // Grand Totals
  const grandTotals = {
    preceding: {} as YearData,
    current: {} as YearData,
    next: {} as YearData,
  };

  // Initialize grand totals
  [preceding, current, next].forEach((yrKey) => {
    const key = yrKey === preceding ? "preceding" : yrKey === current ? "current" : "next";
    UPASAMITI_COLUMNS.forEach((u) => {
      grandTotals[key][u] = 0;
    });
    grandTotals[key]["Total"] = 0;
  });

  plans.forEach((plan) => {
    const scheme = plan.schemeName || "Other Schemes";
    const year = plan.financialYear;
    const upasamiti = plan.upasamiti || "Unassigned";
    const budget = plan.estimatedCost || 0;

    if (!matrix[scheme]) {
      matrix[scheme] = {
        preceding: {},
        current: {},
        next: {},
      };
      UPASAMITI_COLUMNS.forEach((u) => {
        matrix[scheme].preceding[u] = 0;
        matrix[scheme].current[u] = 0;
        matrix[scheme].next[u] = 0;
      });
    }

    let yearKey: "preceding" | "current" | "next" | null = null;
    if (year === preceding) yearKey = "preceding";
    else if (year === current) yearKey = "current";
    else if (year === next) yearKey = "next";

    if (yearKey) {
      if (matrix[scheme][yearKey][upasamiti] !== undefined) {
        matrix[scheme][yearKey][upasamiti] += budget;
      } else {
        // If upasamiti doesn't strictly match the predefined columns (like Unassigned)
        if (!matrix[scheme][yearKey]["Unassigned"]) {
           matrix[scheme][yearKey]["Unassigned"] = 0;
        }
        matrix[scheme][yearKey]["Unassigned"] += budget;
      }
      grandTotals[yearKey][upasamiti] += budget;
      grandTotals[yearKey]["Total"] += budget;
    }
  });

  // Ensure all statutory funds exist in matrix so they render even if zero
  FLAT_STATUTORY_FUNDS.forEach((fund) => {
    if (!matrix[fund]) {
      matrix[fund] = { preceding: {}, current: {}, next: {} };
      UPASAMITI_COLUMNS.forEach((u) => {
        matrix[fund].preceding[u] = 0;
        matrix[fund].current[u] = 0;
        matrix[fund].next[u] = 0;
      });
    }
  });

  const otherSchemes = Object.keys(matrix).filter((s) => !FLAT_STATUTORY_FUNDS.includes(s)).sort();

  const renderYearColumns = (yearData: YearData) => {
    let yearTotal = 0;
    const cells = UPASAMITI_COLUMNS.map((u) => {
      const val = yearData[u] || 0;
      yearTotal += val;
      return (
        <TableCell key={u} className="text-right text-xs whitespace-nowrap tabular-nums border-r border-gray-200">
          {val > 0 ? formatCurrency(val) : "-"}
        </TableCell>
      );
    });
    
    cells.push(
      <TableCell key="total" className="text-right font-bold text-xs whitespace-nowrap tabular-nums bg-gray-50 border-r-2 border-gray-300">
        {formatCurrency(yearTotal)}
      </TableCell>
    );
    return cells;
  };

  const renderGrandTotals = (yearData: YearData) => {
    const cells = UPASAMITI_COLUMNS.map((u) => (
      <TableCell key={u} className="text-right font-bold text-xs whitespace-nowrap tabular-nums border-r border-gray-200">
        {formatCurrency(yearData[u] || 0)}
      </TableCell>
    ));
    cells.push(
      <TableCell key="total" className="text-right font-bold text-sm whitespace-nowrap tabular-nums bg-orange-100 border-r-2 border-gray-300">
        {formatCurrency(yearData["Total"] || 0)}
      </TableCell>
    );
    return cells;
  };

  return (
    <div className="flex flex-col p-2 space-y-4">
      <Card className="w-full shadow-lg border-0 rounded-none md:rounded-xl overflow-hidden">
        <CardHeader className="bg-white border-b sticky left-0 z-10 px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                PAYMENTS: Upasamiti Wise Budget Matrix
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Final Estimate Budget cross-tabulation for {preceding}, {current}, and {next}
              </p>
            </div>
            <div className="bg-gray-50 border rounded-md p-2 shadow-sm min-w-[200px]">
              <YearFilter years={yearsList} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[max-content] pb-8">
              <Table className="border-collapse bg-white">
                <TableHeader className="bg-orange-50 sticky top-0 z-10 shadow-sm">
                  {/* Top Header: Year Groups */}
                  <TableRow className="border-b-2 border-orange-200">
                    <TableHead className="font-bold text-orange-900 text-sm border-r-2 border-orange-200 sticky left-0 bg-orange-100 z-20 shadow-[1px_0_0_#fdba74]">
                      Head of Payment
                    </TableHead>
                    <TableHead colSpan={UPASAMITI_COLUMNS.length + 1} className="font-bold text-center text-sm text-gray-800 border-r-2 border-gray-300">
                      Actual payment of preceding year<br/>({preceding})
                    </TableHead>
                    <TableHead colSpan={UPASAMITI_COLUMNS.length + 1} className="font-bold text-center text-sm text-gray-800 border-r-2 border-gray-300">
                      Budget estimate of current year<br/>({current})
                    </TableHead>
                    <TableHead colSpan={UPASAMITI_COLUMNS.length + 1} className="font-bold text-center text-sm text-gray-800 border-r-2 border-gray-300">
                      Budget estimate for next year<br/>({next})
                    </TableHead>
                  </TableRow>

                  {/* Sub Header: Upasamiti Columns */}
                  <TableRow className="border-b border-orange-200">
                    <TableHead className="font-semibold text-xs border-r-2 border-orange-200 sticky left-0 bg-orange-50 z-20 shadow-[1px_0_0_#fdba74] min-w-[250px]">
                      Scheme Name
                    </TableHead>
                    
                    {/* Render headers 3 times for each year */}
                    {[1, 2, 3].map((yearGroup) => (
                      <React.Fragment key={yearGroup}>
                        {UPASAMITI_COLUMNS.map((u, i) => (
                          <TableHead key={`${yearGroup}-${u}`} className="text-center font-semibold text-[10px] leading-tight px-2 py-3 border-r border-gray-200 min-w-[100px] max-w-[120px] whitespace-normal align-bottom">
                            <span className="text-gray-400 block mb-1">{i + 1}</span>
                            {u.replace(/_/g, " ")}
                          </TableHead>
                        ))}
                        <TableHead key={`${yearGroup}-Total`} className="text-center font-bold text-xs bg-gray-50 border-r-2 border-gray-300 min-w-[120px] align-bottom pb-3">
                          Total
                        </TableHead>
                      </React.Fragment>
                    ))}
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {STATUTORY_FUNDS.map((group, groupIdx) => (
                    <React.Fragment key={group.category}>
                      {/* Header Row */}
                      <TableRow className="bg-orange-100 hover:bg-orange-100">
                        <TableCell colSpan={(UPASAMITI_COLUMNS.length + 1) * 3 + 1} className="font-bold text-orange-900 text-xs py-2 sticky left-0 bg-orange-100 z-10 shadow-[1px_0_0_#ffedd5]">
                          {group.category}
                        </TableCell>
                      </TableRow>
                      
                      {/* Data Rows */}
                      {group.funds.map((scheme, index) => {
                        const schemeData = matrix[scheme];
                        return (
                          <TableRow
                            key={scheme}
                            className={`hover:bg-orange-50/50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                          >
                            <TableCell className="font-medium text-[11px] text-gray-800 border-r-2 border-orange-100 sticky left-0 bg-inherit z-10 shadow-[1px_0_0_#ffedd5]">
                              {scheme}
                            </TableCell>
                            {renderYearColumns(schemeData.preceding)}
                            {renderYearColumns(schemeData.current)}
                            {renderYearColumns(schemeData.next)}
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  ))}

                  {/* Legacy / Other Schemes (If Any) */}
                  {otherSchemes.length > 0 && (
                    <React.Fragment>
                      <TableRow className="bg-orange-100 hover:bg-orange-100">
                        <TableCell colSpan={(UPASAMITI_COLUMNS.length + 1) * 3 + 1} className="font-bold text-orange-900 text-xs py-2 sticky left-0 bg-orange-100 z-10 shadow-[1px_0_0_#ffedd5]">
                          (G) OTHER SCHEMES
                        </TableCell>
                      </TableRow>
                      {otherSchemes.map((scheme, index) => {
                        const schemeData = matrix[scheme];
                        return (
                          <TableRow
                            key={scheme}
                            className={`hover:bg-orange-50/50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                          >
                            <TableCell className="font-medium text-[11px] text-gray-800 border-r-2 border-orange-100 sticky left-0 bg-inherit z-10 shadow-[1px_0_0_#ffedd5]">
                              {scheme}
                            </TableCell>
                            {renderYearColumns(schemeData.preceding)}
                            {renderYearColumns(schemeData.current)}
                            {renderYearColumns(schemeData.next)}
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  )}

                  {/* Grand Total Row */}
                  <TableRow className="bg-orange-200/60 hover:bg-orange-200/60 border-t-2 border-orange-300">
                    <TableCell className="font-extrabold text-sm text-orange-900 border-r-2 border-orange-300 sticky left-0 bg-orange-100 z-10 shadow-[1px_0_0_#fdba74]">
                      Grand Total (in Rs)
                    </TableCell>
                      {renderGrandTotals(grandTotals.preceding)}
                      {renderGrandTotals(grandTotals.current)}
                      {renderGrandTotals(grandTotals.next)}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
