import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/street-lights/stats
export async function GET() {
  try {
    const [
      totalLights,
      workingLights,
      notWorkingLights,
      defectiveLights,
      missingLights,
      repairRequired,
      totalMouzas,
      withPhoto,
      withGPS,
      openComplaints,
      ledLights,
    ] = await Promise.all([
      db.streetLight.count(),
      db.streetLight.count({ where: { workingStatus: "WORKING" } }),
      db.streetLight.count({ where: { workingStatus: "NOT_WORKING" } }),
      db.streetLight.count({ where: { lightCondition: "DEFECTIVE" } }),
      db.streetLight.count({ where: { lightCondition: "MISSING" } }),
      db.streetLight.count({ where: { lightCondition: "REPAIR_REQUIRED" } }),
      db.mouzaMaster.count(),
      db.streetLight.count({ where: { lightImageUrl: { not: null } } }),
      db.streetLight.count({
        where: { latitude: { not: null }, longitude: { not: null } },
      }),
      db.streetLightComplaint.count({
        where: { status: { notIn: ["RESOLVED", "CLOSED"] } },
      }),
      db.streetLight.count({ where: { lightType: "LED" } }),
    ]);

    // Total wattage
    const wattageResult = await db.streetLight.aggregate({
      _sum: { wattage: true },
    });

    // Recent installations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentAdditions = await db.streetLight.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    return NextResponse.json({
      totalLights,
      workingLights,
      notWorkingLights,
      defectiveLights,
      missingLights,
      repairRequired,
      totalMouzas,
      withPhoto,
      withoutPhoto: totalLights - withPhoto,
      withGPS,
      withoutGPS: totalLights - withGPS,
      openComplaints,
      ledLights,
      totalWattage: wattageResult._sum.wattage ?? 0,
      recentAdditions,
    });
  } catch (error) {
    console.error("GET /api/street-lights/stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
