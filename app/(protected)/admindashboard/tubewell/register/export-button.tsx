"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tubewell } from "@prisma/client";
import { downloadCsv, formatCsvValue, toTitleCase, formatDate } from "@/lib/utils";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

interface ExportTubewellsButtonProps {
  tubewells: Tubewell[];
}

export function ExportTubewellsButton({ tubewells }: ExportTubewellsButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(() => {
      const rows = tubewells.map((t) => ({
        "Tubewell No.": t.tubewellNo ?? "",
        Type: toTitleCase(t.tubewellType),
        Condition: toTitleCase(t.condition),
        Mouza: t.mouza ?? "",
        "Gram Sansad": t.sansad ?? "",
        Ward: t.ward ?? "",
        Landmark: t.landmark ?? "",
        Latitude: t.latitude ?? "",
        Longitude: t.longitude ?? "",
        "Install Year": t.installYear ?? "",
        Remarks: t.remarks ?? "",
        "Date Registered": formatDate(t.createdAt),
      }));

      const filename = `tubewell-register-${new Date().toISOString().slice(0, 10)}.csv`;
      downloadCsv(rows, filename);
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isPending || tubewells.length === 0}
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
