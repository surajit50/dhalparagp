import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

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

    return NextResponse.json(works, { headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching works:", error);
    return NextResponse.json(
      { error: "Failed to fetch works" },
      { status: 500, headers: corsHeaders }
    );
  }
}
