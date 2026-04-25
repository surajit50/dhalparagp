import { getWorkPhotos } from "@/action/work-photo-actions"; // ✅ Fixed uppercase "Import"
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import PhotoUploadClient from "./PhotoUploadClient";
 import { auth } from "@/auth"; // <-- Import your auth method (NextAuth, Clerk, etc.)

export default async function WorkPhotoUploadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  // ✅ Variable is called existingPhotos
  const existingPhotos = await getWorkPhotos(id);

  // 🔐 Dynamic Role Check (Example):
   const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          {/* Make sure the back link points to the correct admin table route */}
          <Link href="/admindashboard/work-manage/upload-photo">
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
      
      <PhotoUploadClient 
        worksDetailId={id} 
        existingPhotos={existingPhotos} // ✅ Passed the correct variable name
        isAdmin={true} // ✅ Since this is the admin dashboard route, this can be safely true
      />
    </div>
  );
}
