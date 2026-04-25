import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const emds = await db.earnestMoneyRegister.findMany({
      include: {
        bidderName: {
          include: {
            WorksDetail: {
              include: {
                nitDetails: true,
                biddingAgencies: {
                  include: {
                    agencydetails: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(emds);
  } catch (error) {
    console.error("Error fetching EMD data:", error);
    return NextResponse.json(
      { error: "Failed to fetch EMD data" },
      { status: 500 }
    );
  }
}
