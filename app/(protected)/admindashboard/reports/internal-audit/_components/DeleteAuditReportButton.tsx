"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteInternalAuditReport } from "@/action/internal-audit-actions";

interface DeleteAuditReportButtonProps {
  reportId: string;
  reportNo: string;
}

export function DeleteAuditReportButton({ reportId, reportNo }: DeleteAuditReportButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete report "${reportNo}"?`)) return;

    setLoading(true);
    try {
      const res = await deleteInternalAuditReport(reportId);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to delete report.");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={loading}
      onClick={handleDelete}
      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
