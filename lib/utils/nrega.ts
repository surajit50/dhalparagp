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

export const WORK_FORM_STEPS = [
  "Basic Information",
  "Location",
  "Financial Details",
  "Beneficiary",
  "Administrative",
  "Convergence",
];

export const WORK_FORM_STEP_FIELDS: Record<number, string[]> = {
  0: ["financialYear", "workName"],
  1: ["gramPanchayat", "block", "district"],
  2: ["wageComponent", "materialComponent"],
  3: [],
  4: [],
  5: [],
};

export const DEFAULT_FINANCIAL_YEAR_OPTIONS = [
  { value: "2024-2025", label: "2024-2025" },
  { value: "2025-2026", label: "2025-2026" },
  { value: "2026-2027", label: "2026-2027" },
];

export const DEFAULT_NATURE_OF_WORK_OPTIONS = [
  { value: "New Construction", label: "New Construction" },
  { value: "Renovation / Repair", label: "Renovation / Repair" },
  { value: "Maintenance", label: "Maintenance" },
];

export const DEFAULT_MASTER_CATEGORY_OPTIONS = [
  { value: "Rural Connectivity", label: "Rural Connectivity" },
  { value: "Water Conservation & Water Harvesting", label: "Water Conservation & Water Harvesting" },
  { value: "Land Development", label: "Land Development" },
  { value: "IBS - Agriculture & Allied", label: "IBS - Agriculture & Allied" },
];

export const DEFAULT_SUB_CATEGORY_OPTIONS = [
  { value: "Farm Pond", label: "Farm Pond" },
  { value: "Road Construction", label: "Road Construction" },
  { value: "Check Dam", label: "Check Dam" },
];

export const DEFAULT_WORKSITE_TYPE_OPTIONS = [
  { value: "Individual", label: "Individual" },
  { value: "Community", label: "Community" },
];

export const BENEFICIARY_TYPE_OPTIONS = [
  { value: "Individual", label: "Individual" },
  { value: "Community", label: "Community" },
];

export const DEFAULT_BENEFICIARY_CATEGORY_OPTIONS = [
  { value: "SC", label: "SC" },
  { value: "ST", label: "ST" },
  { value: "Others", label: "Others" },
];

export const DEFAULT_CONVERGENCE_DEPT_OPTIONS = [
  { value: "Agriculture", label: "Agriculture" },
  { value: "Forestry", label: "Forestry" },
  { value: "Horticulture", label: "Horticulture" },
  { value: "Animal Husbandry", label: "Animal Husbandry" },
];

export const NOC_RECEIVED_OPTIONS = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
  { value: "NA", label: "Not Applicable" },
];

export function getMasterOptions(
  arg1: any,
  type?: string,
  defaultOptions: Array<{ value: string; label: string }> = []
): Array<{ value: string; label: string }> {
  if (typeof arg1 === "string") {
    return []; 
  }
  const data = arg1;
  if (!type) return defaultOptions;
  if (data && data[type] && data[type].length > 0) {
    return data[type];
  }
  return defaultOptions;
}

