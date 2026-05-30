"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBudgetEntries } from "@/action/budget-entry-actions";
import { Loader2, Plus } from "lucide-react";
import { BudgetEntryRowForm } from "@/components/form/budget-entry-row-form";
import { STATUTORY_FUNDS } from "@/constants/funds";
import { calculateRowTotal, type RowData } from "@/types/budget-row";

const YEARS = ["2023-2024", "2024-2025", "2025-2026", "2026-2027", "2027-2028"];

const EMPTY_ROW = (fundName: string): RowData => ({
  fundName,
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

export function BudgetEntryClient() {
  const [selectedYear, setSelectedYear] = useState(YEARS[1]);
  const [budgetType, setBudgetType] = useState<"CURRENT_YEAR" | "NEXT_YEAR">(
    "CURRENT_YEAR"
  );

  const nextYearStr = selectedYear 
    ? `${parseInt(selectedYear.split("-")[0]) + 1}-${parseInt(selectedYear.split("-")[1]) + 1}`
    : "";
  const [rows, setRows] = useState<RowData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    const res = await getBudgetEntries(selectedYear, budgetType);

    const savedDataMap = new Map<string, RowData>();
    if (res.success && res.data) {
      (res.data as RowData[]).forEach((item) =>
        savedDataMap.set(item.fundName, item)
      );
    }

    const initialRows: RowData[] = [];
    STATUTORY_FUNDS.forEach((group) => {
      initialRows.push({ ...EMPTY_ROW(group.category), isHeader: true });

      group.funds.forEach((fund) => {
        const saved = savedDataMap.get(fund);
        const fetchedTotals = res.actionPlanTotals?.[fund];

        let rowData = EMPTY_ROW(fund);
        if (saved) {
          rowData = { ...rowData, ...saved };
        } else if (fetchedTotals) {
          rowData = { ...rowData, ...fetchedTotals };
        }

        // Auto-calculate receipts for non-OSR funds on load so parent state matches child components
        const isOsrCategory = group.category.startsWith("(B)");
        if (!isOsrCategory && fund !== "Own Fund") {
          rowData.receipts = calculateRowTotal(rowData);
        }

        initialRows.push(rowData);
      });
    });

    setRows(initialRows);
    setIsLoading(false);
  }, [selectedYear, budgetType]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleRowUpdate = (index: number, rowData: Partial<RowData>) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...rowData };
      return updated;
    });
  };

  const addRow = () => setRows((prev) => [...prev, EMPTY_ROW("")]);

  const removeRowLocally = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Totals ──────────────────────────────────────────────────────────────
  const dataRows = rows.filter((r) => !r.isHeader);
  const sumField = (key: keyof RowData) =>
    dataRows.reduce((sum, r) => sum + (Number(r[key]) || 0), 0);

  return (
    <Card className="w-full shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-t-lg flex flex-col md:flex-row justify-between items-center gap-4 py-4 px-6">
        <div>
          <CardTitle className="text-xl uppercase">
            Budget Entry Section ({budgetType === "CURRENT_YEAR" ? selectedYear : nextYearStr})
          </CardTitle>
        </div>
        <div className="flex items-center gap-2 bg-white/20 p-2 rounded-lg">
          <span className="text-sm font-medium">Financial Year:</span>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[140px] bg-white text-black h-8">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-hidden">
        <Tabs
          value={budgetType}
          onValueChange={(val) =>
            setBudgetType(val as "CURRENT_YEAR" | "NEXT_YEAR")
          }
          className="w-full"
        >
          <div className="px-6 py-4 bg-gray-50 border-b">
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="CURRENT_YEAR">Current Year ({selectedYear})</TabsTrigger>
              <TabsTrigger value="NEXT_YEAR">Next Year ({nextYearStr})</TabsTrigger>
            </TabsList>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="min-w-[1600px]">
                <Table className="border-collapse">
                  <TableHeader className="bg-blue-800">
                    <TableRow>
                      <TableHead
                        rowSpan={3}
                        className="text-white font-bold border-r border-blue-700 align-middle text-center w-[60px]"
                      >
                        Sl No.
                      </TableHead>
                      <TableHead
                        rowSpan={3}
                        className="text-white font-bold border-r border-blue-700 align-middle text-center min-w-[300px]"
                      >
                        Scheme Name
                      </TableHead>
                      <TableHead
                        rowSpan={3}
                        className="text-white font-bold border-r border-blue-700 align-middle text-center w-[120px]"
                      >
                        Receipts (in Rs)
                      </TableHead>
                      <TableHead
                        colSpan={9}
                        className="text-white font-bold border-r border-blue-700 text-center border-b border-blue-700 py-3"
                      >
                        Sector wise Expenditure Distribution (in Rs)
                      </TableHead>
                      <TableHead
                        rowSpan={3}
                        className="text-white font-bold align-middle text-center w-[120px]"
                      >
                        Total (Exp.)
                      </TableHead>
                      <TableHead
                        rowSpan={3}
                        className="text-white font-bold align-middle text-center w-[80px]"
                      >
                        Actions
                      </TableHead>
                    </TableRow>
                    <TableRow className="bg-blue-700/90">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <TableHead
                          key={n}
                          colSpan={n === 1 ? 1 : 2}
                          className="text-blue-200 font-bold text-center border-r border-b border-blue-700 p-1"
                        >
                          {n}
                        </TableHead>
                      ))}
                    </TableRow>
                    <TableRow className="bg-blue-600/80">
                      {[
                        "Artho O Parikalpana",
                        "Krishi",
                        "Pranisampad Bikash",
                        "Siksha",
                        "Janaswasthya",
                        "Nari O Sishu Unnoyan",
                        "Samajkalyan",
                        "Silpa",
                        "Parikathamo",
                      ].map((label) => (
                        <TableHead
                          key={label}
                          className="text-white text-[11px] text-center border-r border-blue-700 w-[110px] p-2 leading-tight"
                        >
                          {label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {rows.map((row, i) =>
                      row.isHeader ? (
                        <TableRow
                          key={`header-${row.fundName}`}
                          className="bg-blue-100 hover:bg-blue-100"
                        >
                          <TableCell
                            colSpan={2}
                            className="p-2 border-r border-b border-gray-300 font-bold text-blue-900 text-[11px]"
                          >
                            {row.fundName}
                          </TableCell>
                          {Array.from({ length: 11 }).map((_, idx) => (
                            <TableCell key={idx} className="p-1 border-r border-b border-gray-300">
                              <div className="h-8 bg-gray-200/50 rounded-md flex items-center justify-center pattern-cross text-[10px] text-gray-400 border border-gray-200">-</div>
                            </TableCell>
                          ))}
                          <TableCell className="p-1 border-b border-gray-300"></TableCell>
                        </TableRow>
                      ) : (
                        <BudgetEntryRowForm
                          key={row.id ?? `${row.fundName}-${i}`}
                          index={i}
                          initialData={row}
                          financialYear={selectedYear}
                          budgetType={budgetType}
                          onUpdate={handleRowUpdate}
                          onDelete={removeRowLocally}
                          onSaveSuccess={fetchEntries}
                        />
                      )
                    )}
                  </TableBody>
                </Table>

                {/* Totals footer */}
                <div className="bg-gray-100 border-b border-l border-r border-gray-300">
                  <Table className="border-collapse">
                    <TableBody>
                      {(
                        [
                          { label: "Total -", showSectors: true },
                          {
                            label: "Grand Total (in Rs)",
                            showSectors: false,
                          },
                        ] as const
                      ).map(({ label, showSectors }) => (
                        <TableRow
                          key={label}
                          className="font-bold text-red-500 text-[11px] bg-red-50/50"
                        >
                          <TableCell className="w-[60px] border-r border-gray-300" />
                          <TableCell className="min-w-[300px] border-r border-gray-300 text-right p-2">
                            {label}
                          </TableCell>
                          <TableCell className="w-[120px] border-r border-gray-300 text-right p-2 tabular-nums">
                            ₹ {sumField("receipts").toLocaleString("en-IN")}
                          </TableCell>
                          {showSectors ? (
                            <>
                              {(
                                [
                                  "arthoOParikalpana",
                                  "krishi",
                                  "pranisampadBikash",
                                  "siksha",
                                  "janaswasthya",
                                  "nariOSishuUnnoyan",
                                  "samajkalyan",
                                  "silpa",
                                  "parikathamo",
                                ] as const
                              ).map((key) => (
                                <TableCell
                                  key={key}
                                  className="w-[110px] border-r border-gray-300 text-right p-2 tabular-nums"
                                >
                                  ₹ {sumField(key).toLocaleString("en-IN")}
                                </TableCell>
                              ))}
                            </>
                          ) : (
                            <TableCell
                              colSpan={9}
                              className="border-r border-gray-300 bg-gray-100"
                            />
                          )}
                          <TableCell className="w-[120px] border-r border-gray-300 text-right p-2 tabular-nums bg-green-100/50">
                            ₹{" "}
                            {dataRows
                              .reduce((s, r) => s + calculateRowTotal(r), 0)
                              .toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="w-[80px] p-2" />
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="p-4 bg-white border-t flex justify-start">
                  <Button
                    onClick={addRow}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add Row
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
