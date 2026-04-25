import { db } from "@/lib/db";
import { workStatus } from "@prisma/client";

export async function getApprovedActionPlans() {
  try {
    const actionPlans = await db.approvedActionPlanDetails.findMany({
      include: {
        WorksDetail: {
          include: {
            _count: {
              select: {
                workEstimateItems: true,
                workMeasurementBooks: true,
                workBillAbstracts: true,
              },
            },
          },
        },
      },
      orderBy: {
        activityCode: "asc",
      },
    });
    return actionPlans;
  } catch (error) {
    console.error("Failed to fetch approved action plans:", error);
    throw new Error("Failed to fetch approved action plans");
  }
}

export async function updateWorkStatus(workId: string, status: workStatus) {
  try {
    const updatedWork = await db.worksDetail.update({
      where: {
        id: workId,
      },
      data: {
        workStatus: status,
      },
    });
    return updatedWork;
  } catch (error) {
    console.error("Failed to update work status:", error);
    throw new Error("Failed to update work status");
  }
}
