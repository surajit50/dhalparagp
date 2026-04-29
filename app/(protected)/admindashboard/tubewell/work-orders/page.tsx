import { getWorkOrders } from "@/action/tubewell";
import { db } from "@/lib/db";
import {
  Plus,
  Settings2,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WorkOrdersClient } from "./work-orders-client";

export const dynamic = "force-dynamic";

const colorMap = {
  slate: { text: "text-slate-600", bg: "bg-slate-50" },
  blue: { text: "text-blue-600", bg: "bg-blue-50" },
  green: { text: "text-green-600", bg: "bg-green-50" },
  rose: { text: "text-rose-600", bg: "bg-rose-50" },
};

export default async function WorkOrdersPage() {
  const [orders, stats, gpProfile, allMaterials] = await Promise.all([
    getWorkOrders(),
    db.tubewellWorkOrder.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    db.gPProfile.findFirst(),
    db.tubewellMaterial.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  console.log("ORDERS:", orders); // debug

  const statsMap = stats.reduce(
    (acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    },
    {} as Record<string, number>
  );

  const total = stats.reduce((acc, curr) => acc + curr._count.id, 0);
  const issued =
    (statsMap["ISSUED"] || 0) + (statsMap["IN_PROGRESS"] || 0);
  const completed = statsMap["COMPLETED"] || 0;

  const statsData = [
    {
      label: "Total Orders",
      value: total,
      color: "slate",
      icon: ClipboardList,
    },
    {
      label: "Active Orders",
      value: issued,
      color: "blue",
      icon: Settings2,
    },
    {
      label: "Completed",
      value: completed,
      color: "green",
      icon: CheckCircle2,
    },
    {
      label: "Cancelled",
      value: statsMap["CANCELLED"] || 0,
      color: "rose",
      icon: Settings2,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-sm">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Work Orders
          </h1>

          <Button asChild>
            <Link href="/admindashboard/tubewell/work-orders/create">
              <Plus className="h-4 w-4" />
              Issue Work Order
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
                <div className={`mt-2 p-2 ${c.bg} ${c.text} rounded-lg w-fit`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* TABLE */}
        {orders.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No work orders found
          </p>
        ) : (
          <div className="bg-white rounded-xl border p-4">
            <WorkOrdersClient
              orders={orders}
              gpProfile={gpProfile}
              allMaterials={allMaterials}
            />
          </div>
        )}
      </div>
    </div>
  );
}
