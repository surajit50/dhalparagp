import { getUnitType, UNIT_TYPES } from "@/constants/units";

/* ======================================================
   FORMULA TYPES
====================================================== */

export type FormulaType =
  | "LENGTH"
  | "AREA"
  | "VOLUME"
  | "COUNT"
  | "LUMPSUM"
  | "STEEL"
  | "EARTHWORK"
  | "ROAD"
  | "PAINT";

/* ======================================================
   FORMULA MAP
====================================================== */

export const FORMULA_MAP: Record<string, FormulaType> = {
  m: "LENGTH",
  rm: "LENGTH",

  sqm: "AREA",

  cum: "VOLUME",

  no: "COUNT",
  nos: "COUNT",

  ls: "LUMPSUM",

  kg: "STEEL",
  mt: "STEEL",

  earthwork: "EARTHWORK",
  road: "ROAD",
  paint: "PAINT",
};
