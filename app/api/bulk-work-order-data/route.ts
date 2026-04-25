import { NextRequest, NextResponse } from "next/server";
import { fetchWorkDataForBulkWorkOrder } from "@/action/fetchWorkDataForBulkWorkOrder";

export async function POST(req: NextRequest) {
  const { workIds } = await req.json();
  if (!Array.isArray(workIds)) {
    return NextResponse.json({ error: "workIds must be an array" }, { status: 400 });
  }
  try {
    const data = await fetchWorkDataForBulkWorkOrder(workIds);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch work order data" }, { status: 500 });
  }
}
