"use server";

import { db } from "@/lib/db";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

export async function createTubewellLaborRate(data: {
    workType: string;
    rate: number;
    effectiveFrom?: Date;
    resolutionNumber?: string;
}) {
    try {
        const rate = await db.tubewellLaborRate.create({
            data: {
                ...data,
                effectiveFrom: data.effectiveFrom || new Date(),
            }
        });
        
        revalidateTag("tubewell-labor-rates", "max");
        revalidatePath("/admindashboard/tubewell/labor-rate");
        return rate;
    } catch (error) {
        console.error("Error creating labor rate:", error);
        throw new Error("Failed to create labor rate");
    }
}

export async function updateTubewellLaborRate(
    id: string,
    data: { 
        workType?: string;
        rate?: number;
        effectiveFrom?: Date;
        resolutionNumber?: string;
    }
) {
    try {
        const updated = await db.tubewellLaborRate.update({ where: { id }, data });
        revalidateTag("tubewell-labor-rates", "max");
        revalidatePath("/admindashboard/tubewell/labor-rate");
        return updated;
    } catch (error) {
        console.error("Error updating labor rate:", error);
        throw new Error("Failed to update labor rate");
    }
}

export async function deleteTubewellLaborRate(id: string) {
    try {
        const deleted = await db.tubewellLaborRate.delete({ where: { id } });
        revalidateTag("tubewell-labor-rates", "max");
        revalidatePath("/admindashboard/tubewell/labor-rate");
        return deleted;
    } catch (error) {
        console.error("Error deleting labor rate:", error);
        throw new Error("Failed to delete labor rate");
    }
}

export const getTubewellLaborRates = unstable_cache(
    async () => db.tubewellLaborRate.findMany({ 
        orderBy: { effectiveFrom: "desc" } 
    }),
    ["tubewell-labor-rates"],
    { tags: ["tubewell-labor-rates"] }
);

export async function getActiveTubewellLaborRates() {
    // Get the most recent active rate for each work type
    const allRates = await db.tubewellLaborRate.findMany({
        orderBy: { effectiveFrom: "desc" },
    });

    const activeRatesMap = new Map<string, number>();

    // Since it's ordered by most recent, the first one we encounter for a workType is the active one
    for (const r of allRates) {
        if (!activeRatesMap.has(r.workType) && r.effectiveFrom <= new Date()) {
            activeRatesMap.set(r.workType, r.rate);
        }
    }

    return Object.fromEntries(activeRatesMap);
}
