"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv, toTitleCase, formatCurrency, formatDate } from "@/lib/utils";
import { useState, useTransition } from "react";

export type BillExportRow = {
  id: string;
  billNumber: string;
  workOrders: { orderNumber: string; mistri: { name: string } }[];
  totalMaterialCost: number;
  totalLaborCost: number;
  netAmount: number;
  status: string;
  billDate: Date;
};

interface Props {
  bills: BillExportRow[];
}

export function ExportBillsButton({ bills }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(() => {
      const rows = bills.map((b) => ({
        "Bill Number": b.billNumber,
        "Work Orders": b.workOrders.map((wo) => wo.orderNumber).join(", "),
        "Mistri Names": b.workOrders.map((wo) => wo.mistri.name).join(", "),
        "Material Cost (₹)": formatCurrency(b.totalMaterialCost),
        "Labor / Musti Cost (₹)": formatCurrency(b.totalLaborCost),
        "Net Amount (₹)": formatCurrency(b.netAmount),
        Status: toTitleCase(b.status),
        "Bill Date": formatDate(b.billDate),
      }));
      const filename = `tubewell-bills-${new Date().toISOString().slice(0, 10)}.csv`;
      downloadCsv(rows, filename);
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isPending || bills.length === 0}
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
