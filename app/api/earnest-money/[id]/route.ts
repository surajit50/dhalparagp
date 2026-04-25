import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const emd = await db.earnestMoneyRegister.findUnique({
      where: {
        id,
      },
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
    });

    if (!emd) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(emd);
  } catch (error) {
    console.error("[EMD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
