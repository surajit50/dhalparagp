import { db } from "@/lib/db"
import WorkOrderModificationTable from "./workorder/WorkOrderModificationTable"

export default async function WorkOrderModificationPage() {
  const workOrders = await db.worksDetail.findMany({
    where: {
      tenderStatus: "AOC",
    },
    include: {
      nitDetails: true,
      ApprovedActionPlanDetails: true,
      AwardofContract: true,
    },
  })

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Work Order Modification</h1>
      <p className="mt-2 text-sm text-gray-600">
        Modify existing work orders (AOC) such as memo details and delivery status.
      </p>
      <div className="mt-6">
        <WorkOrderModificationTable workOrders={workOrders as any[]} />
      </div>
    </div>
  )
}
