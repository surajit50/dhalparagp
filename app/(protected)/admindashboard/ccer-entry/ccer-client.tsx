"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveCcerActual, getCcerActuals, deleteCcerActual } from "@/action/ccer-actions";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CcerRowForm } from "@/components/form/ccer-row-form";

type RowData = {
  id?: string;
  fundName: string;
  receipts: number;
  arthoOParikalpana: number;
  krishi: number;
  pranisampadBikash: number;
  siksha: number;
  janaswasthya: number;
  nariOSishuUnnoyan: number;
  samajkalyan: number;
  silpa: number;
  parikathamo: number;
  isSaving?: boolean;
};

import { STATUTORY_FUNDS } from "@/constants/funds";

export default function CcerClient() {
  const years = ["2023-2024", "2024-2025", "2025-2026", "2026-2027"];
  const [selectedYear, setSelectedYear] = useState(years[1]);
  const [rows, setRows] = useState<RowData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActuals = async () => {
    setIsLoading(true);
    const res = await getCcerActuals(selectedYear);

    // Legacy key groups: old numbered keys → new merged key
    const LEGACY_MERGE: Record<string, string[]> = {
      "Central Finance Commission (CFC)": ["15th CFC", "16th CFC", "17th CFC", "PBG-CFC"],
      "Performance Based Grant (SFC)": ["5th SFC", "6th SFC", "7th SFC"],
    };

    const numericFields: (keyof RowData)[] = [
      "receipts", "arthoOParikalpana", "krishi", "pranisampadBikash",
      "siksha", "janaswasthya", "nariOSishuUnnoyan", "samajkalyan", "silpa", "parikathamo",
    ];

    // Build savedDataMap from DB records
    const savedDataMap = new Map<string, any>();
    if (res.success && res.data) {
      res.data.forEach((item: any) => savedDataMap.set(item.fundName, item));
    }

    // Aggregate legacy keys into their merged counterpart
    Object.entries(LEGACY_MERGE).forEach(([mergedKey, legacyKeys]) => {
      const legacyRows = legacyKeys.map(k => savedDataMap.get(k)).filter(Boolean);
      if (legacyRows.length > 0) {
        const merged: any = { fundName: mergedKey };
        numericFields.forEach((field) => {
          merged[field] = legacyRows.reduce((sum: number, r: any) => sum + (Number(r[field]) || 0), 0);
        });
        // Use the most recent id so Save/Delete work on an existing record
        merged.id = legacyRows[legacyRows.length - 1].id;
        savedDataMap.set(mergedKey, merged);
      }
    });

    const initialRows: RowData[] = [];
    STATUTORY_FUNDS.forEach((group) => {
      initialRows.push({
        fundName: group.category,
        receipts: 0, arthoOParikalpana: 0, krishi: 0, pranisampadBikash: 0,
        siksha: 0, janaswasthya: 0, nariOSishuUnnoyan: 0, samajkalyan: 0, silpa: 0, parikathamo: 0,
        isHeader: true,
      } as any);

      group.funds.forEach((fund) => {
        const saved = savedDataMap.get(fund);
        if (saved) {
          initialRows.push(saved);
        } else {
          initialRows.push({
            fundName: fund,
            receipts: 0, arthoOParikalpana: 0, krishi: 0, pranisampadBikash: 0,
            siksha: 0, janaswasthya: 0, nariOSishuUnnoyan: 0, samajkalyan: 0, silpa: 0, parikathamo: 0,
          });
        }
      });
    });

    setRows(initialRows);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchActuals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  const handleRowUpdate = (index: number, rowData: any) => {
    const newRows = [...rows];
    // Keep id and isHeader if they exist
    newRows[index] = { ...newRows[index], ...rowData };
    setRows(newRows);
  };

  const calculateTotal = (r: RowData) => {
    return (
      r.arthoOParikalpana + r.krishi + r.pranisampadBikash + r.siksha + 
      r.janaswasthya + r.nariOSishuUnnoyan + r.samajkalyan + r.silpa + r.parikathamo
    );
  };

  const addRow = () => {
    setRows([...rows, {
      fundName: "", receipts: 0, arthoOParikalpana: 0, krishi: 0, pranisampadBikash: 0,
      siksha: 0, janaswasthya: 0, nariOSishuUnnoyan: 0, samajkalyan: 0, silpa: 0, parikathamo: 0
    }]);
  };

  const removeRowLocally = (index: number) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  return (
    <Card className="w-full shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-t-lg flex flex-col md:flex-row justify-between items-center gap-4 py-4 px-6">
        <div>
          <CardTitle className="text-xl">BUDGET ENTRY SECTION (PREVIOUS YEAR)_ACTUAL FROM CCER</CardTitle>
        </div>
        <div className="flex items-center gap-2 bg-white/20 p-2 rounded-lg">
          <span className="text-sm font-medium">Financial Year:</span>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[140px] bg-white text-black h-8">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="min-w-[1600px]">
            <Table className="border-collapse">
              <TableHeader className="bg-blue-800">
                <TableRow>
                  <TableHead rowSpan={3} className="text-white font-bold border-r border-blue-700 align-middle text-center w-[60px]">Sl No.</TableHead>
                  <TableHead rowSpan={3} className="text-white font-bold border-r border-blue-700 align-middle text-center min-w-[300px]">Scheme Name</TableHead>
                  <TableHead rowSpan={3} className="text-white font-bold border-r border-blue-700 align-middle text-center w-[120px]">Receipts (excluding OB)</TableHead>
                  <TableHead colSpan={9} className="text-white font-bold border-r border-blue-700 text-center border-b border-blue-700 py-3">Sector wise Expenditure Distribution (in Rs)</TableHead>
                  <TableHead rowSpan={3} className="text-white font-bold align-middle text-center w-[120px]">Total (Exp.)</TableHead>
                  <TableHead rowSpan={3} className="text-white font-bold align-middle text-center w-[80px]">Actions</TableHead>
                </TableRow>
                <TableRow className="bg-blue-700/90">
                  <TableHead colSpan={1} className="text-blue-200 font-bold text-center border-r border-b border-blue-700 p-1">1</TableHead>
                  <TableHead colSpan={2} className="text-blue-200 font-bold text-center border-r border-b border-blue-700 p-1">2</TableHead>
                  <TableHead colSpan={2} className="text-blue-200 font-bold text-center border-r border-b border-blue-700 p-1">3</TableHead>
                  <TableHead colSpan={2} className="text-blue-200 font-bold text-center border-r border-b border-blue-700 p-1">4</TableHead>
                  <TableHead colSpan={2} className="text-blue-200 font-bold text-center border-r border-b border-blue-700 p-1">5</TableHead>
                </TableRow>
                <TableRow className="bg-blue-600/80">
                  <TableHead className="text-white text-[11px] text-center border-r border-blue-700 w-[110px] p-2 leading-tight">Artho O Parikalpana</TableHead>
                  <TableHead className="text-white text-[11px] text-center border-r border-blue-700 w-[110px] p-2 leading-tight">Krishi</TableHead>
                  <TableHead className="text-white text-[11px] text-center border-r border-blue-700 w-[110px] p-2 leading-tight">Pranisampad Bikash</TableHead>
                  <TableHead className="text-white text-[11px] text-center border-r border-blue-700 w-[110px] p-2 leading-tight">Siksha</TableHead>
                  <TableHead className="text-white text-[11px] text-center border-r border-blue-700 w-[110px] p-2 leading-tight">Janaswasthya</TableHead>
                  <TableHead className="text-white text-[11px] text-center border-r border-blue-700 w-[110px] p-2 leading-tight">Nari O Sishu Unnoyan</TableHead>
                  <TableHead className="text-white text-[11px] text-center border-r border-blue-700 w-[110px] p-2 leading-tight">Samajkalyan</TableHead>
                  <TableHead className="text-white text-[11px] text-center border-r border-blue-700 w-[110px] p-2 leading-tight">Silpa</TableHead>
                  <TableHead className="text-white text-[11px] text-center border-r border-blue-700 w-[110px] p-2 leading-tight">Parikathamo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  let serialNo = 0;
                  return rows.map((row, i) => {
                    if ((row as any).isHeader) {
                      return (
                        <TableRow key={i} className="bg-blue-100 hover:bg-blue-100">
                          <TableCell colSpan={2} className="p-2 border-r border-b border-gray-300 font-bold text-blue-900 text-[11px]">
                            {row.fundName}
                          </TableCell>
                          {Array.from({ length: 11 }).map((_, idx) => (
                            <TableCell key={idx} className="p-1 border-r border-b border-gray-300">
                              <div className="h-8 bg-gray-200/50 rounded-md flex items-center justify-center pattern-cross text-[10px] text-gray-400 border border-gray-200">-</div>
                            </TableCell>
                          ))}
                          <TableCell className="p-1 border-b border-gray-300"></TableCell>
                        </TableRow>
                      );
                    }

                    serialNo += 1;
                    return (
                      <CcerRowForm
                        key={i}
                        index={i}
                        serialNo={serialNo}
                        initialData={row}
                        financialYear={selectedYear}
                        onUpdate={handleRowUpdate}
                        onDelete={removeRowLocally}
                        onSaveSuccess={fetchActuals}
                      />
                    );
                  });
                })()}
              </TableBody>
            </Table>
            <div className="bg-gray-100 border-b border-l border-r border-gray-300">
              <Table className="border-collapse">
                <TableBody>
                  <TableRow className="font-bold text-red-500 text-[11px] bg-red-50/50">
                    <TableCell className="w-[60px] border-r border-gray-300"></TableCell>
                    <TableCell className="min-w-[300px] border-r border-gray-300 text-right p-2">Total - </TableCell>
                    <TableCell className="w-[120px] border-r border-gray-300 text-right p-2 tabular-nums">₹ {rows.reduce((sum, r) => (r as any).isHeader ? sum : sum + (Number(r.receipts) || 0), 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="w-[110px] border-r border-gray-300 text-right p-2 tabular-nums">₹ {rows.reduce((sum, r) => (r as any).isHeader ? sum : sum + (Number(r.arthoOParikalpana) || 0), 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="w-[110px] border-r border-gray-300 text-right p-2 tabular-nums">₹ {rows.reduce((sum, r) => (r as any).isHeader ? sum : sum + (Number(r.krishi) || 0), 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="w-[110px] border-r border-gray-300 text-right p-2 tabular-nums">₹ {rows.reduce((sum, r) => (r as any).isHeader ? sum : sum + (Number(r.pranisampadBikash) || 0), 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="w-[110px] border-r border-gray-300 text-right p-2 tabular-nums">₹ {rows.reduce((sum, r) => (r as any).isHeader ? sum : sum + (Number(r.siksha) || 0), 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="w-[110px] border-r border-gray-300 text-right p-2 tabular-nums">₹ {rows.reduce((sum, r) => (r as any).isHeader ? sum : sum + (Number(r.janaswasthya) || 0), 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="w-[110px] border-r border-gray-300 text-right p-2 tabular-nums">₹ {rows.reduce((sum, r) => (r as any).isHeader ? sum : sum + (Number(r.nariOSishuUnnoyan) || 0), 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="w-[110px] border-r border-gray-300 text-right p-2 tabular-nums">₹ {rows.reduce((sum, r) => (r as any).isHeader ? sum : sum + (Number(r.samajkalyan) || 0), 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="w-[110px] border-r border-gray-300 text-right p-2 tabular-nums">₹ {rows.reduce((sum, r) => (r as any).isHeader ? sum : sum + (Number(r.silpa) || 0), 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="w-[110px] border-r border-gray-300 text-right p-2 tabular-nums">₹ {rows.reduce((sum, r) => (r as any).isHeader ? sum : sum + (Number(r.parikathamo) || 0), 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="w-[120px] border-r border-gray-300 text-right p-2 tabular-nums bg-green-100/50">₹ {rows.reduce((sum, r) => (r as any).isHeader ? sum : sum + calculateTotal(r), 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="w-[80px] p-2"></TableCell>
                  </TableRow>
                  <TableRow className="font-bold text-red-500 text-[11px] bg-red-50/50">
                    <TableCell className="w-[60px] border-r border-gray-300"></TableCell>
                    <TableCell className="min-w-[300px] border-r border-gray-300 text-right p-2">Grand Total (in Rs)</TableCell>
                    <TableCell className="w-[120px] border-r border-gray-300 text-right p-2 tabular-nums">₹ {rows.reduce((sum, r) => (r as any).isHeader ? sum : sum + (Number(r.receipts) || 0), 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell colSpan={9} className="border-r border-gray-300 bg-gray-100"></TableCell>
                    <TableCell className="w-[120px] border-r border-gray-300 text-right p-2 tabular-nums bg-green-100/50">₹ {rows.reduce((sum, r) => (r as any).isHeader ? sum : sum + calculateTotal(r), 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="w-[80px] p-2"></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="p-4 bg-white border-t flex justify-start">
              <Button onClick={addRow} variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Add Row
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
