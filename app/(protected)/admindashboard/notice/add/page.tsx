import StartWorkForm from "@/components/form/start-work-form";
import { db } from "@/lib/db";

export default async function NoticePage() {
  const works = await db.worksDetail.findMany({
    where: {
      tenderStatus: "AOC",
      workStatus: { not: "billpaid" },
      AwardofContract: {
        workorderdetails: {
          some: {
            Bidagency: {
              isNot: null,
            },
          },
        },
      },
    },
    include: {
      nitDetails: {
        select: {
          memoNumber: true,
          memoDate: true,
        },
      },
      ApprovedActionPlanDetails: {
        select: {
          activityDescription: true,
          activityCode: true,
          schemeName: true,
        },
      },
      AwardofContract: {
        include: {
          workorderdetails: {
            include: {
              Bidagency: {
                include: {
                  agencydetails: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      workslno: "desc",
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create Start Work Notice</h1>
        <StartWorkForm works={works} />
      </div>
    </div>
  );
}
