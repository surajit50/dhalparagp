"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv, toTitleCase, formatCurrency, formatDate } from "@/lib/utils";
import { useState, useTransition } from "react";
import { TubewellWorkOrderWithRelations } from "@/types";

interface Props {
  orders: TubewellWorkOrderWithRelations[];
}

export function ExportWorkOrdersButton({ orders }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(() => {
      const rows = orders.map((o) => {
        const materialsTotal = o.materials.reduce(
          (a, m) => a + m.quantity * m.rate,
          0
        );
        return {
          "Work Order No.": o.orderNumber,
          Mistri: o.mistri.name,
          "Repair Request Citizen": o.request?.citizenName ?? "N/A",
          "Location / Address": o.request?.address ?? "N/A",
          Mouza: o.request?.mouza ?? "N/A",
          "No. of Materials": o.materials.length,
          "Material Value (₹)": formatCurrency(materialsTotal),
          "Musti Amount (₹)": formatCurrency(o.mustiAmount ?? 0),
          Status: toTitleCase(o.status),
          
          "Completed On": o.completionDate ? formatDate(o.completionDate) : "",
        };
      });
      const filename = `tubewell-work-orders-${new Date().toISOString().slice(0, 10)}.csv`;
      downloadCsv(rows, filename);
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isPending || orders.length === 0}
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
