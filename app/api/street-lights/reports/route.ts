import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/street-lights/reports?type=mouza-wise&mouzaId=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "mouza-wise";
    const mouzaId = searchParams.get("mouzaId");
    const sansad = searchParams.get("sansad");

    switch (type) {
      case "mouza-wise": {
        const mouzas = await db.mouzaMaster.findMany({
          orderBy: { mouzaName: "asc" },
          include: {
            streetLights: {
              select: {
                lightId: true,
                workingStatus: true,
                lightCondition: true,
                lightType: true,
                wattage: true,
                lightImageUrl: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        });
        const report = mouzas.map((m) => ({
          mouzaName: m.mouzaName,
          jlNo: m.jlNo,
          gramSansad: m.gramSansad,
          total: m.streetLights.length,
          working: m.streetLights.filter((l) => l.workingStatus === "WORKING").length,
          notWorking: m.streetLights.filter((l) => l.workingStatus === "NOT_WORKING").length,
          defective: m.streetLights.filter((l) => l.lightCondition === "DEFECTIVE").length,
          missing: m.streetLights.filter((l) => l.lightCondition === "MISSING").length,
          led: m.streetLights.filter((l) => l.lightType === "LED").length,
          withPhoto: m.streetLights.filter((l) => l.lightImageUrl).length,
          withGPS: m.streetLights.filter((l) => l.latitude && l.longitude).length,
          totalWattage: m.streetLights.reduce((sum, l) => sum + (l.wattage ?? 0), 0),
        }));
        return NextResponse.json(report);
      }

      case "sansad-wise": {
        const lights = await db.streetLight.groupBy({
          by: ["sansad"],
          _count: { _all: true },
        });
        return NextResponse.json(lights);
      }

      case "working-status": {
        const where: Record<string, unknown> = {};
        if (mouzaId) where.mouzaId = mouzaId;
        const lights = await db.streetLight.findMany({
          where,
          select: {
            lightId: true,
            landmark: true,
            workingStatus: true,
            lightCondition: true,
            lightType: true,
            wattage: true,
            sansad: true,
            lastInspection: true,
            mouza: { select: { mouzaName: true } },
          },
          orderBy: { workingStatus: "asc" },
        });
        return NextResponse.json(lights);
      }

      case "defective": {
        const where: Record<string, unknown> = {
          lightCondition: { in: ["DEFECTIVE", "MISSING"] },
        };
        if (mouzaId) where.mouzaId = mouzaId;
        const lights = await db.streetLight.findMany({
          where,
          include: { mouza: { select: { mouzaName: true } } },
          orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(lights);
      }

      case "repair-required": {
        const lights = await db.streetLight.findMany({
          where: { lightCondition: "REPAIR_REQUIRED" },
          include: {
            mouza: { select: { mouzaName: true } },
            complaints: {
              where: { status: { notIn: ["RESOLVED", "CLOSED"] } },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        });
        return NextResponse.json(lights);
      }

      case "no-photo": {
        const lights = await db.streetLight.findMany({
          where: { lightImageUrl: null },
          include: { mouza: { select: { mouzaName: true } } },
          orderBy: { lightId: "asc" },
        });
        return NextResponse.json(lights);
      }

      case "gps-survey": {
        const where = mouzaId ? { mouzaId } : {};
        const [withGPS, withoutGPS, total] = await Promise.all([
          db.streetLight.count({
            where: { ...where, latitude: { not: null }, longitude: { not: null } },
          }),
          db.streetLight.count({
            where: { ...where, OR: [{ latitude: null }, { longitude: null }] },
          }),
          db.streetLight.count({ where }),
        ]);
        return NextResponse.json({ total, withGPS, withoutGPS, percentage: total > 0 ? Math.round((withGPS / total) * 100) : 0 });
      }

      case "led-total": {
        const ledLights = await db.streetLight.findMany({
          where: { lightType: "LED" },
          select: {
            lightId: true,
            wattage: true,
            sansad: true,
            workingStatus: true,
            mouza: { select: { mouzaName: true } },
          },
        });
        const totalWattage = ledLights.reduce((s, l) => s + (l.wattage ?? 0), 0);
        return NextResponse.json({ lights: ledLights, totalLED: ledLights.length, totalWattage });
      }

      case "new-installation": {
        const where: Record<string, unknown> = {};
        if (mouzaId) where.mouzaId = mouzaId;
        if (sansad) where.sansad = sansad;
        const lights = await db.streetLight.findMany({
          where,
          include: { mouza: { select: { mouzaName: true } } },
          orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(lights);
      }

      default:
        return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
    }
  } catch (error) {
    console.error("GET /api/street-lights/reports error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
