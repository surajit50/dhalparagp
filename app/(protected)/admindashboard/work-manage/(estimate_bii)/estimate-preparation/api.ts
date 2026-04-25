
import { EstimateItem, ProjectInfo, Work, EstimateData } from "./types";

export const fetchWorks = async (): Promise<Work[]> => {
  try {
    const response = await fetch("/api/works");
    if (!response.ok) {
      throw new Error("Failed to fetch works");
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching works:", error);
    throw error;
  }
};

export const fetchExistingEstimate = async (workId: string): Promise<EstimateData | null> => {
  try {
    const response = await fetch(`/api/work-estimate-items?workId=${workId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch existing estimate");
    }
    const data = await response.json();
    
    if (data && data.items && data.items.length > 0) {
      return data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching existing estimate:", error);
    throw error;
  }
};

export const saveEstimate = async (
  workId: string,
  items: EstimateItem[],
  projectInfo: ProjectInfo,
  contingency: number
): Promise<EstimateItem[]> => {
  // Filter out any existing contingency items to avoid duplication
  const cleanItems = items.filter(
    (item) => item.slNo !== 9999 && item.description !== "Contingency"
  );

  // Add contingency item if applicable
  if (contingency > 0) {
    cleanItems.push({
      slNo: 9999,
      schedulePageNo: "",
      description: "Contingency",
      nos: 1,
      length: 0,
      breadth: 0,
      depth: 0,
      quantity: 1,
      unit: "LS",
      rate: contingency,
      amount: contingency,
      measurements: [],
      subItems: [],
      id: ""
    });
  }

  const response = await fetch("/api/work-estimate-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: cleanItems,
      workId,
      projectInfo,
      contingency,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to save estimate");
  }

  const result = await response.json();
  return result.data;
};
