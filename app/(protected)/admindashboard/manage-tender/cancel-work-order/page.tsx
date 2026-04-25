import { db } from "@/lib/db";
import { CancelWorkOrderClient } from "./client";



async function getWorkOrders() {
  const workOrders = await db.workorderdetails.findMany({
    where: {
      Bidagency: {
        WorksDetail: {
          workStatus: {
            in: ["workorder", "yettostart"],
          },
          tenderStatus: {
            in: ["AOC"],
          },
        },
      },
    },
    include: {
      awardofcontractdetails: true,
      Bidagency: {
        include: {
          WorksDetail: {
            include: {
              AwardofContract: {
                include: {
                  workorderdetails: {
                    include: {
                      Bidagency: true,
                    },
                  },
                },
              },
            },
          },
          agencydetails: true,
        },
      },
    },
  });

  return workOrders;
}

export default async function CancelWorkOrderPage() {
  const workOrders = await getWorkOrders();

  return <CancelWorkOrderClient initialWorkOrders={workOrders} />;
}
