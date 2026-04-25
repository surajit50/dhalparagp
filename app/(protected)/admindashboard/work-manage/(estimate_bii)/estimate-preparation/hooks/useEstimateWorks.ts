import { useState, useEffect, useCallback } from "react";
import { Work, ProjectInfo, EstimateData } from "../types";
import { fetchWorks, fetchExistingEstimate } from "../api";

export const useEstimateWorks = () => {
    const [works, setWorks] = useState<Work[]>([]);
    const [loadingWorks, setLoadingWorks] = useState(false);
    const [selectedWorkId, setSelectedWorkId] = useState<string>("");
    const [workSelected, setWorkSelected] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    const [existingEstimate, setExistingEstimate] = useState<EstimateData | null>(null);
    const [estimateExists, setEstimateExists] = useState(false);

    const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
        projectName: "",
        projectCode: "",
        location: "",
        preparedBy: "",
        date: new Date().toISOString().split("T")[0],
    });

    const loadWorks = useCallback(async () => {
        try {
            setLoadingWorks(true);
            const data = await fetchWorks();
            setWorks(data);
        } catch (error) {
            console.error("Error fetching works:", error);
        } finally {
            setLoadingWorks(false);
            setInitialLoad(false);
        }
    }, []);

    useEffect(() => {
        loadWorks();
    }, [loadWorks]);

    const loadEstimateForKey = useCallback(async (workId: string) => {
        try {
            const data = await fetchExistingEstimate(workId);
            if (data) {
                setExistingEstimate(data);
                setEstimateExists(true);
            } else {
                setExistingEstimate(null);
                setEstimateExists(false);
            }
        } catch (error) {
            console.error("Error fetching existing estimate:", error);
            setExistingEstimate(null);
            setEstimateExists(false);
        }
    }, []);

    const handleWorkSelection = useCallback((workId: string) => {
        setSelectedWorkId(workId);
        const selected = works.find((w) => w.id === workId);

        if (selected) {
            setProjectInfo({
                projectName:
                    selected.ApprovedActionPlanDetails?.activityDescription ||
                    `Work ${selected.workslno}`,
                projectCode: selected.ApprovedActionPlanDetails?.activityCode,
                location: selected.ApprovedActionPlanDetails?.locationofAsset || "",
                preparedBy: "Bappa Laha NS",
                date: new Date().toISOString().split("T")[0],
            });
            setWorkSelected(true);

            // Fetch existing estimate for this work
            loadEstimateForKey(workId);
        }
    }, [works, loadEstimateForKey]);

    const resetWorkSelection = useCallback(() => {
        setProjectInfo({
            projectName: "",
            projectCode: "",
            location: "",
            preparedBy: "",
            date: new Date().toISOString().split("T")[0],
        });
        // We intentionally don't reset selectedWorkId immediately causing UI flicker if used in resetForm usually
        // But aligning with original logic:
        // Original resetForm essentially resets projectInfo but assumes work might still be selected contextually? 
        // Actually original resetForm DOES NOT clear selectedWorkId, but sets fields to empty.

        // Whatever calls this hook's reset should probably handle UI state logic.
    }, []);

    return {
        works,
        loadingWorks,
        selectedWorkId,
        setSelectedWorkId,
        workSelected,
        projectInfo,
        setProjectInfo,
        handleWorkSelection,
        existingEstimate,
        estimateExists,
        setEstimateExists,
        loadExistingEstimate: loadEstimateForKey,
        initialLoad,
        resetWorkSelection
    };
};
