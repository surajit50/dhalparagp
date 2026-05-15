// app/(protected)/admindashboard/manage-tender/awardofcontract/page.tsx

import { db } from "@/lib/db"
import AOCForm from "@/components/AOCForm"
import { FileCheck, FileText, Building2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function CreateAOCPage() {
  const works = await db.worksDetail.findMany({
    where: {
      tenderStatus: "FinancialEvaluation",
      AOCDetails: {
        none: {},
      },
    },
    include: {
      nitDetails: true,
      ApprovedActionPlanDetails: true,
      AOCDetails: true,
      biddingAgencies: {
        include: {
          agencydetails: true,
        },
      },
    },
  })

  const totalWorks = works.length
  const totalBids = works.reduce(
    (acc, work) => acc + (work.biddingAgencies?.length || 0),
    0
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

      {/* PAGE HEADER */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-orange-100">
            <FileCheck className="h-6 w-6 text-orange-700" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Award of Contract
            </h1>
            <p className="text-muted-foreground">
              Issue Acceptance of Contract (AOC) for financially evaluated tenders
            </p>
          </div>
        </div>

        <Badge variant="secondary" className="text-sm">
          {totalWorks} Works Pending
        </Badge>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Card className="border shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-orange-100">
              <FileText className="h-5 w-5 text-orange-700" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Works Ready for AOC
              </p>
              <p className="text-2xl font-bold">{totalWorks}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100">
              <Building2 className="h-5 w-5 text-green-700" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Total Bidders
              </p>
              <p className="text-2xl font-bold">{totalBids}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-100">
              <FileCheck className="h-5 w-5 text-amber-700" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Pending AOC Approval
              </p>
              <p className="text-2xl font-bold">{totalWorks}</p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* FORM CARD */}

      <Card className="border shadow-sm">
        <CardContent className="p-8">
          <AOCForm works={works} />
        </CardContent>
      </Card>

    </div>
  )
}
