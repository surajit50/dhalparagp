
import { EstimateItem, DrainParams, DrainParamKey } from "./types";

export function getQuantityFromDimensions(
  unit: string,
  nos: number,
  L: number,
  B: number,
  D: number
): number {
  const u = (unit || "m").toLowerCase();
  if (u === "m" || u === "rm") return nos * L;
  if (u === "sqm") return nos * L * B;
  if (u === "cum") return nos * L * B * D;
  if (u === "no" || u === "nos") return nos;
  return nos * L * B * D;
}

export function getDrainParamValue(dp: DrainParams, key: DrainParamKey): number {
  const v = dp[key];
  return typeof v === "string" ? Number(v) || 0 : 0;
}

export function resolveItemLBD(
  item: EstimateItem,
  dp: DrainParams
): { L: number; B: number; D: number } {
  const L = item.lengthParamKey
    ? getDrainParamValue(dp, item.lengthParamKey) || item.length
    : item.length;
  const B = item.breadthParamKey
    ? getDrainParamValue(dp, item.breadthParamKey) || item.breadth
    : item.breadth;
  const D = item.depthParamKey
    ? getDrainParamValue(dp, item.depthParamKey) || item.depth
    : item.depth;
  return { L, B, D };
}
