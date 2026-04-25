import { Suspense } from "react"
import { db } from "@/lib/db"
import AdminCorrectionRequestsClientPage from "./client-page"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { CorrectionRequest, CorrectionRequestTargetType } from "./types"

async function AdminCorrectionRequestsContent() {
  // Get all requests with different statuses
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
  ])

  const statsMap = stats.reduce(
    (acc, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    },
    {} as Record<string, number>,
  )

  // Helper function to map targetType to proper type
  function mapTargetType(requests: any[]): CorrectionRequest[] {
    return requests.map((req) => ({
      ...req,
      targetType: req.targetType as CorrectionRequestTargetType,
      modifications: req.modifications as any, // Cast JSON to any to satisfy type
    }));
  }

  return (
    <AdminCorrectionRequestsClientPage
      initialPendingRequests={mapTargetType(pendingRequests)}
      initialApprovedRequests={mapTargetType(approvedRequests)}
      initialRejectedRequests={mapTargetType(rejectedRequests)}
      initialStats={statsMap}
    />
  )
}

function AdminLoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Skeleton className="h-8 w-80 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-96" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminCorrectionRequestsPage() {
  return (
    <Suspense fallback={<AdminLoadingSkeleton />}>
      <AdminCorrectionRequestsContent />
    </Suspense>
  )
}
