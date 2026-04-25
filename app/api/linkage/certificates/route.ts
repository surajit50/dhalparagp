import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getPaginationParams, apiResponse, apiError } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const { q, page, pageSize, skip } = getPaginationParams(req.url);

    const where: any = q
      ? {
        OR: [
          { certificateNo: { contains: q, mode: "insensitive" } },
          { application: { is: { applicantName: { contains: q, mode: "insensitive" } } } },
          { application: { is: { applicationNo: { contains: q, mode: "insensitive" } } } },
        ],
      }
      : {};

    const [items, total] = await Promise.all([
      db.linkageCertificate.findMany({
        where,
        include: { application: true, beneficiaries: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.linkageCertificate.count({ where }),
    ]);

    const mappedItems = items.map((item) => ({
      id: item.id,
      applicationNo: item.application?.applicationNo || "N/A",
      applicantName: item.application?.applicantName || "Unknown",
      linkedEntityName: item.application?.linkedEntityName || "Unknown",
      certificateNo: item.certificateNo,
      issueDate: item.issueDate,
      beneficiariesCount: item.beneficiaries?.length || 0,
      pdfUrl: item.pdfUrl,
    }));

    return apiResponse({
      items: mappedItems,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Linkage Certificates API Error:", error);
    return apiError("Failed to fetch certificates");
  }
}
