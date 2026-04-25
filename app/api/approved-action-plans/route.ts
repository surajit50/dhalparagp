import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = (searchParams.get("search") || "").trim();
    const financialYear = (searchParams.get("financialYear") || "").trim();

    const skip = (page - 1) * pageSize;

    const where: any = { isPublish: false };
    if (search) {
      where.OR = [
        { activityName: { contains: search, mode: "insensitive" } },
        { activityDescription: { contains: search, mode: "insensitive" } },
        { schemeName: { contains: search, mode: "insensitive" } },
        { locationofAsset: { contains: search, mode: "insensitive" } },
        { activityCode: { contains: search, mode: "insensitive" } },
      ];
    }
    if (financialYear && financialYear !== "all") {
      where.financialYear = financialYear;
    }

    const [items, totalCount] = await Promise.all([
      db.approvedActionPlanDetails.findMany({
        where,
        orderBy: [{ financialYear: "desc" }, { activityCode: "asc" }],
        skip,
        take: pageSize,
      }),
      db.approvedActionPlanDetails.count({ where }),
    ]);

    return NextResponse.json({
      items,
      totalCount,
      hasMore: totalCount > skip + items.length,
      page,
      pageSize,
    });
  } catch (error: any) {
    console.error("/api/approved-action-plans GET error", error);
    return NextResponse.json({ error: "Failed to fetch approved plans" }, { status: 500 });
  }
}

