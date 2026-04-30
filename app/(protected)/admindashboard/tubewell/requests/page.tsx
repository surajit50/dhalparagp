import { getRepairRequests } from "@/action/tubewell";
import { db } from "@/lib/db";
import { Plus, Wrench } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { PageHeader } from "../_components/page-header";
import { StatsCard } from "../_components/stats-card";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const [requests, stats] = await Promise.all([
    getRepairRequests(),
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

  const statsData = [
    {
      label: "Pending Approval",
      value: statsMap["PENDING"] || 0,
      color: "amber" as const,
      icon: "AlertTriangle" as const,
    },
    {
      label: "Ready for W.O.",
      value: statsMap["APPROVED"] || 0,
      color: "blue" as const,
      icon: "Wrench" as const,
    },
    {
      label: "Work Issued",
      value: statsMap["WORK_ORDER_ISSUED"] || 0,
      color: "indigo" as const,
      icon: "Settings2" as const,
    },
    {
      label: "Completed",
      value: statsMap["COMPLETED"] || 0,
      color: "emerald" as const,
      icon: "CheckCircle2" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHeader
          title="Repair Requests"
          description="Manage and track tubewell repair requests from citizens. Approve requests to initiate work orders."
          icon="Wrench"
        >
          <Button
            asChild
            className="rounded-xl px-6 py-6 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Link
              href="/admindashboard/tubewell/requests/add"
              className="flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              <span className="font-semibold">Add Request</span>
            </Link>
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statsData.map((stat, i) => (
            <StatsCard
              key={i}
              label={stat.label}
              value={stat.value}
              color={stat.color}
              icon={stat.icon}
            />
          ))}
        </div>

        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <div className="p-6">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                  <Wrench className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  No Requests Found
                </h3>
                <p className="text-slate-500 max-w-xs mx-auto">
                  There are no repair requests at the moment.
                </p>
              </div>
            ) : (
              <DataTable columns={columns} data={requests} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
