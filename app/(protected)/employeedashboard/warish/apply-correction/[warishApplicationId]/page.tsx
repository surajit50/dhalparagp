import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ApplicationCorrectionRequestsClientPage from "./client-page";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PageProps {
  params: Promise<{
    warishApplicationId: string;
  }>;
}

async function ApplicationCorrectionRequestsContent({
  warishApplicationId,
}: {
  warishApplicationId: string;
}) {
  // Fetch application and details in parallel
  const [application, allDetails] = await Promise.all([
    db.warishApplication.findUnique({
      where: { id: warishApplicationId },
    }),
    db.warishDetail.findMany({
      where: { warishApplicationId },
    }),
  ]);

  if (!application) {
    notFound();
  }

  // Build tree structure from flat details
  const detailsMap = new Map<string, any>();
  const tree: any[] = [];

  // Create nodes and map by ID
  allDetails.forEach((detail) => {
    detailsMap.set(detail.id, { ...detail, children: [] });
  });

  // Build hierarchy
  allDetails.forEach((detail) => {
    const node = detailsMap.get(detail.id);
    if (detail.parentId) {
      const parent = detailsMap.get(detail.parentId);
      if (parent) parent.children.push(node);
    } else {
      tree.push(node);
    }
  });

  // Create enriched application object with tree structure
  const applicationWithDetails = {
    ...application,
    warishDetails: tree,
  };

  // Get all detail IDs from flat list
  const allDetailIds = allDetails.map((d) => d.id);

  // Fetch correction requests
  const requests = await db.warishModificationRequest.findMany({
    where: {
      OR: [{ warishApplicationId }, { warishDetailId: { in: allDetailIds } }],
    },
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

  // Normalize request types
  const mappedRequests = requests.map((req) => ({
    ...req,
    targetType: (req.targetType === "application" || req.targetType === "detail"
      ? req.targetType
      : "detail") as "application" | "detail",
    modifications: req.modifications as any, // Cast JSON to any
  }));

  return (
    <ApplicationCorrectionRequestsClientPage
      application={applicationWithDetails}
      initialRequests={mappedRequests}
      flatWarishDetails={allDetails}
    />
  );
}

function ApplicationLoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Skeleton className="h-9 w-32" />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-52" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-9 w-36" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-4 w-32" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center p-2 bg-muted/50 rounded"
              >
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-8 w-36" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mb-4">
        <Skeleton className="h-7 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default async function ApplicationCorrectionRequestsPage({
  params,
}: PageProps) {
  const { warishApplicationId } = await params;
  return (
    <Suspense fallback={<ApplicationLoadingSkeleton />}>
      <ApplicationCorrectionRequestsContent
        warishApplicationId={warishApplicationId}
      />
    </Suspense>
  );
}
