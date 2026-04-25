import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { musterRollIds } = await req.json();

    if (!Array.isArray(musterRollIds) || musterRollIds.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    // Update Muster Rolls
    await db.musterRoll.updateMany({
      where: {
        id: { in: musterRollIds },
      },
      data: {
        paymentStatus: "PAID",
      },
    });

    // Get the updated Muster Rolls to find their application IDs
    const updatedMusterRolls = await db.musterRoll.findMany({
      where: {
        id: { in: musterRollIds },
      },
      select: {
        applicationId: true,
      },
    });

    const applicationIds = updatedMusterRolls.map((mr) => mr.applicationId);

    // Update the associated applications
    await db.samabyathiApplication.updateMany({
      where: {
        id: { in: applicationIds },
      },
      data: {
        status: "PAID", // Changing application status to PAID
      },
    });

    return NextResponse.json({ success: true, updatedCount: musterRollIds.length });
  } catch (error) {
    console.error("Error updating muster roll status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
