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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-50/80 via-slate-50 to-slate-100/50 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-orange-400/10 blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[100px]" />
      </div>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <EmdTable data={emdList} />
      </div>
    </div>
  )
}
