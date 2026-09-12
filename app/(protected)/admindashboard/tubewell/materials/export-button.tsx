"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv, toTitleCase, formatCurrency, formatDate } from "@/lib/utils";
import { useState, useTransition } from "react";

export type MaterialExportRow = {
  id: string;
  name: string;
  bengaliName: string | null;
  unit: string;
  stock: number;
  rate: number;
  isActive: boolean;
  createdAt: Date;
};

interface Props {
  materials: MaterialExportRow[];
}

export function ExportMaterialsButton({ materials }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(() => {
      const rows = materials.map((m) => ({
        "Material Name": m.name,
        "Bengali Name": m.bengaliName ?? "",
        "Stock Unit": m.unit,
        "Current Stock": m.stock,
        "Unit Rate (₹)": formatCurrency(m.rate),
        "Total Value (₹)": formatCurrency(m.stock * m.rate),
        Status: m.isActive ? "Active" : "Inactive",
        "Added On": formatDate(m.createdAt),
      }));
      const filename = `tubewell-materials-${new Date().toISOString().slice(0, 10)}.csv`;
      downloadCsv(rows, filename);
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isPending || materials.length === 0}
      className="gap-2 rounded-xl h-11 px-5 border-slate-200 hover:bg-slate-50 transition-colors"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <span className="font-semibold">Export CSV</span>
    </Button>
  );
}
