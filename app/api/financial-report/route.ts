import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const fyStart = url.searchParams.get("fyStart");
    const fyEnd = url.searchParams.get("fyEnd");

    const isAll = fyStart === "all" || !fyStart;

    let dateFilter: any = {};
    if (!isAll && fyStart && fyEnd) {
      const startDate = new Date(fyStart);
      const endDate = new Date(fyEnd);
      // Include works where work order memo date OR NIT memo date is in the financial year
      dateFilter = {
        OR: [
          {
            AwardofContract: {
              workordeermemodate: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
          {
            nitDetails: {
              memoDate: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        ],
      };
    }

    const works = await db.worksDetail.findMany({
      where: {
        nitDetails: {
          isSupply: false,
        },
        ...dateFilter,
      },
      include: {
        nitDetails: true,
        ApprovedActionPlanDetails: true,
        AwardofContract: {
          include: {
            workorderdetails: {
              include: {
                Bidagency: {
                  include: {
                    agencydetails: true,
                  },
                },
              },
            },
          },
        },
        biddingAgencies: {
          include: {
            agencydetails: true,
          },
        },
        paymentDetails: true,
      },
      orderBy: [
        {
          nitDetails: {
            memoDate: "asc",
          },
        },
        {
          workslno: "asc",
        },
      ],
    });

    return NextResponse.json(works);
  } catch (error: any) {
    console.error("Error fetching financial report data:", error);
    return NextResponse.json(
      { error: "Failed to fetch financial report data" },
      { status: 500 }
    );
  }
}