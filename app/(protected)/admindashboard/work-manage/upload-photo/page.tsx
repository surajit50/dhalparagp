
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { WorkTable } from "./work-table";
import type { WorkTableData } from "./columns";

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
    const verifiedPhotos = work.workPhotos.filter(
      (photo) => photo.isVerified
    ).length;

    const totalPhotos = work.workPhotos.length;

    const progress =
      totalPhotos > 0
        ? Math.round((verifiedPhotos / totalPhotos) * 100)
        : 0;

    const agencyNames = [
      ...new Set(
        work.AwardofContract?.workorderdetails
          .map(
            (detail) =>
              detail.Bidagency?.agencydetails?.agencyName
          )
          .filter(
            (name): name is string =>
              typeof name === "string" && name.trim().length > 0
          ) ?? []
      ),
    ];

    return {
      id: work.id,
      fundName:
        work.ApprovedActionPlanDetails?.schemeName?.trim() ||
        "Unspecified Fund",
      financialYear:
        work.ApprovedActionPlanDetails?.financialYear ?? "N/A",
      description: work.workDescription ?? "N/A",
      nitId: work.nitDetails?.id ?? "",
      // Fix: memoNumber may be a number, but WorkTableData expects a string.
      nitNo: String(work.nitDetails?.memoNumber ?? "N/A"),
      nitDate: work.nitDetails?.memoDate
        ? new Date(work.nitDetails.memoDate).toLocaleDateString("en-IN")
        : "N/A",
      workSlNo: work.workslno,
      agencyName: agencyNames.join(", ") || "Not assigned",
      workStatus: String(work.workStatus),
      progress,
      allVerified: totalPhotos > 0 && verifiedPhotos === totalPhotos,
    };
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Work Photo Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Filter works by fund, NIT and agency, and track photo verification.
        </p>
      </div>

      <WorkTable data={tableData} />
    </div>
  );
}
