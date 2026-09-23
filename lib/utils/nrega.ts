import type { LucideIcon } from "lucide-react";
import {
  FileText,
  CheckCircle,
  Hammer,
  AlertCircle,
} from "lucide-react";

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

// ============================================================
// Certificate Applicability (pure helper — safe for client & server)
// ============================================================

/**
 * Determines whether a certificate is applicable for a given work.
 * Returns "NOT_APPLICABLE" or "DRAFT" (the default applicable status).
 * Single source of truth used by both server actions and client previews.
 */
export function getCertificateApplicabilityStatus(
  certificateNumber: number,
  work: { beneficiaryType?: string | null; convergingDepartment?: string | null }
): "NOT_APPLICABLE" | "DRAFT" {
  // Certificate 5 (IBS) — not applicable for community works
  if (certificateNumber === 5 && work.beneficiaryType === "Community") {
    return "NOT_APPLICABLE";
  }
  // Certificate 7 (Convergence) — not applicable if no converging department
  if (
    certificateNumber === 7 &&
    (!work.convergingDepartment || work.convergingDepartment === "")
  ) {
    return "NOT_APPLICABLE";
  }
  return "DRAFT";
}

// ============================================================
// Certificate Progress Calculator
// ============================================================

export type CertificateProgress = {
  applicable: number;
  completed: number;
  pending: number;
  na: number;
  progress: number;
};

export function calculateCertificateProgress(
  certificates: Array<{ status: string }> | undefined | null
): CertificateProgress {
  if (!certificates || certificates.length === 0) {
    return { applicable: 0, completed: 0, pending: 0, na: 0, progress: 0 };
  }
  const na = certificates.filter((c) => c.status === "NOT_APPLICABLE").length;
  const applicable = certificates.length - na;
  const completed = certificates.filter(
    (c) => c.status === "COMPLETED" || c.status === "PRINTED"
  ).length;
  const pending = applicable - completed;
  const progress =
    applicable > 0 ? Math.round((completed / applicable) * 100) : 0;
  return { applicable, completed, pending, na, progress };
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
] as const;

export type NregaWork = {
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
  {
    value: "Water Conservation & Water Harvesting",
    label: "Water Conservation & Water Harvesting",
  },
  { value: "Land Development", label: "Land Development" },
  {
    value: "IBS - Agriculture & Allied",
    label: "IBS - Agriculture & Allied",
  },
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

/**
 * getMasterOptions: resolves dropdown options from master data or falls back to defaults.
 * Supports two call signatures:
 *   1. getMasterOptions(masterData, type, defaultOptions)
 *   2. getMasterOptions(type) — legacy string call, returns defaults
 */
export function getMasterOptions(
  arg1: any,
  type?: string,
  defaultOptions: Array<{ value: string; label: string }> = []
): Array<{ value: string; label: string }> {
  if (typeof arg1 === "string") {
    return defaultOptions;
  }
  const data = arg1;
  if (!type) return defaultOptions;
  if (data && data[type] && data[type].length > 0) {
    return data[type];
  }
  return defaultOptions;
}

// ============================================================
// Certificate Descriptions (short text per certificate number)
// NOTE: CERTIFICATE_STATUS_CONFIG is in nrega-ui.tsx (needs React)
// ============================================================

export const CERTIFICATE_DESCRIPTIONS: Record<number, string> = {
  1: "Certificate confirming that the proposed work is included in the Gram Panchayat Development Plan.",
  2: "Certificate of Gram Sabha approval for the proposed work.",
  3: "Certificate confirming administrative approval by competent authority.",
  4: "Certificate confirming the work falls under the permissible work list.",
  5: "Certificate for Individual Beneficiary Scheme (IBS) works only.",
  6: "Certificate confirming preparation and approval of Detailed Project Report (DPR).",
  7: "Certificate of convergence with another government department/scheme.",
  8: "Certificate confirming technical sanction by the competent engineer.",
};

// ============================================================
// Map a DB NregaWork record to WorkForm input values (edit page)
// ============================================================

export function mapNregaWorkToFormInput(work: Record<string, any>) {
  return {
    id: work.id,
    financialYear: work.financialYear ?? "",
    scheme: work.scheme ?? "VB-GRAMG",
    workName: work.workName ?? "",
    natureOfWork: work.natureOfWork ?? "",
    masterCategory: work.masterCategory ?? "",
    subCategory: work.subCategory ?? "",
    permissibleWorkSlNo: work.permissibleWorkSlNo ?? "",
    permissibleWorkDesc: work.permissibleWorkDesc ?? "",
    gramPanchayat: work.gramPanchayat ?? "",
    gramSansadName: work.gramSansadName ?? "",
    gramSansadNumber: work.gramSansadNumber ?? "",
    block: work.block ?? "",
    district: work.district ?? "",
    mouza: work.mouza ?? "",
    jlNumber: work.jlNumber ?? "",
    plotNumber: work.plotNumber ?? "",
    latitude: work.latitude ?? undefined,
    longitude: work.longitude ?? undefined,
    landArea: work.landArea ?? "",
    worksiteType: work.worksiteType ?? "",
    estimatedCost: work.estimatedCost ?? 0,
    wageComponent: work.wageComponent ?? 0,
    materialComponent: work.materialComponent ?? 0,
    wageMaterialRatio: work.wageMaterialRatio ?? "",
    vbGramgShare: work.vbGramgShare ?? 0,
    convergenceDeptShare: work.convergenceDeptShare ?? 0,
    totalEstimatedCost: work.totalEstimatedCost ?? 0,
    beneficiaryType: work.beneficiaryType ?? "",
    beneficiaryName: work.beneficiaryName ?? "",
    jobCardNumber: work.jobCardNumber ?? "",
    beneficiaryCategory: work.beneficiaryCategory ?? "",
    gramSabhaApprovalDate: work.gramSabhaApprovalDate
      ? new Date(work.gramSabhaApprovalDate).toISOString().slice(0, 10)
      : "",
    adminApprovalNumber: work.adminApprovalNumber ?? "",
    adminApprovalDate: work.adminApprovalDate
      ? new Date(work.adminApprovalDate).toISOString().slice(0, 10)
      : "",
    technicalSanctionNumber: work.technicalSanctionNumber ?? "",
    technicalSanctionDate: work.technicalSanctionDate
      ? new Date(work.technicalSanctionDate).toISOString().slice(0, 10)
      : "",
    dprNumber: work.dprNumber ?? "",
    dprDate: work.dprDate
      ? new Date(work.dprDate).toISOString().slice(0, 10)
      : "",
    convergingDepartment: work.convergingDepartment ?? "",
    convergingScheme: work.convergingScheme ?? "",
    convergenceCategory: work.convergenceCategory ?? "",
    technicalKnowledgeProvided: work.technicalKnowledgeProvided ?? "",
    nocReceived: work.nocReceived ?? "",
    nocMemoNumber: work.nocMemoNumber ?? "",
    nocDate: work.nocDate
      ? new Date(work.nocDate).toISOString().slice(0, 10)
      : "",
    workStatus: work.workStatus ?? "DRAFT",
    remarks: work.remarks ?? "",
  };
}

// ============================================================
// CSV row builder for works list export
// ============================================================

export function nregaWorkToCsvRow(
  work: Record<string, any>
): Record<string, string | number> {
  return {
    "Work ID": work.workId ?? "",
    "Work Name": work.workName ?? "",
    "Financial Year": work.financialYear ?? "",
    "Gram Panchayat": work.gramPanchayat ?? "",
    "Gram Sansad": work.gramSansadName ?? "",
    Block: work.block ?? "",
    District: work.district ?? "",
    Scheme: work.scheme ?? "",
    "Nature of Work": work.natureOfWork ?? "",
    "Master Category": work.masterCategory ?? "",
    "Sub Category": work.subCategory ?? "",
    "Estimated Cost": work.estimatedCost ?? 0,
    "Wage Component": work.wageComponent ?? 0,
    "Material Component": work.materialComponent ?? 0,
    "Total Estimated Cost": work.totalEstimatedCost ?? 0,
    "Wage-Material Ratio": work.wageMaterialRatio ?? "",
    "Beneficiary Type": work.beneficiaryType ?? "",
    "Beneficiary Name": work.beneficiaryName ?? "",
    "Work Status": work.workStatus ?? "",
    "Certificates Count": work.certificates?.length ?? 0,
  };
}
