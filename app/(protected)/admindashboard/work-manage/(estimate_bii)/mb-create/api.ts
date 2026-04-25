export async function fetchWorks() {
  const response = await fetch("/api/works");
  if (!response.ok) throw new Error("Failed to fetch works");
  return response.json();
}

export async function fetchEstimateItems(workId: string) {
  const response = await fetch(`/api/work-estimate-items?workId=${workId}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to fetch estimate items");
  const data = await response.json();
  const allItems = data.items || data || [];
  // Filter out Contingency item (slNo 9999)
  return allItems
    .filter(
      (item: any) =>
        !(item.description === "Contingency" && item.slNo === 9999),
    )
    .sort((a: any, b: any) => a.slNo - b.slNo);
}

export async function fetchMBEntries(workId: string) {
  const response = await fetch(`/api/work-measurement-books?workId=${workId}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to fetch MB entries");
  return response.json();
}

export async function deleteMBEntry(id: string) {
  const response = await fetch(`/api/work-measurement-books?id=${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to delete MB entry");
  }
  return true;
}

export async function saveMBEntries(workId: string, entries: any[]) {
  const response = await fetch("/api/work-measurement-books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workId: workId,
      entries: entries,
    }),
  });
  if (!response.ok) throw new Error("Failed to save entries");
  return response.json();
}

export async function updateMBEntries(entries: any[]) {
  const response = await fetch("/api/work-measurement-books", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries }),
  });
  if (!response.ok) throw new Error("Failed to update entries");
  return response.json();
}

export async function generateMBBookPDF(payload: any) {
  const res = await fetch("/api/mb/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to generate MB book PDF");
  }

  return res.blob();
}
