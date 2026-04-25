import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { LinkageApplicationStatus } from "@prisma/client";
import { getPaginationParams, apiResponse, apiError } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const { q, page, pageSize, skip } = getPaginationParams(req.url);

    const where: any = {
      status: LinkageApplicationStatus.OWNERSHIP_VERIFIED,
    };

    if (q) {
      where.OR = [
        { applicationNo: { contains: q, mode: "insensitive" } },
        { applicantName: { contains: q, mode: "insensitive" } },
        { linkedEntityName: { contains: q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      db.linkageApplication.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
        include: { linkageApplicationBeneficiaries: true },
      }),
      db.linkageApplication.count({ where }),
    ]);

    return apiResponse({ items, total, page, pageSize });
  } catch (error) {
    console.error("Linkage Issue Ready API Error:", error);
    return apiError("Failed to fetch applications");
  }
}
