import { useMemo } from "react";
import { EstimateItem } from "../types";

export const useEstimateCalculations = (items: EstimateItem[], contingency: number) => {
    return useMemo(() => {
        const itemTotal = items.reduce((sum, item) => sum + item.amount, 0);
        const gst = itemTotal * 0.18;
        const costExclLWC = itemTotal + gst;
        const lwc = costExclLWC * 0.01;
        const costInclLWC = costExclLWC + lwc;
        const finalCost = Math.round(costInclLWC + contingency);

        return {
            itemTotal,
            gst,
            costExclLWC,
            lwc,
            costInclLWC,
            finalCost,
        };
    }, [items, contingency]);
};
