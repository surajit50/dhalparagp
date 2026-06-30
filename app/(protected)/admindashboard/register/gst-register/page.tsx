import { db } from "@/lib/db";
import { GstTable } from "./gst-table";

async function getData() {
  // Fetch PaymentDetails that have CGST > 0 OR SGST > 0, including both deduction records
  return await db.paymentDetails.findMany({
    where: {
      OR: [
        { lessTdsCgst: { tdscgstAmt: { gt: 0 } } },
        { lessTdsSgst: { tdsSgstAmt: { gt: 0 } } },
      ],
    },
    orderBy: { billPaymentDate: "desc" },
    include: {
      lessTdsCgst: true,
      lessTdsSgst: true,
      WorksDetail: {
        include: {
          ApprovedActionPlanDetails: true,
          nitDetails: true,
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
      },
    },
  });
}

export type GstRegisterEntry = Awaited<ReturnType<typeof getData>>[number];

export default async function GSTRegisterPage() {
  const data = await getData();
  return (
    <div className="container mx-auto p-6">
      <GstTable data={data} />
    </div>
  );
}
