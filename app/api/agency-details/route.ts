import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Try direct AgencyDetails lookup first
    const agencyDirect = await db.agencyDetails.findUnique({
      where: { id },
      select: { name: true, contactDetails: true },
    });
    if (agencyDirect) {
      return NextResponse.json(agencyDirect, { status: 200 });
    }

    // Fallback: treat id as Bidagency.id and resolve linked agency
    const bid = await db.bidagency.findUnique({
      where: { id },
      include: {
        agencydetails: { select: { name: true, contactDetails: true } },
      },
    });

    if (bid?.agencydetails) {
      return NextResponse.json(bid.agencydetails, { status: 200 });
    }

    return NextResponse.json({ error: "Agency not found" }, { status: 404 });
  } catch (error: any) {
    console.error("Agency details API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}


