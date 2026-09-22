import type { LucideIcon } from "lucide-react";
import { FileText, CheckCircle, Hammer, AlertCircle } from "lucide-react";

export const WORK_STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "APPROVED", label: "Approved" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" },
] as const;

export const WORK_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  APPROVED: "bg-indigo-100 text-indigo-700",
  ONGOING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
  REJECTED: "bg-rose-100 text-rose-700",
};

export const WORK_STATUS_ICONS: Record<string, LucideIcon> = {
  DRAFT: FileText,
  APPROVED: CheckCircle,
  ONGOING: Hammer,
  COMPLETED: CheckCircle,
  REJECTED: AlertCircle,
};

export type CertificateProgress = {
  applicable: number;
  completed: number;
  progress: number;
};

export function calculateCertificateProgress(
  certificates: Array<{ status: string }> | undefined | null
): CertificateProgress {
  if (!certificates || certificates.length === 0) {
    return { applicable: 0, completed: 0, progress: 0 };
  }
  const applicable = certificates.length;
  const completed = certificates.filter(
    (c) => c.status === "GENERATED" || c.status === "COMPLETED" || c.status === "ISSUED"
  ).length;
  const progress = applicable > 0 ? Math.round((completed / applicable) * 100) : 0;
  return { applicable, completed, progress };
}

// ============================================================
// Master Data Type Keys
// ============================================================

export const MASTER_DATA_TYPES = {
  FINANCIAL_YEAR: "FINANCIAL_YEAR",
  NATURE_OF_WORK: "NATURE_OF_WORK",
  CATEGORY: "CATEGORY",
  SUB_CATEGORY: "SUB_CATEGORY",
  WORKSITE_TYPE: "WORKSITE_TYPE",
  BENEFICIARY_CATEGORY: "BENEFICIARY_CATEGORY",
  CONVERGENCE_DEPT: "CONVERGENCE_DEPT",
} as const;

// Labeled tabs for the Master Data management page
export const MASTER_DATA_TYPE_TABS = [
  { value: "FINANCIAL_YEAR", label: "Financial Year" },
  { value: "CATEGORY", label: "Master Category" },
  { value: "SUB_CATEGORY", label: "Sub Category" },
  { value: "NATURE_OF_WORK", label: "Nature of Work" },
  { value: "BENEFICIARY_CATEGORY", label: "Beneficiary Category" },
  { value: "CONVERGENCE_DEPT", label: "Convergence Department" },
  { value: "WORKSITE_TYPE", label: "Worksite Type" },
] as const;export type NregaWork = {
  workId: string;
  workName: string;
  workCode: string;
  district?: string;
  block?: string;
  panchayat?: string;
  village?: string;
  status?: string;
  sanctionedAmount?: number;
  expenditureAmount?: number;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
};

// ============================================================
// Helper: Transform raw master data DB records into form options
// ============================================================

export function transformMasterData<T extends { value: string; label: string }>(
  masterData: Record<string, T[]>
): Record<string, Array<{ value: string; label: string }>> {
  const result: Record<string, Array<{ value: string; label: string }>> = {};
  for (const [type, items] of Object.entries(masterData)) {
    result[type] = items.map((item) => ({
      value: item.value,
      label: item.label,
    }));
  }
  return result;
}
