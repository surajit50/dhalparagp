import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { workId, bidId, aocMemoNumber, aocMemoDate, bidAmount } = await request.json();

    if (!workId || !bidId || !aocMemoNumber || !aocMemoDate  || !bidAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const aoc = await db.aOC.create({
      data: {
        worksDetailId: workId,
        bidagencyid: bidId,
        aocmenonumber: aocMemoNumber,
        bidAmount: bidAmount,
        aocordeermemodate: new Date(aocMemoDate),
      },
    });

    return NextResponse.json({ success: true, aoc }, { status: 201 });
  } catch (error: any) {
    console.error("AOC API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}



