import { getRepairRequests } from "@/action/tubewell";
import { db } from "@/lib/db";
import { Plus, Wrench, AlertTriangle, CheckCircle2, Settings2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

export default async function RequestsPage() {
  const [requests, stats] = await Promise.all([
  fetch(`${https://www.dhalparagp.in/api/tubewell`, {
    next: { tags: ["repair-requests"] },
  }).then((res) => res.json()),

  db.tubewellRepairRequest.groupBy({
    by: ["status"],
    _count: { id: true },
  }),
]);

  const statsMap = stats.reduce(
    (acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    },
    {} as Record<string, number>,
  );

  const pending = statsMap["PENDING"] || 0;
  const approved = statsMap["APPROVED"] || 0;
  const inProgress = statsMap["WORK_ORDER_ISSUED"] || 0;
  const completed = statsMap["COMPLETED"] || 0;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl border shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              Repair Requests
            </h1>
            <p className="text-slate-500 mt-2 max-w-2xl">
              Efficiently manage and track citizen complaints for tubewell maintenance. 
              Monitor progress from initial log to final completion.
            </p>
          </div>

          <Button asChild className="gap-2 rounded-xl px-6 py-6 shadow-md hover:shadow-lg transition-all duration-200">
            <Link href="/admindashboard/tubewell/requests/add">
              <Plus className="h-5 w-5" />
              <span className="font-semibold">Log New Request</span>
            </Link>
          </Button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Pending Approval", value: pending, color: "yellow", icon: AlertTriangle },
            { label: "Ready for W.O.", value: approved, color: "blue", icon: Wrench },
            { label: "Work Issued", value: inProgress, color: "purple", icon: Settings2 },
            { label: "Completed", value: completed, color: "green", icon: CheckCircle2 },
          ].map((stat, i) => (
            <div key={i} className="group bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <h2 className={`text-3xl font-extrabold mt-2 text-${stat.color}-600 group-hover:scale-105 transition-transform duration-200`}>
                    {stat.value}
                  </h2>
                </div>
                <div className={`p-3 bg-${stat.color}-50 rounded-xl text-${stat.color}-600 group-hover:rotate-12 transition-transform duration-200`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="p-4 bg-slate-50 rounded-full mb-6">
                <Wrench className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                No Repair Requests Found
              </h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                Your request queue is currently empty. Start by logging a new citizen complaint.
              </p>

              <Button asChild className="mt-8 gap-2 rounded-xl px-8 shadow-sm">
                <Link href="/admindashboard/tubewell/requests/add">
                  <Plus className="h-4 w-4" />
                  Log Request
                </Link>
              </Button>
            </div>
          ) : (
            <div className="p-6">
              <DataTable columns={columns} data={requests} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
