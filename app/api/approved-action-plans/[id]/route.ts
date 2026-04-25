import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  context: any
) {
  try {
    const id = context?.params?.id as string | undefined;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const plan = await db.approvedActionPlanDetails.findUnique({ where: { id } });
    if (!plan) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error("/api/approved-action-plans/[id] GET error", error);
    return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 });
  }
}

