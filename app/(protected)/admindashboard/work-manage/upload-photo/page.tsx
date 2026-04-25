import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { Camera } from "lucide-react";
import { VisibleDataTable } from "@/components/visible-data-table";
import { columns, WorkTableData } from "./columns";
import { DataTable } from "@/components/data-table";

export default async function UploadWorkPhotosPage() {
  const whereClause: Prisma.WorksDetailWhereInput = {
    workStatus: { not: "billpaid" },
    tenderStatus: { not: "Cancelled" },
  };

  const works = await db.worksDetail.findMany({
    where: whereClause,
    include: {
      nitDetails: true,
      ApprovedActionPlanDetails: true,
      workPhotos: {
        select: { status: true, isVerified: true },
      },
    },
    orderBy: [
      { ApprovedActionPlanDetails: { financialYear: "desc" } },
      { nitDetails: { memoDate: "desc" } },
      { nitDetails: { memoNumber: "desc" } },
      { workslno: "asc" },
    ],
  });

  // Map the raw Prisma database response to the clean Table shape
  const formattedData: WorkTableData[] = works.map((work) => {
    const photos = work.workPhotos;
    const onset = photos.some((p) => p.status === "onset" && p.isVerified);
    const ongoing = photos.some((p) => p.status === "ongoing" && p.isVerified);
    const complete = photos.some((p) => p.status === "complete" && p.isVerified);
    
    const progress = (Number(onset) + Number(ongoing) + Number(complete)) * 33;
    const allVerified = onset && ongoing && complete;

    return {
      id: work.id,
      financialYear: work.ApprovedActionPlanDetails?.financialYear || "N/A",
      description: work.ApprovedActionPlanDetails?.activityDescription || "N/A",
      nitNo: work.nitDetails?.memoNumber?.toString() || "N/A",
      nitDate: work.nitDetails?.memoDate ? new Date(work.nitDetails.memoDate).toLocaleDateString() : "N/A",
      workSlNo: work.workslno,
      workStatus: work.workStatus,
      progress: Math.round(progress),
      allVerified,
    };
  });

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Camera className="h-6 w-6" /> Work Progress
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Upload and track work site photos
          </p>
        </div>
      </div>

      {/* Render the VisibleDataTable */}
      <div className="space-y-4">
        <DataTable 
          columns={columns} 
          data={formattedData} 
         
        />
      </div>
    </div>
  );
}
