import { db } from "@/lib/db";
import { SecurityDepositsPage } from "./SecurityDepositsPage";

export default async function Page() {
  const deposits = await db.secrutityDeposit.findMany({
    
    include: {
      PaymentDetails: {
        include: {
          WorksDetail: {
            include: {
              ApprovedActionPlanDetails:true,
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
      },
    },
  });

  return <SecurityDepositsPage deposits={deposits} />;
}
