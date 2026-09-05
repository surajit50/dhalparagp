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

    const existingLights = await db.streetLight.findMany({
      where: { mouzaId },
      select: { lightId: true },
    });

    const serials = existingLights
      .map((light) => {
        const parts = light.lightId.split("-");
        const serialStr = parts[parts.length - 1];
        return parseInt(serialStr, 10);
      })
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);

    let nextSerialNum = 1;
    for (const num of serials) {
      if (num === nextSerialNum) {
        nextSerialNum++;
      } else if (num > nextSerialNum) {
        break;
      }
    }

    const existingCount = existingLights.length;
    const serial = String(nextSerialNum).padStart(4, "0");
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
