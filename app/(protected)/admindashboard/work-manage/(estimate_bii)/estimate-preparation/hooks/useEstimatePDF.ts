import { useState } from "react";
import {
    generateEstimatePDF,
    // EstimatePDFData 
} from "@/lib/pdf-generators/estimate-pdf";
import {
    generateAbstractPDF,
    // AbstractCostPDFData 
} from "@/lib/pdf-generators/abstract-cost-pdf";
import { numberToWords } from "@/lib/utils";
import { EstimateItem, ProjectInfo, Work } from "../types";

interface UseEstimatePDFProps {
    works: Work[];
    selectedWorkId: string;
    projectInfo: ProjectInfo;
    items: EstimateItem[];
    itemTotal: number;
    gst: number;
    costExclLWC: number;
    lwc: number;
    costInclLWC: number;
    contingency: number;
    finalCost: number;
}

export const useEstimatePDF = ({
    works,
    selectedWorkId,
    projectInfo,
    items,
    itemTotal,
    gst,
    costExclLWC,
    lwc,
    costInclLWC,
    contingency,
    finalCost,
}: UseEstimatePDFProps) => {
    const [loading, setLoading] = useState(false);
    const [pdfMode, setPdfMode] = useState<"detailed" | "abstract">("detailed");

    const generatePDF = async (modeOverride?: "detailed" | "abstract") => {
        if (items.length === 0) return;

        const currentMode =
            typeof modeOverride === "string" ? modeOverride : pdfMode;

        try {
            setLoading(true);
            const selectedWork = works.find((w) => w.id === selectedWorkId);
            const fund = selectedWork?.ApprovedActionPlanDetails?.schemeName || "";

            let pdfBytes;

            if (currentMode === "abstract") {
                const abstractPdfData = {
                    projectName: projectInfo.projectName,
                    projectLocation: projectInfo.location,
                    activityCode: String(projectInfo.projectCode),
                    fund: fund,
                    items: items.map((item) => ({
                        slNo: item.slNo,
                        schedulePageNo: item.schedulePageNo || "",
                        description: item.description,
                        quantity: item.quantity,
                        unit: item.unit,
                        rate: item.rate,
                        amount: item.amount,
                        subItems: item.subItems || [],
                    })),
                    itemwiseTotal: itemTotal,
                    gstAmount: gst,
                    costCivilWork: costExclLWC,
                    lwcAmount: lwc,
                    costCivilWorkIncl: costInclLWC,
                    contingencyAmount: contingency,
                    grandTotal: finalCost,
                    sayAmount: finalCost,
                    amountInWords: numberToWords(finalCost),
                };
                pdfBytes = await generateAbstractPDF(abstractPdfData);
            } else {
                const pdfData = {
                    projectName: projectInfo.projectName,
                    projectLocation: projectInfo.location,
                    activityCode: String(projectInfo.projectCode),
                    fund: fund,
                    items: items.map((item) => ({
                        slNo: item.slNo,
                        schedulePageNo: item.schedulePageNo || "",
                        description: item.description,
                        quantity: item.quantity,
                        unit: item.unit,
                        rate: item.rate,
                        amount: item.amount,
                        measurements: item.measurements || [],
                        subItems: item.subItems || [],
                    })),
                    itemwiseTotal: itemTotal,
                    gstAmount: gst,
                    costExclLWC: costExclLWC,
                    lwcAmount: lwc,
                    costInclLWC: costInclLWC,
                    contingency: contingency,
                    grandTotal: finalCost,
                    amountInWords: numberToWords(finalCost),
                    mode: currentMode,
                };
                pdfBytes = await generateEstimatePDF(pdfData);
            }

            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Estimate_${currentMode}_${projectInfo.projectCode || "Draft"}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(
                `Error generating PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        } finally {
            setLoading(false);
        }
    };

    return {
        generatePDF,
        loadingPDF: loading,
        pdfMode,
        setPdfMode,
    };
};
