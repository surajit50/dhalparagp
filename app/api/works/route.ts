import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const works = await db.worksDetail.findMany({
      where: {
        
        tenderStatus: {
          not: "Cancelled"
        }
      },
      include: {
        nitDetails: true,
        biddingAgencies: {
          include: {
            agencydetails: true,
          },
        },
        AOCDetails: true,
        ApprovedActionPlanDetails: {
          include: {
            AggrementModel: true,
          },
        },
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
        _count: {
          select: {
            workEstimateItems: true,
            workMeasurementBooks: true,
            workBillAbstracts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(works);
  } catch (error) {
    console.error("Error fetching works:", error);
    return NextResponse.json(
      { error: "Failed to fetch works" },
      { status: 500 }
    );
  }
}
