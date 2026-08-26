import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MouzaMasterSchema } from "@/schema/street-light";

// GET /api/mouza-master  — list all Mouzas with street light counts
export async function GET() {
  try {
    const mouzas = await db.mouzaMaster.findMany({
      orderBy: { mouzaName: "asc" },
      include: {
        _count: { select: { streetLights: true } },
        streetLights: {
          select: { workingStatus: true, lightCondition: true },
        },
      },
    });

    const result = mouzas.map((m) => ({
      ...m,
      totalLights: m._count.streetLights,
      activeLights: m.streetLights.filter((l) => l.workingStatus === "WORKING")
        .length,
      defectiveLights: m.streetLights.filter(
        (l) => l.lightCondition === "DEFECTIVE" || l.lightCondition === "MISSING"
      ).length,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/mouza-master error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mouza data" },
      { status: 500 }
    );
  }
}

// POST /api/mouza-master  — create new Mouza
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = MouzaMasterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const mouza = await db.mouzaMaster.create({ data: parsed.data });
    return NextResponse.json(mouza, { status: 201 });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Mouza code already exists" },
        { status: 409 }
      );
    }
    console.error("POST /api/mouza-master error:", error);
    return NextResponse.json(
      { error: "Failed to create mouza" },
      { status: 500 }
    );
  }
}
