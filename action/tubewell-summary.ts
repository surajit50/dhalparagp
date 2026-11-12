"use server";

import { db } from "@/lib/db";

export interface MouzaTubewellSummary {
  mouza: string;
  total: number;
  working: number;
  defective: number;
  abandoned: number;
}

/** Return tubewell counts grouped by Mouza for the register dashboard. */
export async function getMouzaWiseTubewellSummary(): Promise<MouzaTubewellSummary[]> {
  const tubewells = await db.tubewell.findMany({
    select: { mouza: true, condition: true },
  });

  const summaries = new Map<string, MouzaTubewellSummary>();

  for (const tubewell of tubewells) {
    const mouza = tubewell.mouza?.trim() || "Unspecified";
    let summary = summaries.get(mouza);

    if (!summary) {
      summary = { mouza, total: 0, working: 0, defective: 0, abandoned: 0 };
      summaries.set(mouza, summary);
    }

    summary.total += 1;
    if (tubewell.condition === "WORKING") summary.working += 1;
    else if (tubewell.condition === "DEFECTIVE") summary.defective += 1;
    else if (tubewell.condition === "ABANDONED") summary.abandoned += 1;
  }

  return [...summaries.values()].sort((a, b) => a.mouza.localeCompare(b.mouza));
}
