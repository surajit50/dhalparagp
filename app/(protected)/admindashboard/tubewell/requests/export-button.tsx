"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv, toTitleCase, formatDateTime } from "@/lib/utils";
import { useTransition } from "react";

export type RequestExportRow = {
  id: string;
  citizenName: string;
  mobileNumber: string | null;
  address: string;
  mouza: string;
  problemDetails: string | null;
  status: string;
  createdAt: Date;
};

interface Props {
  requests: RequestExportRow[];
}

export function ExportRequestsButton({ requests }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(() => {
      const rows = requests.map((request) => ({
        "Citizen Name": request.citizenName,
        "Mobile Number": request.mobileNumber ?? "",
        Address: request.address,
        Mouza: request.mouza,
        "Problem Details": request.problemDetails ?? "",
        Status: toTitleCase(request.status),
        "Date Reported": formatDateTime(request.createdAt),
      }));
      const filename = `tubewell-repair-requests-${new Date().toISOString().slice(0, 10)}.csv`;
      downloadCsv(rows, filename);
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isPending || requests.length === 0}
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
