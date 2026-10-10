
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { Camera } from "lucide-react";
import { columns, type WorkTableData } from "./columns";
import { DataTable } from "@/components/data-table";

export default async function UploadWorkPhotosPage() {
  const whereClause: Prisma.WorksDetailWhereInput = {
    workStatus: { not: "billpaid" },
    tenderStatus: { notIn: "Cancelled"},
  };

  const works = await db.worksDetail.findMany({
    where: whereClause,
    include: {
      nitDetails: true,
      ApprovedActionPlanDetails: true,
      workPhotos: {
        select: {
          status: true,
          isVerified: true,
        },
      },
    },
    orderBy: [
      {
        ApprovedActionPlanDetails: {
          financialYear: "desc",
        },
      },
      {
        nitDetails: {
          memoDate: "desc",
        },
      },
      {
        nitDetails: {
          memoNumber: "desc",
        },
      },
      {
        workslno: "asc",
      },
    ],
  });

  // Convert Prisma records into the table data structure.
  const formattedData: WorkTableData[] = works.map((work) => {
    const photos = work.workPhotos;

    // Count each stage only when at least one photo is verified.
    const onset = photos.some(
      (photo) => photo.status === "onset" && photo.isVerified
    );

    const ongoing = photos.some(
      (photo) => photo.status === "ongoing" && photo.isVerified
    );

    const complete = photos.some(
      (photo) => photo.status === "complete" && photo.isVerified
    );

    const verifiedStages = [onset, ongoing, complete].filter(
      Boolean
    ).length;

    // Three stages: 0%, 33%, 67%, or 100%.
    const progress = Math.round((verifiedStages / 3) * 100);
    const allVerified = onset && ongoing && complete;

    return {
      id: work.id,
      financialYear:
        work.ApprovedActionPlanDetails?.financialYear ?? "N/A",
      description:
        work.ApprovedActionPlanDetails?.activityDescription ?? "N/A",
      nitNo: work.nitDetails?.memoNumber?.toString() ?? "N/A",
      nitDate: work.nitDetails?.memoDate
        ? new Date(work.nitDetails.memoDate).toLocaleDateString("en-IN")
        : "N/A",
      workSlNo: work.workslno,
      workStatus: work.workStatus,
      progress,
      allVerified,
    };
  });

  return (
    <div className="space-y-6 p-4">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Camera className="h-6 w-6" />
            Work Progress
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Upload and track work site photos and their verification status.
          </p>
        </div>
      </div>

      {/* Work progress table */}
      <div className="space-y-4">
        <DataTable columns={columns} data={formattedData} />
      </div>
    </div>
  );
}

