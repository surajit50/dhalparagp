import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { StreetLightSchema } from "@/schema/street-light";

// GET /api/street-lights  — list with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mouzaId = searchParams.get("mouzaId");
    const sansad = searchParams.get("sansad");
    const workingStatus = searchParams.get("workingStatus");
    const lightCondition = searchParams.get("lightCondition");
    const lightType = searchParams.get("lightType");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: Record<string, unknown> = {};
    if (mouzaId) where.mouzaId = mouzaId;
    if (sansad) where.sansad = { contains: sansad, mode: "insensitive" };
    if (workingStatus) where.workingStatus = workingStatus;
    if (lightCondition) where.lightCondition = lightCondition;
    if (lightType) where.lightType = lightType;

    const [lights, total] = await Promise.all([
      db.streetLight.findMany({
        where,
        include: { mouza: { select: { mouzaName: true, jlNo: true } } },
        orderBy: { lightId: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.streetLight.count({ where }),
    ]);

    return NextResponse.json({ lights, total, page, limit });
  } catch (error) {
    console.error("GET /api/street-lights error:", error);
    return NextResponse.json(
      { error: "Failed to fetch street lights" },
      { status: 500 }
    );
  }
}

// POST /api/street-lights  — create new street light
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = StreetLightSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Auto-generate Light ID: GP-SL-{MOUZACODE}-{SANSADCODE}-{SERIAL}
    const mouza = await db.mouzaMaster.findUnique({
      where: { id: data.mouzaId },
    });
    if (!mouza) {
      return NextResponse.json({ error: "Mouza not found" }, { status: 404 });
    }

    // Find existing lights for this mouza to find gaps in the sequence
    const existingLights = await db.streetLight.findMany({
      where: { mouzaId: data.mouzaId },
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
        break; // Gap found!
      }
    }

    const serial = String(nextSerialNum).padStart(4, "0");
    const sansadCode = mouza.sansadCode || "GEN";
    const lightId = `GP-SL-${mouza.mouzaCode}-${sansadCode}-${serial}`;

    const { lastInspection, bulbInstallationDate, ...rest } = data;

    const light = await db.streetLight.create({
      data: {
        ...rest,
        lightId,
        ...(lastInspection ? { lastInspection: new Date(lastInspection) } : {}),
        ...(bulbInstallationDate ? { bulbInstallationDate: new Date(bulbInstallationDate) } : {}),
      },
      include: { mouza: { select: { mouzaName: true } } },
    });

    return NextResponse.json(light, { status: 201 });
  } catch (error) {
    console.error("POST /api/street-lights error:", error);
    return NextResponse.json(
      { error: "Failed to create street light" },
      { status: 500 }
    );
  }
}
