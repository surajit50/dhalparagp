/* ---------------------------------- */
/* UNIT TYPES */
/* ---------------------------------- */

export const UNIT_TYPES = {
  WEIGHT: "weight",
  COUNT: "count",
  DIMENSION: "dimension",
  LUMPSUM: "lumpsum", // ⭐ NEW
} as const;

export type UnitType =
  (typeof UNIT_TYPES)[keyof typeof UNIT_TYPES];

/* ---------------------------------- */
/* SET LOOKUPS (Ultra Fast) */
/* ---------------------------------- */

const weightUnits = new Set([
  "mt",
  "ton",
  "tonne",
  "kg",
  "kilogram",
  "quintal",
]);

const countUnits = new Set([
  "no",
  "nos",
  "each",
  "piece",
  "pc",
  "set",
]);

// ⭐ NEW
const lumpSumUnits = new Set([
  "ls",
  "l.s",
  "lumpsum",
  "lump sum",
]);

/* ---------------------------------- */
/* HELPER */
/* ---------------------------------- */

export function getUnitType(unit?: string): UnitType {
  const u = unit?.toLowerCase().trim();

  if (!u) return UNIT_TYPES.DIMENSION;

  if (lumpSumUnits.has(u))
    return UNIT_TYPES.LUMPSUM;

  if (weightUnits.has(u))
    return UNIT_TYPES.WEIGHT;

  if (countUnits.has(u))
    return UNIT_TYPES.COUNT;

  return UNIT_TYPES.DIMENSION;
}
