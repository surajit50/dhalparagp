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
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-start gap-3 md:gap-4">
        <Button variant="outline" size="icon" asChild className="mt-1 md:mt-1.5 shadow-sm hover:shadow hover:-translate-x-1 transition-all h-8 w-8 md:h-10 md:w-10 rounded-xl bg-white/80 backdrop-blur-sm border-slate-200">
          <Link href="/agencydashboard/works/photos">
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-violet-600">Upload Photos</h1>
          <p className="text-sm md:text-base font-medium text-slate-500 mt-1.5 md:mt-2 max-w-3xl leading-relaxed">
            {workDetail.ApprovedActionPlanDetails?.activityDescription}
          </p>
        </div>
      </div>


      <PhotoUploadClient worksDetailId={id} existingPhotos={existingPhotos} />
    </div>
  );
}
