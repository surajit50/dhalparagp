import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/tubewells — lightweight tubewell list for dropdowns (e.g. repair requests)
export async function GET() {
  try {
    const tubewells = await db.tubewell.findMany({
      orderBy: { tubewellNo: "asc" },
      select: {
        id: true,
        tubewellNo: true,
        mouza: true,
        mouzaId: true,
        condition: true,
        landmark: true,
      },
    });

    return NextResponse.json(tubewells);
  } catch (error) {
    console.error("GET /api/tubewells error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tubewells" },
      { status: 500 }
    );
  }
}
