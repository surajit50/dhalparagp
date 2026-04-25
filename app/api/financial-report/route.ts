import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const fyStart = url.searchParams.get("fyStart");
  const fyEnd = url.searchParams.get("fyEnd");

  if (!fyStart || !fyEnd) {
    return NextResponse.json({ error: "Missing financial year range" }, { status: 400 });
  }

  const works = await db.worksDetail.findMany({
    where: {
      awardofContractId: { not: null },
      AwardofContract: {
        workordeermemodate: {
          gte: new Date(fyStart),
          lte: new Date(fyEnd),
        },
      },
      nitDetails: {
        isSupply: false,
      },
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
      paymentDetails: true,
    },
    orderBy: {
      workslno: "asc",
    },
  });

  return NextResponse.json(works);
}