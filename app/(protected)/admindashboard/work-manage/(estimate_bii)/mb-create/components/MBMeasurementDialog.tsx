"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ruler, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Measurement, EstimateItem, MBFormData } from "./types"; // import shared types

// ========== IMPORTED CALCULATIONS ==========
import { calcQty, COMPACTION_OPTIONS } from "@/lib/calculations";

interface MBMeasurementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateItem: EstimateItem | null;
  onSave: (
    measurements: Measurement[],
    totalQuantity: number,
    metadata: MBFormData,
  ) => void;
  initialMeasurements: Measurement[];
  initialMetadata: MBFormData;
}

export default function MBMeasurementDialog({
  open,
  onOpenChange,
  estimateItem,
  onSave,
  initialMeasurements,
  initialMetadata,
}: MBMeasurementDialogProps) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [metadata, setMetadata] = useState(initialMetadata);

  /* ------------------------ INITIAL LOAD ------------------------ */

  const compactionFactorValue = useMemo(() => {
    const factorKey = (estimateItem as any)?.compactionFactor as keyof typeof COMPACTION_OPTIONS;
    return factorKey ? COMPACTION_OPTIONS[factorKey] : 1.0;
  }, [estimateItem]);

  const calculateRowQty = (
    nos: number | string,
    length: number | string,
    breadth: number | string,
    depth: number | string,
  ) => {
    if (!estimateItem) return 0;
    return calcQty(
      estimateItem.unit,
      nos,
      length,
      breadth,
      depth,
      compactionFactorValue,
    );
  };

  useEffect(() => {
    if (!open || !estimateItem) return;

    if (initialMeasurements.length > 0) {
      // When editing, ensure main item has a description if it's missing
      const updatedMeasurements = initialMeasurements.map((m) => {
        if (!m.isSubItem && !m.description.trim()) {
          return { ...m, description: estimateItem.description };
        }
        return m;
      });
      setMeasurements(updatedMeasurements);
    } else {
      // New measurement – create main row with dimensions from estimateItem
      const initNos = estimateItem.nos ?? 0;
      const initLength = estimateItem.length ?? 0;
      const initBreadth = estimateItem.breadth ?? 0;
      const initDepth = estimateItem.depth ?? 0;
      const initQty = calculateRowQty(
        initNos,
        initLength,
        initBreadth,
        initDepth,
      );

      const mainRow: Measurement = {
        id: crypto.randomUUID(),
        description: estimateItem.description,
        nos: initNos,
        length: initLength,
        breadth: initBreadth,
        depth: initDepth,
        quantity: initQty,
        estimateItemId: estimateItem.id,
        isSubItem: false,
      };

      if (estimateItem.subItems?.length) {
        const subRows = estimateItem.subItems.map((sub) => {
          const sNos = sub.nos ?? 0;
          const sLength = sub.length ?? 0;
          const sBreadth = sub.breadth ?? 0;
          const sDepth = sub.depth ?? 0;
          return {
            id: crypto.randomUUID(),
            description: sub.description,
            nos: sNos,
            length: sLength,
            breadth: sBreadth,
            depth: sDepth,
            quantity: calculateRowQty(sNos, sLength, sBreadth, sDepth),
            estimateItemId: estimateItem.id,
            isSubItem: true,
          };
        });
        setMeasurements([mainRow, ...subRows]);
      } else {
        setMeasurements([mainRow]);
      }
    }

    setMetadata(initialMetadata);
  }, [open, estimateItem, initialMeasurements, initialMetadata]);

  /* ------------------------ SERIAL NUMBER ------------------------ */

  const getDisplaySlNo = (index: number) => {
    let mainCounter = 0;
    let subCounter = 0;

    for (let i = 0; i <= index; i++) {
      if (!measurements[i].isSubItem) {
        mainCounter++;
        subCounter = 0;
      } else {
        subCounter++;
      }
    }

    return subCounter > 0 ? `${mainCounter}.${subCounter}` : `${mainCounter}`;
  };

  /* ------------------------ ADD MAIN ITEM ------------------------ */

  const handleAddMain = () => {
    const initNos = estimateItem?.nos ?? 0;
    const initLength = estimateItem?.length ?? 0;
    const initBreadth = estimateItem?.breadth ?? 0;
    const initDepth = estimateItem?.depth ?? 0;
    const initQty = calculateRowQty(initNos, initLength, initBreadth, initDepth);

    setMeasurements((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        description: estimateItem?.description || "",
        nos: initNos,
        length: initLength,
        breadth: initBreadth,
        depth: initDepth,
        quantity: initQty,
        estimateItemId: estimateItem?.id,
        isSubItem: false,
      },
    ]);
  };

  /* ------------------------ ADD SUB ITEM ------------------------ */

  const handleAddSub = (parentIndex: number) => {
    let insertIndex = parentIndex + 1;
    while (
      insertIndex < measurements.length &&
      measurements[insertIndex].isSubItem
    ) {
      insertIndex++;
    }

    const newSub: Measurement = {
      id: crypto.randomUUID(),
      description: "Sub-item",
      nos: 0,
      length: 0,
      breadth: 0,
      depth: 0,
      quantity: 0,
      estimateItemId: estimateItem?.id,
      isSubItem: true,
    };
    const updated = [...measurements];
    updated.splice(insertIndex, 0, newSub);
    setMeasurements(updated);
  };

  /* ------------------------ DELETE LOGIC ------------------------ */

  const handleRemove = (id: string) => {
    const index = measurements.findIndex((m) => m.id === id);
    if (index === -1) return;

    const target = measurements[index];

    if (!target.isSubItem) {
      let deleteUntil = index + 1;
      while (
        deleteUntil < measurements.length &&
        measurements[deleteUntil].isSubItem
      ) {
        deleteUntil++;
      }

      setMeasurements([
        ...measurements.slice(0, index),
        ...measurements.slice(deleteUntil),
      ]);
    } else {
      setMeasurements(measurements.filter((m) => m.id !== id));
    }
  };

  /* ------------------------ UPDATE FIELD ------------------------ */

  const handleChange = (
    id: string,
    field: keyof Measurement,
    value: number | string,
  ) => {
    setMeasurements((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;

        if (field === "description") {
          return { ...m, description: String(value) };
        }

        const numValue =
          value === ""
            ? ""
            : typeof value === "string"
              ? parseFloat(value) || 0
              : (value as number);

        const updated = { ...m, [field]: numValue } as any;

        updated.quantity = calculateRowQty(
          updated.nos,
          updated.length,
          updated.breadth,
          updated.depth,
        );

        return updated;
      }),
    );
  };

  /* ------------------------ TOTAL ------------------------ */

  const totalQuantity = useMemo(() => {
    return measurements.reduce((sum, m) => sum + m.quantity, 0);
  }, [measurements]);

  const totalAmount = totalQuantity * (estimateItem?.rate || 0);

  /* ------------------------ SAVE ------------------------ */

  const handleSave = () => {
    if (!metadata.mbNumber.trim()) {
      alert("MB Number is required");
      return;
    }

    if (!metadata.measuredBy.trim()) {
      alert("Measured By is required");
      return;
    }

    if (totalQuantity <= 0) {
      alert("Total quantity cannot be zero");
      return;
    }

    onSave(measurements, totalQuantity, metadata);
  };

  if (!estimateItem) return null;

  /* ======================== UI ======================== */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto border-none p-0 sm:rounded-3xl shadow-2xl bg-[#f8fafc]">
        {/* PREMIUM HEADER */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-6">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-4 text-2xl font-extrabold tracking-tight text-slate-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-200 ring-4 ring-orange-50">
                  <Ruler className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="leading-tight">Add Measurements</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700 ring-1 ring-inset ring-orange-700/10">MB-ENTRY</span>
                    <span className="text-sm font-medium text-slate-500 line-clamp-1 max-w-md">{estimateItem.description}</span>
                  </div>
                </div>
              </DialogTitle>
            </div>
          </DialogHeader>
        </div>

        <div className="px-8 pb-8 pt-6 space-y-8">

          {/* MB DETAILS CARD */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-orange-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">MB Number</Label>
                <Input
                  value={metadata.mbNumber}
                  onChange={(e) =>
                    setMetadata({ ...metadata, mbNumber: e.target.value })
                  }
                  placeholder="Enter MB No."
                  className="bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all h-10 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Page Number</Label>
                <Input
                  value={metadata.mbPageNumber}
                  onChange={(e) =>
                    setMetadata({
                      ...metadata,
                      mbPageNumber: e.target.value,
                    })
                  }
                  placeholder="e.g. 45"
                  className="bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all h-10 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Measured Date</Label>
                <Input
                  type="date"
                  value={metadata.measuredDate}
                  onChange={(e) =>
                    setMetadata({
                      ...metadata,
                      measuredDate: e.target.value,
                    })
                  }
                  className="bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all h-10 font-medium cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Measured By</Label>
                <Input
                  value={metadata.measuredBy}
                  onChange={(e) =>
                    setMetadata({
                      ...metadata,
                      measuredBy: e.target.value,
                    })
                  }
                  placeholder="Name of official"
                  className="bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all h-10 font-medium"
                />
              </div>
            </div>
          </div>        
          
          {/* TABLE SECTION */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <Table className="w-full">
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-slate-50/50 border-b border-slate-200">
                  <TableHead className="w-[60px] text-center font-bold text-slate-500 text-xs uppercase tracking-wider">Sl</TableHead>
                  <TableHead className="min-w-[300px] font-bold text-slate-500 text-xs uppercase tracking-wider py-4">Particulars & Measurements</TableHead>
                  <TableHead className="w-[100px] text-center font-bold text-slate-500 text-xs uppercase tracking-wider">No</TableHead>
                  <TableHead className="w-[100px] text-center font-bold text-slate-500 text-xs uppercase tracking-wider">Length</TableHead>
                  <TableHead className="w-[100px] text-center font-bold text-slate-500 text-xs uppercase tracking-wider">Breadth</TableHead>
                  <TableHead className="w-[100px] text-center font-bold text-slate-500 text-xs uppercase tracking-wider">Depth</TableHead>
                  <TableHead className="w-[140px] text-right font-bold text-slate-500 text-xs uppercase tracking-wider pr-8">Sub Total</TableHead>
                  <TableHead className="w-[80px] text-center font-bold text-slate-500 text-xs uppercase tracking-wider">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {measurements.map((m, index) => (
                  <TableRow
                    key={m.id}
                    className={cn(
                      "group transition-all duration-200",
                      m.isSubItem
                        ? "bg-orange-50/30 hover:bg-orange-50/50 border-l-[3px] border-l-orange-400"
                        : "hover:bg-slate-50/80"
                    )}
                  >
                    <TableCell className="text-center font-bold text-slate-400 text-xs tabular-nums">
                      {getDisplaySlNo(index)}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {m.isSubItem && (
                          <div className="flex-shrink-0 w-5 flex justify-center">
                            <span className="text-orange-400 font-bold text-lg leading-none mt-[-4px]">↳</span>
                          </div>
                        )}
                        <Input
                          value={m.description}
                          onChange={(e) =>
                            handleChange(m.id, "description", e.target.value)
                          }
                          className={cn(
                            "h-9 bg-transparent border-slate-200 group-hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all",
                            m.isSubItem ? "font-medium text-slate-700" : "font-semibold text-slate-900"
                          )}
                          placeholder={m.isSubItem ? "Sub-item details..." : "Primary measurement description..."}
                        />
                        {!m.isSubItem && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-orange-600 bg-orange-50 hover:bg-orange-600 hover:text-white rounded-lg shadow-sm active:scale-95 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                            onClick={() => handleAddSub(index)}
                            title="Add Sub-item"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>

                    {["nos", "length", "breadth", "depth"].map((field) => (
                      <TableCell key={field} className="p-2">
                        <Input
                          type="number"
                          step="0.001"
                          min="0"
                          value={
                            (m[field as keyof Measurement] as string | number) ?? ""
                          }
                          onChange={(e) =>
                            handleChange(
                              m.id,
                              field as keyof Measurement,
                              e.target.value,
                            )
                          }
                          className="h-9 text-center bg-transparent border-slate-200 group-hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all font-medium tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="-"
                        />
                      </TableCell>
                    ))}

                    <TableCell className="text-right font-bold text-slate-700 pr-8 tabular-nums whitespace-nowrap">
                      {m.quantity.toFixed(3)}
                    </TableCell>

                    <TableCell className="text-center p-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                        onClick={() => handleRemove(m.id)}
                        title="Remove Row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-center">
              <Button
                variant="outline"
                onClick={handleAddMain}
                className="text-orange-600 border-orange-200 bg-white hover:bg-orange-600 hover:text-white hover:border-orange-600 rounded-xl shadow-sm px-8 font-semibold transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Main Measurement Entry
              </Button>
            </div>
          </div>

          {/* BOTTOM SUMMARY CARDS */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm min-w-[200px] flex flex-col gap-1 items-start relative overflow-hidden group">
                <div className="absolute right-[-10px] top-[-10px] h-16 w-16 bg-slate-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest relative z-10">Net Quantity</span>
                <div className="flex items-baseline gap-2 relative z-10">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">{totalQuantity.toFixed(3)}</span>
                  <span className="text-sm font-bold text-slate-500 uppercase">{estimateItem.unit}</span>
                </div>
              </div>

              <div className="bg-orange-600 p-5 rounded-2xl shadow-xl shadow-orange-100 min-w-[240px] flex flex-col gap-1 items-start relative overflow-hidden group">
                <div className="absolute right-[-20px] top-[-20px] h-24 w-24 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
                <span className="text-xs font-bold text-orange-100 uppercase tracking-widest relative z-10">Estimated Valuation</span>
                <div className="relative z-10">
                  <span className="text-3xl font-black text-white tracking-tight">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="px-8 h-12 font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
                onClick={() => onOpenChange(false)}
              >
                Discard
              </Button>
              <Button
                className="px-10 h-12 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-xl shadow-slate-200 active:scale-95 transition-all overflow-hidden relative group"
                onClick={handleSave}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">Submit Measurements</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
