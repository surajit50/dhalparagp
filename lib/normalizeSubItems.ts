import { SubItem } from "@/app/(protected)/admindashboard/work-manage/(estimate_bii)/estimate-preparation/types";

export const normalizeSubItems = (
  subItems: Partial<SubItem>[]
): SubItem[] => {
  return subItems.map((item) => ({
    id: item.id ?? crypto.randomUUID(),
    description: item.description ?? "",
    quantity: item.quantity ?? 0,
    rate: item.rate ?? 0,
    unit: item.unit ?? "no",
    amount: item.amount ?? 0,
    nos: item.nos ?? 0,
    length: item.length ?? 0,
    breadth: item.breadth ?? 0,
    depth: item.depth ?? 0,
  }));
};
