/**
 * Shared row data shape for budget-entry and CCER-entry tables.
 * `isHeader` marks category separator rows that are not editable/saveable.
 */
export type RowData = {
  id?: string;
  fundName: string;
  receipts: number;
  arthoOParikalpana: number;
  krishi: number;
  pranisampadBikash: number;
  siksha: number;
  janaswasthya: number;
  nariOSishuUnnoyan: number;
  samajkalyan: number;
  silpa: number;
  parikathamo: number;
  isHeader?: boolean;
  isSaving?: boolean;
};

/** All numeric sector keys (excludes receipts and meta fields). */
export const SECTOR_KEYS = [
  "arthoOParikalpana",
  "krishi",
  "pranisampadBikash",
  "siksha",
  "janaswasthya",
  "nariOSishuUnnoyan",
  "samajkalyan",
  "silpa",
  "parikathamo",
] as const;

export type SectorKey = (typeof SECTOR_KEYS)[number];

/** Returns the sum of all sector expenditure fields for one row. */
export function calculateRowTotal(r: RowData): number {
  return SECTOR_KEYS.reduce((sum, key) => sum + (Number(r[key]) || 0), 0);
}

/** Normalises known fund-name variants to a canonical form. */
export function normalizeFundName(raw: string | null | undefined): string {
  if (!raw) return "Other Schemes";
  const trimmed = raw.trim();
  const upper = trimmed.toUpperCase();

  if (upper.includes("15TH CFC") || upper.includes("CENTRAL FINANCE COMMISSION")) return "15th CFC";
  if (upper.includes("5TH SFC") || upper.includes("STATE FINANCE COMMISSION")) return "5th SFC";
  if (upper.includes("MGNREGA") || upper.includes("MGNREGS")) return "MGNREGS";
  if (upper.includes("SBM-G") || upper.includes("MNB/SBM") || upper.includes("SBM")) return "MNB/SBM";
  if (upper.includes("APAS")) return "APAS Fund";
  if (upper.includes("OWN FUND")) return "Own Fund";
  if (upper.includes("PGB-SFC") || upper.includes("PBG-SFC")) return "PBG-CFC"; 

  return trimmed;
}
