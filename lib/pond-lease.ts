/** West Bengal: 1 Acre = 100 Decimal (Satak) */
export const DECIMAL_PER_ACRE = 100;

export function parsePondAreaDecimal(
  area: string | number | null | undefined,
): number {
  if (area === null || area === undefined || area === "") return 0;

  const parsed =
    typeof area === "number" ? area : parseFloat(String(area).replace(/[^\d.]/g, ""));

  return Number.isFinite(parsed) ? parsed : 0;
}

export function decimalToAcre(areaDecimal: number): number {
  if (areaDecimal <= 0) return 0;
  return Math.round((areaDecimal / DECIMAL_PER_ACRE) * 10000) / 10000;
}

export function formatPondAreaAcre(areaDecimal: number): string {
  const acres = decimalToAcre(areaDecimal);
  if (acres <= 0) return "";
  const label = acres === 1 ? "Acre" : "Acres";
  return `${acres.toLocaleString("en-IN", { maximumFractionDigits: 4 })} ${label}`;
}

export function formatPondLocationDisplay(pond: {
  jlNo?: string | null;
  plotNo?: string | null;
  mouzaName?: string | null;
  location?: string | null;
  name?: string | null;
}): string {
  if (pond.mouzaName || pond.jlNo || pond.plotNo) {
    const parts: string[] = [];
    if (pond.mouzaName) parts.push(`Mouza: ${pond.mouzaName}`);
    if (pond.jlNo) parts.push(`JL No: ${pond.jlNo}`);
    if (pond.plotNo) parts.push(`Plot No: ${pond.plotNo}`);
    return parts.join(", ");
  }

  if (pond.location) return pond.location;
  return pond.name || "";
}

export function formatPondLocationWithArea(pond: {
  jlNo?: string | null;
  plotNo?: string | null;
  mouzaName?: string | null;
  location?: string | null;
  name?: string | null;
  area?: string | number | null;
}): string {
  const location = formatPondLocationDisplay(pond);
  const areaDecimal = parsePondAreaDecimal(pond.area);
  const acreText = formatPondAreaAcre(areaDecimal);

  if (acreText) {
    return `${location}\nTotal land area: ${acreText}`;
  }

  return location;
}

function buildPondLocation(mouzaName: string, jlNo: string, plotNo: string): string {
  const parts: string[] = [];
  if (mouzaName) parts.push(`Mouza: ${mouzaName}`);
  if (jlNo) parts.push(`JL No: ${jlNo}`);
  if (plotNo) parts.push(`Plot No: ${plotNo}`);
  return parts.join(", ");
}

export function normalizePondLocationFields(values: {
  mouzaName?: string;
  jlNo?: string;
  plotNo?: string;
}): { mouzaName: string; jlNo: string; plotNo: string; location: string } {
  const mouzaName = (values.mouzaName || "").trim();
  const jlNo = (values.jlNo || "").trim();
  const plotNo = (values.plotNo || "").trim();

  return {
    mouzaName,
    jlNo,
    plotNo,
    location: buildPondLocation(mouzaName, jlNo, plotNo),
  };
}

export function buildPondDbData(validated: {
  name: string;
  mouzaName?: string;
  jlNo?: string;
  plotNo?: string;
  area?: string;
  pondType: "LEASEABLE" | "PUBLIC";
  publicYearlyAmount?: number;
  resolutionNo?: string;
  resolutionDate?: Date | null;
  status: "AVAILABLE" | "LEASED" | "PUBLIC_USE";
}) {
  const locationFields = normalizePondLocationFields(validated);
  const isPublic = validated.pondType === "PUBLIC";

  return {
    name: validated.name,
    mouzaName: locationFields.mouzaName,
    jlNo: locationFields.jlNo,
    plotNo: locationFields.plotNo,
    location: locationFields.location,
    area: validated.area,
    pondType: validated.pondType,
    publicYearlyAmount: isPublic ? validated.publicYearlyAmount ?? null : null,
    resolutionNo: isPublic ? validated.resolutionNo?.trim() || null : null,
    resolutionDate: isPublic ? validated.resolutionDate ?? null : null,
    status: isPublic ? "PUBLIC_USE" : validated.status,
  };
}

/** Yearly amount ÷ pond area = rate per decimal (satak) */
export function calculateRatePerDecimal(
  yearlyAmount: number,
  areaDecimal: number,
): number {
  if (yearlyAmount <= 0 || areaDecimal <= 0) return 0;
  return Math.round((yearlyAmount / areaDecimal) * 100) / 100;
}

/** Pond area × rate per decimal = yearly lease amount */
export function calculateYearlyLeaseAmount(
  areaDecimal: number,
  ratePerDecimal: number,
): number {
  if (areaDecimal <= 0 || ratePerDecimal <= 0) return 0;
  return Math.round(areaDecimal * ratePerDecimal);
}

export function formatRatePerDecimalCalculation(
  yearlyAmount: number,
  areaDecimal: number,
  ratePerDecimal: number,
): string {
  return `₹${yearlyAmount.toLocaleString("en-IN")} ÷ ${areaDecimal} Decimal = ₹${ratePerDecimal.toLocaleString("en-IN")}/Decimal per year`;
}

export function formatYearlyFromRateCalculation(
  areaDecimal: number,
  ratePerDecimal: number,
  yearlyAmount: number,
): string {
  return `${areaDecimal} Decimal × ₹${ratePerDecimal.toLocaleString("en-IN")} = ₹${yearlyAmount.toLocaleString("en-IN")}/year`;
}
