import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const workId = req.nextUrl.searchParams.get("workId");
  if (!workId) return NextResponse.json({ error: "Missing workId" }, { status: 400 });

  const [acceptbi, worksDetail, lastAoc] = await Promise.all([
    db.bidagency.findMany({
      where: { worksDetailId: workId },
      select: {
        id: true,
        biddingAmount: true,
        agencydetails: true,
        WorksDetail: { include: { nitDetails: true } },
      },
    }),
    db.worksDetail.findUnique({
      where: { id: workId },
      include: {
        nitDetails: true,
        ApprovedActionPlanDetails: true,
        AwardofContract: true,
      },
    }),
    db.awardofContract.findFirst({
      orderBy: {
        id: "desc",
      },
      select: {
        workodermenonumber: true,
        workordeermemodate: true,
        WorksDetail: {
          take: 1,
          select: {
            workslno: true,
            ApprovedActionPlanDetails: {
              select: {
                activityDescription: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return NextResponse.json({ acceptbi, worksDetail, lastAoc });
} 
