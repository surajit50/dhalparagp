
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { Camera } from "lucide-react";
import { WorkTable, type WorkTableData } from "./work-table";

export default async function UploadWorkPhotosPage() {
  const whereClause: Prisma.WorksDetailWhereInput = {
    workStatus: { notIn: ["approved", "billpaid"] },
    tenderStatus: { not: "Cancelled" },
  };

  const works = await db.worksDetail.findMany({
    where: whereClause,
    include: {
      nitDetails: true,
      ApprovedActionPlanDetails: true,
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

  const formattedData: WorkTableData[] = works.map((work) => {
    const photos = work.workPhotos;

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

    const progress = Math.round((verifiedStages / 3) * 100);
    const allVerified = onset && ongoing && complete;

    const agencyNames = [
      ...new Set(
        (work.AwardofContract?.workorderdetails ?? [])
          .map((item) => item.Bidagency?.agencydetails?.name)
          .filter((name): name is string => Boolean(name?.trim()))
      ),
    ];

    return {
      id: work.id,

      // schemeName is the fund name
      fundName:
        work.ApprovedActionPlanDetails?.schemeName?.trim() ||
        "Unspecified Fund",

      financialYear:
        work.ApprovedActionPlanDetails?.financialYear ?? "N/A",

      description:
        work.ApprovedActionPlanDetails?.activityDescription ?? "N/A",

      nitId: work.nitDetailsId,

      nitNo: work.nitDetails?.memoNumber?.toString() ?? "N/A",

      nitDate: work.nitDetails?.memoDate
        ? new Date(work.nitDetails.memoDate).toLocaleDateString("en-IN")
        : "N/A",

      workSlNo: work.workslno,

      agencyName:
        agencyNames.length > 0
          ? agencyNames.join(", ")
          : "Not assigned",

      workStatus: work.workStatus,

      progress,
      allVerified,
    };
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3">
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight md:text-3xl">
          <Camera className="h-7 w-7" />
          Work Progress
        </h1>

        <p className="text-sm text-muted-foreground">
          Filter works by fund, NIT and agency. Upload and track
          work-site photos and their verification status.
        </p>
      </div>

      <WorkTable data={formattedData} />
    </div>
  );
}
