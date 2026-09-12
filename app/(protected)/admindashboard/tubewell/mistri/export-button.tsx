"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv, formatDate } from "@/lib/utils";
import { useState, useTransition } from "react";

export type MistriExportRow = {
  id: string;
  name: string;
  mobileNumber: string | null;
  address: string | null;
  bankName: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
  isActive: boolean;
  createdAt: Date;
};

interface Props {
  mistris: MistriExportRow[];
}

export function ExportMistrisButton({ mistris }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(() => {
      const rows = mistris.map((m) => ({
        "Mistri Name": m.name,
        "Mobile Number": m.mobileNumber ?? "",
        Address: m.address ?? "",
        "Bank Name": m.bankName ?? "",
        "Account Number": m.accountNumber ?? "",
        "IFSC Code": m.ifscCode ?? "",
        Status: m.isActive ? "Active" : "Inactive",
        "Registered On": formatDate(m.createdAt),
      }));
      const filename = `tubewell-mistris-${new Date().toISOString().slice(0, 10)}.csv`;
      downloadCsv(rows, filename);
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isPending || mistris.length === 0}
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
