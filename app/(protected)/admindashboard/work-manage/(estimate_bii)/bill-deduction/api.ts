export async function fetchWorks() {
  const response = await fetch("/api/works");
  if (!response.ok) throw new Error("Failed to fetch works");
  return response.json();
}

export async function fetchBillAbstract(workId: string) {
  const response = await fetch(
    `/api/work-bill-abstracts?workId=${workId}&latest=true`,
  );
  if (!response.ok) throw new Error("Failed to fetch bill abstract");
  return response.json();
}

export async function fetchMBEntries(workId: string) {
  const response = await fetch(`/api/work-measurement-books?workId=${workId}`);
  if (!response.ok) throw new Error("Failed to fetch MB entries");
  return response.json();
}

export async function fetchBillDeduction(billAbstractId: string) {
  const response = await fetch(
    `/api/work-bill-deductions?billAbstractId=${billAbstractId}`,
  );
  if (!response.ok) throw new Error("Failed to fetch bill deduction");
  return response.json();
}

export async function saveBillDeduction(payload: any) {
  const response = await fetch("/api/work-bill-deductions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to save bill deduction");
  return response.json();
}

export async function updateBillDeduction(payload: any) {
  const response = await fetch("/api/work-bill-deductions", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to update bill deduction");
  return response.json();
}
