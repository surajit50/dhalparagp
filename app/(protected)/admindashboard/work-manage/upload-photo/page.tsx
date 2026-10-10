import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { WorkTable } from "./work-table";
import type { WorkTableData } from "./columns";

export const dynamic = "force-dynamic";

export default async function UploadWorkPhotosPage() {
  const user = await currentUser();
  const loginAgencyId = user?.agencyDetailsId;

  const works = await db.worksDetail.findMany({
    where: {
      workStatus: {
        notIn: ["approved", "billpaid"],
      },
      tenderStatus: {
        not: "Cancelled",
      },
      ...(loginAgencyId
        ? {
            AwardofContract: {
              is: {
                workorderdetails: {
                  some: {
                    Bidagency: {
                      is: {
                        agencyDetailsId: loginAgencyId,
                      },
                    },
                  },
                },
              },
            },
          }
        : {}),
    },
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
      workPhotos: true,
    },
    orderBy: {
      workslno: "desc",
    },
  });

  const tableData: WorkTableData[] = works.map((work) => {
    const agencyNames = [
      ...new Set(
        work.AwardofContract?.workorderdetails
          .map((detail) => detail.Bidagency?.agencydetails?.name?.trim())
          .filter((name): name is string => Boolean(name))
      ),
    ];

    const verifiedPhotos = work.workPhotos.filter(
      (photo) => photo.isVerified
    ).length;

    const totalPhotos = work.workPhotos.length;

    return {
      id: work.id,
      fundName:
        work.ApprovedActionPlanDetails?.schemeName?.trim() ||
        "Unspecified Fund",
      financialYear:
        work.ApprovedActionPlanDetails?.financialYear ?? "N/A",
      description:
        work.ApprovedActionPlanDetails?.activityDescription?.trim() ||
        "No work description",
      nitId: work.nitDetailsId,
      nitNo: work.nitDetails?.memoNumber ?? "N/A",
      nitDate: work.nitDetails?.memoDate
        ? new Date(work.nitDetails.memoDate).toLocaleDateString("en-IN")
        : "N/A",
      workSlNo: work.workslno,
      agencyName: agencyNames.join(", ") || "Agency not assigned",
      workStatus: String(work.workStatus),
      progress: totalPhotos
        ? Math.round((verifiedPhotos / totalPhotos) * 100)
        : 0,
      allVerified: totalPhotos > 0 && verifiedPhotos === totalPhotos,
    };
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Upload Work Photos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a fund, NIT, and agency to find work and manage its photos.
        </p>
      </div>

      <WorkTable data={tableData} />
    </div>
  );
}
