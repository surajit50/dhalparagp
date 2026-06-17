import { db } from "@/lib/db"
import { EmdTable } from "./emd-table"

export default async function EarnestMoneyRegisterPage() {
  const emdList = await db.earnestMoneyRegister.findMany({
    include: {
      bidderName: {
        include: {
          workorderdetails: true,
          agencydetails: true,
          WorksDetail: {
            include: {
              nitDetails: true,
              biddingAgencies: {
                include: {
                  agencydetails: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container mx-auto p-6">
      <EmdTable data={emdList} />
    </div>
  )
}
