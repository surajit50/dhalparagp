import { db } from "@/lib/db";
import { WorkCompletionCertificate } from "./completation-certificate";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const _resolved = await searchParams;
  const { id } = _resolved;

  if (!id || typeof id !== "string") {
    return <div>Invalid work ID</div>;
  }

  const workdetails = await db.worksDetail.findUnique({
    where: {
      id: id,
    },
    include: {
      nitDetails: true,
      biddingAgencies: true,
      paymentDetails: {
        include: {
          lessIncomeTax: true,
          lessLabourWelfareCess: true,
          lessTdsCgst: true,
          lessTdsSgst: true,
          securityDeposit: true,
        },
      },
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
    },
  });

  if (!workdetails) {
    return <div>Work details not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <WorkCompletionCertificate initialPaymentDetails={workdetails} />
    </div>
  );
}
