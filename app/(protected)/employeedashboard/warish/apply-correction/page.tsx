import { Suspense } from "react";
import { db } from "@/lib/db";
import EnhancedCorrectionSearch from "@/components/warishcorrection/enhanced-correction-search";
import RecentRequestsList from "@/components/warishcorrection/recent-requests-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

async function CorrectionRequestsContent() {
  // Get recent requests for initial display
  const recentRequests = await db.warishModificationRequest.findMany({
    take: 10,
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
  });

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10">
        <EnhancedCorrectionSearch initialRequests={[]} initialApp={null} />

        {recentRequests.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <RecentRequestsList requests={recentRequests} />
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="w-full h-[400px] rounded-3xl bg-muted/20 animate-pulse mb-12" />

      <div className="space-y-4">
        <Skeleton className="h-8 w-48 mb-6" />
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function CorrectionRequestsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CorrectionRequestsContent />
    </Suspense>
  );
}
