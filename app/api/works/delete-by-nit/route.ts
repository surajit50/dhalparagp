import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { nitId } = await req.json();
    if (!nitId) {
      return NextResponse.json({ error: "Missing nitId" }, { status: 400 });
    }
    // Delete all works under the given nitId

    //update the isPublish to false one by one work

    const works = await db.worksDetail.findMany({
      where: { nitDetailsId: nitId },
      include:{
        ApprovedActionPlanDetails: true
      }
    });

    for (const work of works) {
      await db.worksDetail.update({
        where: { id: work.id },
        data: {
          ApprovedActionPlanDetails: {
            update: {
              isPublish: false
            }
          }
        }
      });
    }

    const deleted = await db.worksDetail.deleteMany({
      where: { nitDetailsId: nitId },
    });

    return NextResponse.json({ success: true, count: deleted.count });
  } catch (error) {
    console.error("Failed to delete works for nitId:", error);
    return NextResponse.json({ error: "Failed to delete works" }, { status: 500 });
  }
} 