import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/street-lights/complaints  — all complaints (for complaints list page)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [complaints, total] = await Promise.all([
      db.streetLightComplaint.findMany({
        where,
        include: {
          streetLight: {
            select: {
              lightId: true,
              landmark: true,
              mouza: { select: { mouzaName: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.streetLightComplaint.count({ where }),
    ]);

    return NextResponse.json({ complaints, total, page, limit });
  } catch (error) {
    console.error("GET /api/street-lights/complaints error:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}
