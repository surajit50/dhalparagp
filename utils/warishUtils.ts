import { WarishApplicationProps, WarishDetailProps } from "@/types";

export function createWarishDetailsMap(
  warishDetails: WarishDetailProps[]
): Map<string, WarishDetailProps> {
  const warishDetailsMap = new Map<string, WarishDetailProps>();

  warishDetails.forEach((detail) => {
    warishDetailsMap.set(detail.id, { ...detail, children: [] });
  });

  return warishDetailsMap;
}

export function organizeWarishDetailsHierarchy(
  warishDetailsMap: Map<string, WarishDetailProps>
): WarishDetailProps[] {
  const rootWarishDetails: WarishDetailProps[] = [];

  warishDetailsMap.forEach((detail) => {
    if (detail.parentId) {
      const parent = warishDetailsMap.get(detail.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(detail);
      }
    } else {
      rootWarishDetails.push(detail);
    }
  });

  return rootWarishDetails;
}

// Helper function to use both functions together
export function processWarishDetails(
  application: WarishApplicationProps
): WarishDetailProps[] {
  const warishDetailsMap = createWarishDetailsMap(application.warishDetails);
  return organizeWarishDetailsHierarchy(warishDetailsMap);
}
