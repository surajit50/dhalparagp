import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/street-lights/next-id?mouzaId=xxx
// Returns the next auto-generated Light ID for preview before form submission
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mouzaId = searchParams.get("mouzaId");

    if (!mouzaId) {
      return NextResponse.json({ error: "mouzaId is required" }, { status: 400 });
    }

    const mouza = await db.mouzaMaster.findUnique({ where: { id: mouzaId } });
    if (!mouza) {
      return NextResponse.json({ error: "Mouza not found" }, { status: 404 });
    }

    const existingCount = await db.streetLight.count({ where: { mouzaId } });
    const serial = String(existingCount + 1).padStart(4, "0");
    const sansadCode = mouza.sansadCode || "GEN";
    const nextId = `GP-SL-${mouza.mouzaCode}-${sansadCode}-${serial}`;

    return NextResponse.json({
      nextId,
      mouzaCode: mouza.mouzaCode,
      sansadCode,
      serial,
      existingCount,
    });
  } catch (error) {
    console.error("GET /api/street-lights/next-id error:", error);
    return NextResponse.json({ error: "Failed to generate next ID" }, { status: 500 });
  }
}
