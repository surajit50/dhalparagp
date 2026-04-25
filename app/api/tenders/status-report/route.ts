import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fundFilter = searchParams.get("fund") || "all";

        const works = await db.worksDetail.findMany({
            include: {
                nitDetails: true,
                ApprovedActionPlanDetails: {
                    include: {
                        AggrementModel: true,
                    },
                },
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
                WorkOrderCancellation: true,
                _count: {
                    select: {
                        workEstimateItems: true,
                        workMeasurementBooks: true,
                    },
                },
            },
            // ✅ Sorted by activityCode of the related ApprovedActionPlanDetails
            orderBy: {
                ApprovedActionPlanDetails: {
                    activityCode: "asc",
                },
            },
        });

        // Filter based on scheme name (fund type) – maintains the sorted order
        let filteredWorks = works;
        if (fundFilter !== "all") {
            filteredWorks = works.filter((work) => {
                return work.ApprovedActionPlanDetails.schemeName === fundFilter;
            });
        }

        return NextResponse.json(filteredWorks);
    } catch (error) {
        console.error("Error fetching works for status report:", error);
        return NextResponse.json(
            { error: "Failed to fetch works" },
            { status: 500 }
        );
    }
}
