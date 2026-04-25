import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/admin/correction-requests
 * Fetches all correction requests grouped by status
 */
export async function GET() {
    try {
        // Fetch all requests with different statuses in parallel
        const [pendingRequests, approvedRequests, rejectedRequests, stats] = await Promise.all([
            db.warishModificationRequest.findMany({
                where: { status: "pending" },
                orderBy: { requestedDate: "desc" },
                include: {
                    warishApplication: {
                        select: {
                            id: true,
                            acknowlegment: true,
                            applicantName: true,
                        },
                    },
                },
            }),
            db.warishModificationRequest.findMany({
                where: { status: "approved" },
                orderBy: { reviewedDate: "desc" },
                take: 20,
                include: {
                    warishApplication: {
                        select: {
                            id: true,
                            acknowlegment: true,
                            applicantName: true,
                        },
                    },
                },
            }),
            db.warishModificationRequest.findMany({
                where: { status: "rejected" },
                orderBy: { reviewedDate: "desc" },
                take: 20,
                include: {
                    warishApplication: {
                        select: {
                            id: true,
                            acknowlegment: true,
                            applicantName: true,
                        },
                    },
                },
            }),
            db.warishModificationRequest.groupBy({
                by: ["status"],
                _count: {
                    status: true,
                },
            }),
        ]);

        // Transform stats into a simple object
        const statsMap = stats.reduce(
            (acc, stat) => {
                acc[stat.status] = stat._count.status;
                return acc;
            },
            {} as Record<string, number>
        );

        return NextResponse.json({
            pendingRequests,
            approvedRequests,
            rejectedRequests,
            stats: statsMap,
        });
    } catch (error) {
        console.error("Error fetching correction requests:", error);
        return NextResponse.json(
            { error: "Failed to fetch correction requests" },
            { status: 500 }
        );
    }
}
