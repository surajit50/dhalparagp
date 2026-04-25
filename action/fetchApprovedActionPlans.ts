"use server"

import { db } from "@/lib/db"
import type { actionplanschema } from "@/schema/actionplan"
import type { ApprovedActionPlanDetails, Prisma } from "@prisma/client"
import type { z } from "zod"

interface FetchApprovedActionPlansResult {
  plans: ApprovedActionPlanDetails[]
  totalCount: number
  hasMore: boolean
}

export async function fetchApprovedActionPlans(
  page = 1,
  pageSize = 20,
  searchTerm = "",
  financialYear = "",
): Promise<FetchApprovedActionPlansResult> {
  try {
    const skip = (page - 1) * pageSize

    // Build where clause
    const whereConditions: Prisma.ApprovedActionPlanDetailsWhereInput[] = [{ isPublish: false }]

    // Add search conditions
    if (searchTerm) {
      whereConditions.push({
        OR: [
          { activityName: { contains: searchTerm, mode: "insensitive" } },
          { activityDescription: { contains: searchTerm, mode: "insensitive" } },
          { schemeName: { contains: searchTerm, mode: "insensitive" } },
          { locationofAsset: { contains: searchTerm, mode: "insensitive" } },
          { activityCode: { contains: searchTerm, mode: "insensitive" } },
        ],
      })
    }

    // Add financial year filter
    if (financialYear && financialYear !== "all") {
      whereConditions.push({
        financialYear: { equals: financialYear },
      })
    }

    const where: Prisma.ApprovedActionPlanDetailsWhereInput = {
      AND: whereConditions,
    }

    const [plans, totalCount] = await Promise.all([
      db.approvedActionPlanDetails.findMany({
        where,
        orderBy: [{ financialYear: "desc" }, { activityCode: "asc" }],
        skip,
        take: pageSize,
      }),
      db.approvedActionPlanDetails.count({ where }),
    ])

    const hasMore = totalCount > skip + plans.length

    return {
      plans,
      totalCount,
      hasMore,
    }
  } catch (error) {
    console.error("Error fetching approved action plans:", error)
    throw new Error("Failed to fetch approved action plans")
  }
}

export const updateActionPlan = async (id: string, data: z.infer<typeof actionplanschema>) => {
  try {
    const action = await db.approvedActionPlanDetails.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    })
    return { success: true, message: "Action Plan Updated Successfully" }
  } catch (error) {
    return { success: false, message: "Failed to Update Action Plan" }
  }
}
