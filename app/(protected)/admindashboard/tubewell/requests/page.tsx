import { getRepairRequests } from "@/action/tubewell";
import { db } from "@/lib/db";
import {
  Plus,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

export const dynamic = "force-dynamic";

const colorMap = {
  yellow: { text: "text-yellow-600", bg: "bg-yellow-50" },
  blue: { text: "text-blue-600", bg: "bg-blue-50" },
  purple: { text: "text-purple-600", bg: "bg-purple-50" },
  green: { text: "text-green-600", bg: "bg-green-50" },
};

export default async function RequestsPage() {
  const [requests, stats] = await Promise.all([
    getRepairRequests(),
    db.tubewellRepairRequest.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  console.log("DATA:", requests); // 🔥 debug

  const statsMap = stats.reduce(
    (acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    },
    {} as Record<string, number>
  );

  const statsData = [
    {
      label: "Pending Approval",
      value: statsMap["PENDING"] || 0,
      color: "yellow",
      icon: AlertTriangle,
    },
    {
      label: "Ready for W.O.",
      value: statsMap["APPROVED"] || 0,
      color: "blue",
      icon: Wrench,
    },
    {
      label: "Work Issued",
      value: statsMap["WORK_ORDER_ISSUED"] || 0,
      color: "purple",
      icon: Settings2,
    },
    {
      label: "Completed",
      value: statsMap["COMPLETED"] || 0,
      color: "green",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-sm">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Wrench className="h-6 w-6 text-primary" />
              Repair Requests
            </h1>
          </div>

          <Button asChild>
            <Link href="/admindashboard/tubewell/requests/add">
              <Plus className="h-4 w-4" />
              Add Request
            </Link>
          </Button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statsData.map((stat, i) => {
            const c = colorMap[stat.color as keyof typeof colorMap];

            return (
              <div key={i} className="bg-white p-4 rounded-xl border">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <h2 className={`text-2xl font-bold ${c.text}`}>
                  {stat.value}
                </h2>
              </div>
            );
          })}
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border p-4">
          {requests.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              No data found
            </p>
          ) : (
            <DataTable columns={columns} data={requests} />
          )}
        </div>
      </div>
    </div>
  );
}
