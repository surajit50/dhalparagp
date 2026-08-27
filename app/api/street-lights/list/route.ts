import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/street-lights/list — lightweight list for citizen-facing dropdown
export async function GET() {
  try {
    const lights = await db.streetLight.findMany({
      select: {
        id: true,
        lightId: true,
        landmark: true,
        roadName: true,
        ward: true,
        latitude: true,
        longitude: true,
        mouza: {
          select: {
            mouzaName: true,
          },
        },
      },
      orderBy: { lightId: "asc" },
    });

    return NextResponse.json(lights);
  } catch (error) {
    console.error("GET /api/street-lights/list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch street lights" },
      { status: 500 }
    );
  }
}
