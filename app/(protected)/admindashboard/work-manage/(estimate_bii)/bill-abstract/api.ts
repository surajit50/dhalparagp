export async function fetchWorks() {
  const response = await fetch("/api/works");
  if (!response.ok) throw new Error("Failed to fetch works");
  return response.json();
}

export async function fetchEstimateItems(workId: string) {
  const response = await fetch(`/api/work-estimate-items?workId=${workId}`);
  if (!response.ok) throw new Error("Failed to fetch estimate items");
  const data = await response.json();
  const items = data.items || data || [];
  return items
    .filter((i: any) => !(i.description === "Contingency" && i.slNo === 9999))
    .sort((a: any, b: any) => a.slNo - b.slNo);
}

export async function fetchMBEntries(workId: string) {
  const response = await fetch(`/api/work-measurement-books?workId=${workId}`);
  if (!response.ok) throw new Error("Failed to fetch MB entries");
  return response.json();
}

export async function fetchBillAbstracts(workId: string) {
  const response = await fetch(`/api/work-bill-abstracts?workId=${workId}`);
  if (!response.ok) throw new Error("Failed to fetch bill abstracts");
  return response.json();
}

export async function saveBillAbstract(payload: any) {
  const response = await fetch("/api/work-bill-abstracts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to save bill abstract");
  return response.json();
}

export async function updateBillAbstract(payload: any) {
  const response = await fetch("/api/work-bill-abstracts", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to update bill abstract");
  return response.json();
}
