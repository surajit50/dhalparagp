import { getWorkPhotos } from "@/action/work-photo-actions";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import PhotoUploadClient from "./PhotoUploadClient";

export default async function WorkPhotoUploadPage({
  params,
}: {
  // 1. Wrap the params type in a Promise
  params: Promise<{ id: string }>;
}) {
  // 2. You are already correctly awaiting it here
  const { id } = await params;

  const workDetail = await db.worksDetail.findUnique({
    where: { id },
    include: {
      ApprovedActionPlanDetails: true,
      nitDetails: true,
    },
  });

  if (!workDetail) {
    notFound();
  }

  const existingPhotos = await getWorkPhotos(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/agencydashboard/works/photos">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Photos</h1>
          <p className="text-muted-foreground mt-1">
            {workDetail.ApprovedActionPlanDetails?.activityDescription}
          </p>
        </div>
      </div>

      <PhotoUploadClient worksDetailId={id} existingPhotos={existingPhotos} />
    </div>
  );
}
