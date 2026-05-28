import { db } from "@/lib/db";
import { auth } from "@/auth";
import { verifyJWT } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyJWT(token);
      if (decoded) {
        user = decoded;
      }
    }

    if (!user) {
      const session = await auth();
      if (session?.user) {
        user = session.user;
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const worksDetailId = searchParams.get("worksDetailId");
    const after = searchParams.get("after");
    const year = searchParams.get("year");

    const isAdmin =
      user.role === "admin" || user.role === "superadmin";
    const isAgency = user.role === "agency";

    // Agency can only query a specific worksDetailId (their own work)
    if (!isAdmin && !(isAgency && worksDetailId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where: any = {};
    if (worksDetailId) {
      where.worksDetailId = worksDetailId;
    }
    if (after) {
      where.uploadedAt = { gt: new Date(after) };
    }
    if (year && year !== "all") {
      const selectedYear = parseInt(year);
      if (!isNaN(selectedYear)) {
        const startDate = new Date(selectedYear, 0, 1);
        const endDate = new Date(selectedYear + 1, 0, 1);
        where.WorksDetail = {
          nitDetails: {
            memoDate: {
              gte: startDate,
              lt: endDate,
            },
          },
        };
      }
    }

    const photos = await db.workPhoto.findMany({
      where,
      orderBy: { uploadedAt: "desc" },
      include: {
        WorksDetail: {
          include: {
            ApprovedActionPlanDetails: true,
            nitDetails: true,
          },
        },
        Bidagency: {
          include: {
            agencydetails: true,
          },
        },
      },
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error("Error fetching work photos:", error);
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}
