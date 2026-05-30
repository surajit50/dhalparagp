"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUTORY_FUNDS, getFundDisplayName } from "@/constants/funds";
import {
  getForm36Budget,
  getForm36AutoFillData,
  saveForm36Budget,
} from "@/action/form36-actions";
import { Loader2, Save, RotateCcw, HelpCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NumericField = "precedingYearActual" | "currentYearEstimate" | "nextYearEstimate";

type RowData = {
  fundName: string;
  precedingYearActual: number;
  currentYearEstimate: number;
  nextYearEstimate: number;
  remarks: string;
  isSaving?: boolean;
  isHeader?: boolean;
};

type OpeningBalance = { preceding: number; current: number; next: number };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const YEARS = [
  "2022-23",
  "2023-24",
  "2024-25",
  "2025-26",
  "2026-27",
];

const NUMERIC_FIELDS: NumericField[] = [
  "precedingYearActual",
  "currentYearEstimate",
  "nextYearEstimate",
];

const EMPTY_ROW = (fundName: string, isHeader = false): RowData => ({
  fundName,
  precedingYearActual: 0,
  currentYearEstimate: 0,
  nextYearEstimate: 0,
  remarks: "",
  isHeader,
});

const fmt = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Form36Client() {
  const [selectedYear, setSelectedYear] = useState(YEARS[1]);
  const [rows, setRows] = useState<RowData[]>([]);
  const [openingBalance, setOpeningBalance] = useState<OpeningBalance>({
    preceding: 0,
    current: 0,
    next: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  // ── Year label helpers ────────────────────────────────────────────────────
  const startYear = parseInt(selectedYear.split("-")[0]);
  const precedingYearLabel = `${startYear - 1}-${startYear.toString().slice(2)}`;
  const currentYearLabel = selectedYear;
  const nextYearLabel = `${startYear + 1}-${(startYear + 2).toString().slice(2)}`;

  // ── Data fetch ────────────────────────────────────────────────────────────
  const fetchBudget = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getForm36Budget(selectedYear);
      if (!res.success) {
        toast({
          title: "Error",
          description: res.error || "Failed to fetch data",
          variant: "destructive",
        });
        return;
      }

      const savedDataMap = new Map<string, RowData>();
      (res.data as RowData[]).forEach((item) =>
        savedDataMap.set(item.fundName, item)
      );

      setOpeningBalance({
        preceding: savedDataMap.get("Opening Balance Preceding")?.precedingYearActual ?? 0,
        current: savedDataMap.get("Opening Balance Current")?.currentYearEstimate ?? 0,
        next: savedDataMap.get("Opening Balance Next")?.nextYearEstimate ?? 0,
      });

      const initialRows: RowData[] = [];
      STATUTORY_FUNDS.forEach((group) => {
        initialRows.push(EMPTY_ROW(group.category, true));
        group.funds.forEach((fund) => {
          initialRows.push(savedDataMap.get(fund) ?? EMPTY_ROW(fund));
        });
      });
      setRows(initialRows);
    } catch {
      toast({
        title: "Error",
        description: "Unexpected error loading data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  // ── Auto-fill ─────────────────────────────────────────────────────────────
  const autoFillEstimates = async () => {
    if (
      !confirm(
        "This will overwrite your current unsaved data with automatically calculated values from CCER Actuals and Approved Action Plans. Continue?"
      )
    )
      return;

    setIsAutoFilling(true);
    const result = await getForm36AutoFillData(selectedYear);

    if (result.success && result.data) {
      const { ccerMap, estimateMapCurrent, estimateMapNext } = result.data;
      setRows((prev) =>
        prev.map((row) =>
          row.isHeader
            ? row
            : {
                ...row,
                precedingYearActual: ccerMap[row.fundName] ?? row.precedingYearActual,
                currentYearEstimate: estimateMapCurrent[row.fundName] ?? row.currentYearEstimate,
                nextYearEstimate: estimateMapNext[row.fundName] ?? row.nextYearEstimate,
              }
        )
      );
      toast({
        title: "Auto-fill Complete",
        description: "Values populated from CCER and Action Plans. Please review and save.",
      });
    } else {
      toast({
        title: "Auto-fill Failed",
        description: result.error || "Could not fetch data.",
        variant: "destructive",
      });
    }
    setIsAutoFilling(false);
  };

  // ── Input handlers ────────────────────────────────────────────────────────
  const handleNumericChange = (
    index: number,
    field: NumericField,
    value: string
  ) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value === "" ? 0 : parseFloat(value),
      };
      return updated;
    });
  };

  const handleRemarksChange = (index: number, value: string) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], remarks: value };
      return updated;
    });
  };

  const handleObChange = (
    field: keyof OpeningBalance,
    value: string
  ) => {
    setOpeningBalance((prev) => ({
      ...prev,
      [field]: value === "" ? 0 : parseFloat(value),
    }));
  };

  // ── Save helpers ──────────────────────────────────────────────────────────
  const buildSavePayload = (row: RowData) => ({
    financialYear: selectedYear,
    fundName: row.fundName,
    precedingYearActual: row.precedingYearActual,
    currentYearEstimate: row.currentYearEstimate,
    nextYearEstimate: row.nextYearEstimate,
    remarks: row.remarks,
  });

  const saveRow = async (index: number) => {
    const row = rows[index];
    if (row.isHeader) return;

    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isSaving: true };
      return updated;
    });

    const res = await saveForm36Budget(buildSavePayload(row));

    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isSaving: false };
      return updated;
    });

    if (res.success) {
      toast({ title: "Saved", description: `${getFundDisplayName(row.fundName)} updated.` });
    } else {
      toast({
        title: "Error",
        description: res.error || `Failed to save ${row.fundName}`,
        variant: "destructive",
      });
    }
  };

  const saveAll = async () => {
    setIsLoading(true);

    const dataRows = rows.filter((r) => !r.isHeader);
    const obPayloads = [
      {
        financialYear: selectedYear,
        fundName: "Opening Balance Preceding",
        precedingYearActual: openingBalance.preceding,
        currentYearEstimate: 0,
        nextYearEstimate: 0,
        remarks: "",
      },
      {
        financialYear: selectedYear,
        fundName: "Opening Balance Current",
        precedingYearActual: 0,
        currentYearEstimate: openingBalance.current,
        nextYearEstimate: 0,
        remarks: "",
      },
      {
        financialYear: selectedYear,
        fundName: "Opening Balance Next",
        precedingYearActual: 0,
        currentYearEstimate: 0,
        nextYearEstimate: openingBalance.next,
        remarks: "",
      },
    ];

    const results = await Promise.all([
      ...dataRows.map((row) => saveForm36Budget(buildSavePayload(row))),
      ...obPayloads.map((p) => saveForm36Budget(p)),
    ]);

    const errorCount = results.filter((r) => !r.success).length;
    if (errorCount === 0) {
      toast({ title: "Success", description: "Entire Form-36 saved successfully!" });
    } else {
      toast({
        title: "Partial Error",
        description: `${errorCount} item(s) failed to save.`,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  // ── Totals ────────────────────────────────────────────────────────────────
  const dataRows = rows.filter((r) => !r.isHeader);
  const totalPreceding = dataRows.reduce((s, r) => s + (r.precedingYearActual || 0), 0);
  const totalCurrent = dataRows.reduce((s, r) => s + (r.currentYearEstimate || 0), 0);
  const totalNext = dataRows.reduce((s, r) => s + (r.nextYearEstimate || 0), 0);
  const gtPreceding = totalPreceding + openingBalance.preceding;
  const gtCurrent = totalCurrent + openingBalance.current;
  const gtNext = totalNext + openingBalance.next;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-48">
            <Select
              value={selectedYear}
              onValueChange={setSelectedYear}
              disabled={isLoading}
            >
              <SelectTrigger>
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

          <Button
            variant="outline"
            onClick={fetchBudget}
            disabled={isLoading}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Refresh
          </Button>

          <Button
            variant="secondary"
            onClick={autoFillEstimates}
            disabled={isLoading || isAutoFilling}
            className="gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
          >
            {isAutoFilling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <HelpCircle className="h-4 w-4" />
            )}
            Auto-fill Data
          </Button>
        </div>

        <Button
          onClick={saveAll}
          disabled={isLoading}
          className="gap-2 bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save All Changes
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          <Table className="border-collapse">
            <TableHeader className="bg-gray-100 sticky top-0 z-10 shadow-sm">
              {/* Form title */}
              <TableRow className="border-b">
                <TableHead
                  colSpan={6}
                  className="text-center py-4 bg-white border-b-2 border-black"
                >
                  <div className="font-bold text-xl text-black">FORM-36</div>
                  <div className="font-semibold text-sm text-black mb-2">
                    [See rule 36 (3)]
                  </div>
                  <div className="font-bold text-base text-black flex justify-center items-center gap-8">
                    <span>
                      Final Estimate Budget for the year of {selectedYear} of
                    </span>
                    <span>No 3 Dhalpara GP</span>
                    <span>Gram Panchayat</span>
                  </div>
                </TableHead>
              </TableRow>

              {/* Column headers */}
              <TableRow className="border-b-2 border-black bg-gray-50">
                <TableHead className="font-bold text-black border-r text-center align-middle w-[35%] py-4">
                  Head of receipts
                </TableHead>
                <TableHead className="font-bold text-black border-r text-center align-middle w-[15%]">
                  Annual receipts of the
                  <br />
                  preceding year
                  <br />
                  {precedingYearLabel}
                </TableHead>
                <TableHead className="font-bold text-black border-r text-center align-middle w-[15%]">
                  Budget estimate of the
                  <br />
                  current year
                  <br />
                  {currentYearLabel}
                </TableHead>
                <TableHead className="font-bold text-black border-r text-center align-middle w-[15%]">
                  Budget estimate for the
                  <br />
                  next year
                  <br />
                  {nextYearLabel}
                </TableHead>
                <TableHead className="font-bold text-black border-r text-center align-middle w-[15%]">
                  Remarks
                </TableHead>
                <TableHead className="font-bold text-black text-center align-middle w-[5%]">
                  Action
                </TableHead>
              </TableRow>

              {/* Column numbers */}
              <TableRow className="bg-yellow-100 border-b-2 border-black">
                {["(1)", "(2)", "(3)", "(4)", "(5)", ""].map((label, i) => (
                  <TableHead
                    key={i}
                    className={`font-bold text-red-600 text-center py-1 text-xs${i < 5 ? " border-r" : ""}`}
                  >
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">Loading Form-36 Data...</p>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, i) =>
                  row.isHeader ? (
                    <TableRow
                      key={`header-${row.fundName}`}
                      className="bg-gray-100 hover:bg-gray-100"
                    >
                      <TableCell
                        colSpan={6}
                        className="p-2 border-b border-gray-300 font-bold text-black text-sm uppercase"
                      >
                        {row.fundName}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow
                      key={row.fundName}
                      className="hover:bg-blue-50/50"
                    >
                      {/* Fund name — full display name via helper */}
                      <TableCell className="p-2 border-r border-gray-300 border-b border-dashed">
                        <span className="text-sm font-medium">
                          {getFundDisplayName(row.fundName)}
                        </span>
                      </TableCell>

                      {/* Numeric inputs */}
                      {NUMERIC_FIELDS.map((field, fi) => (
                        <TableCell
                          key={field}
                          className="p-1 border-r border-gray-300 border-b border-dashed"
                        >
                          <Input
                            type="number"
                            value={row[field] || ""}
                            onChange={(e) =>
                              handleNumericChange(i, field, e.target.value)
                            }
                            className={`h-8 text-sm text-right tabular-nums rounded-none border-0 focus-visible:ring-1 ${
                              fi === 0
                                ? "focus-visible:ring-orange-500"
                                : fi === 1
                                ? "focus-visible:ring-blue-500"
                                : "focus-visible:ring-green-500"
                            }`}
                          />
                        </TableCell>
                      ))}

                      {/* Remarks */}
                      <TableCell className="p-1 border-r border-gray-300 border-b border-dashed">
                        <Input
                          value={row.remarks || ""}
                          onChange={(e) => handleRemarksChange(i, e.target.value)}
                          className="h-8 text-xs rounded-none border-0 focus-visible:ring-1"
                        />
                      </TableCell>

                      {/* Save row button */}
                      <TableCell className="p-1 text-center border-b border-dashed">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => saveRow(i)}
                          disabled={row.isSaving}
                          className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          {row.isSaving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )
              )}

              {/* Total row */}
              <TableRow className="bg-gray-50 border-t-2 border-black font-bold">
                <TableCell className="p-2 border-r border-gray-300 text-center italic">
                  Total -
                </TableCell>
                <TableCell className="p-2 border-r border-gray-300 text-right tabular-nums text-sm">
                  ₹ {fmt(totalPreceding)}
                </TableCell>
                <TableCell className="p-2 border-r border-gray-300 text-right tabular-nums text-sm">
                  ₹ {fmt(totalCurrent)}
                </TableCell>
                <TableCell className="p-2 border-r border-gray-300 text-right tabular-nums text-sm">
                  ₹ {fmt(totalNext)}
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>

              {/* Opening Balance row */}
              <TableRow className="bg-yellow-50 hover:bg-yellow-100 font-bold border-t border-gray-300">
                <TableCell className="p-2 border-r border-gray-300 text-center italic">
                  Opening Balance
                </TableCell>
                {(["preceding", "current", "next"] as const).map((field) => (
                  <TableCell
                    key={field}
                    className="p-1 border-r border-gray-300"
                  >
                    <Input
                      type="number"
                      value={openingBalance[field] || ""}
                      onChange={(e) => handleObChange(field, e.target.value)}
                      className="h-8 text-sm font-bold text-right tabular-nums rounded-none border-0 focus-visible:ring-1 focus-visible:ring-yellow-500 bg-transparent"
                      placeholder="0.00"
                    />
                  </TableCell>
                ))}
                <TableCell
                  colSpan={2}
                  className="text-xs text-gray-500 text-center"
                >
                  Enter Manually
                </TableCell>
              </TableRow>

              {/* Grand Total row */}
              <TableRow className="bg-red-50 text-red-600 font-bold border-t-2 border-b-2 border-black">
                <TableCell className="p-3 border-r border-gray-300 text-center italic">
                  Grand Total (in Rs)
                </TableCell>
                <TableCell className="p-3 border-r border-gray-300 text-right tabular-nums text-sm">
                  ₹ {fmt(gtPreceding)}
                </TableCell>
                <TableCell className="p-3 border-r border-gray-300 text-right tabular-nums text-sm">
                  ₹ {fmt(gtCurrent)}
                </TableCell>
                <TableCell className="p-3 border-r border-gray-300 text-right tabular-nums text-sm">
                  ₹ {fmt(gtNext)}
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
