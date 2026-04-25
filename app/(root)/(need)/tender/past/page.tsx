import { db } from "@/lib/db";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { FileText } from "lucide-react";

export default async function PastTenders() {
  const today = new Date();

  const tenders = await db.nitDetails.findMany({
    where: {
      endTime: { lt: today },
      publishhardcopy: { not: null },
    },
    orderBy: {
      endTime: "desc",
    },
    select: {
      id: true,
      memoNumber: true,
      publishingDate: true,
      endTime: true,
      publishhardcopy: true,
    },
  });

  return (
    <div className="min-h-screen bg-muted/30">

      {/* NIC Header */}
      <div className="bg-primary text-primary-foreground shadow-sm">
        <div className="container mx-auto px-4 py-4">

          <div className="flex items-center gap-3">

            <FileText className="h-6 w-6" />

            <div>
              <h1 className="text-xl font-bold">
                Notice Inviting Tender (NIT)
              </h1>

              <p className="text-sm opacity-90">
                Archived / Past Tender Notices
              </p>
            </div>

          </div>

        </div>
      </div>


      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-6xl">

        <div className="bg-white border shadow-sm rounded-lg">

          {/* Section Header */}
          <div className="border-b px-6 py-4 bg-muted/40">

            <h2 className="text-lg font-semibold">
              Past Tender List
            </h2>

            <p className="text-sm text-muted-foreground">
              Previously published and closed tender notices
            </p>

          </div>


          {/* Table */}
          <div className="p-6">

            <DataTable
              columns={columns}
              data={tenders}
            />

          </div>

        </div>

      </div>

    </div>
  );
}
