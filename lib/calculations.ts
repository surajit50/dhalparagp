// ========== COMPACTION & WEIGHT CONSTANTS ==========
export const COMPACTION_OPTIONS = {
  normal: 1.1,
  loose: 1.15,
  river: 1.12,
  machine: 1.08,
  hand: 1.12,
} as const;

// Common unit weights for steel bars (kg per running meter)
export const STEEL_WEIGHTS = {
  "8mm": 0.395,
  "10mm": 0.617,
  "12mm": 0.888,
  "16mm": 1.580,
  "20mm": 2.466,
  "25mm": 3.853,
} as const;

// ========== MAIN CALCULATOR FUNCTION ==========
export function calcQty(
  unit: string,
  nos: number | string = 0,
  L: number | string = 0,
  B: number | string = 0,
  D: number | string = 0,
  compaction: number = 1,
  weightPerUnit: number = 1 // Added for PWD steel/weight calculations
): number {
  // Parse inputs to numbers safely
  // If a dimension is left empty (or undefined), default to 1 so the entire multiplication doesn't collapse to 0.
  // HOWEVER, if a user explicitly types "0" or 0, it should be honored to allow zeroing out calculations.
  const isEmpty = (val: number | string | undefined | null) => val === "" || val === null || val === undefined;

  const m_nos = isEmpty(nos) ? 1 : Number(nos);
  const m_l = isEmpty(L) ? 1 : Number(L);
  const m_b = isEmpty(B) ? 1 : Number(B);
  const m_d = isEmpty(D) ? 1 : Number(D);

  // Normalize unit string to avoid case-sensitivity or spacing bugs
  switch (unit.toLowerCase().trim()) {
    
    // --- 1. LINEAR MEASUREMENTS ---
    case "m":
    case "rm": // Running Meter
    case "rft": // Running Feet
      return m_nos * m_l;
    case "km": // Kilometers (Roadworks)
      return (m_nos * m_l) / 1000;

    // --- 2. AREAL MEASUREMENTS ---
    case "sqm":
    case "sqft":
      return m_nos * m_l * m_b;
    case "hectare": // Land clearing
      return (m_nos * m_l * m_b) / 10000;

    // --- 3. VOLUMETRIC MEASUREMENTS ---
    case "cum": // Cubic Meter
    case "cft": // Cubic Feet
      return m_nos * m_l * m_b * m_d;
    case "lit":
    case "liter": // Admixtures, Paints (if volume based)
      // Assuming L, B, D are in meters. 1 cum = 1000 liters
      return m_nos * m_l * m_b * m_d * 1000;

    // --- 4. WEIGHT MEASUREMENTS (Common for Steel, Structural Wood) ---
    case "kg":
      return m_nos * m_l * m_b * m_d * weightPerUnit;
    case "q":
    case "quintal": // 1 Quintal = 100 kg (Standard Indian PWD unit for steel)
      return (m_nos * m_l * m_b * m_d * weightPerUnit) / 100;
    case "mt":
    case "tonne": // 1 Metric Tonne = 1000 kg
      return (m_nos * m_l * m_b * m_d * weightPerUnit) / 1000;

    // --- 5. DISCRETE / COUNT ITEMS ---
    case "no":
    case "nos":
    case "each":
    case "set":
    case "pair":
      return isEmpty(nos) ? 0 : m_nos; // Discrete items should return 0 if nothing is entered, not 1.

    // --- 6. LUMPSUM / JOB ITEMS ---
    case "ls":
    case "job":
      return 1; // Always returns 1 for lumpsum billing

    // --- 7. TIME / LABOR (Mandays, Equipment Hire) ---
    case "day":
    case "manday": // Number of workers * Days (L)
    case "hr":
    case "month":
      return m_nos * m_l; 

    // --- 8. SPECIAL MATERIALS ---
    case "bags":
      // Math.ceil rounds up to the nearest whole bag.
      // 35.34 converts cum to cft factor based on your original logic.
      return Math.ceil(m_nos * m_l * m_b * m_d * compaction * 35.34);

    default:
      return 0;
  }
}
