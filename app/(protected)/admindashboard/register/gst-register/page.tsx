import { db } from "@/lib/db";
import { GstTable } from "./gst-table";

async function getData() {
  return await db.tdsCgst.findMany({
    where: {
      tdscgstAmt: {
        gt: 0,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      PaymentDetails: {
        include: {
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
                          agencydetails: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
}

export default async function GSTRegisterPage() {
  const data = await getData();
  return (
    <div className="container mx-auto p-6">
      <GstTable data={data} />
    </div>
  );
}
