import { getWorkOrders } from "@/action/tubewell";
import { db } from "@/lib/db";
import { Plus, Settings2, CheckCircle2, ClipboardList } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WorkOrdersClient } from "./work-orders-client";

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

  const statsMap = stats.reduce(
    (acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    },
    {} as Record<string, number>,
  );

  const total = stats.reduce((acc, curr) => acc + curr._count.id, 0);
  const issued = (statsMap["ISSUED"] || 0) + (statsMap["IN_PROGRESS"] || 0);
  const completed = statsMap["COMPLETED"] || 0;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl border shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings2 className="h-6 w-6 text-primary" />
              </div>
              Work Orders
            </h1>
            <p className="text-slate-500 mt-2 max-w-2xl">
              Manage and monitor technical assignments. Issue new orders to mistris 
              and track material utilization and progress.
            </p>
          </div>

          <Button asChild className="gap-2 rounded-xl px-6 py-6 shadow-md hover:shadow-lg transition-all duration-200">
            <Link href="/admindashboard/tubewell/work-orders/create">
              <Plus className="h-5 w-5" />
              <span className="font-semibold">Issue New Work Order</span>
            </Link>
          </Button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Orders", value: total, color: "slate", icon: ClipboardList },
            { label: "Active Orders", value: issued, color: "blue", icon: Settings2 },
            { label: "Completed", value: completed, color: "green", icon: CheckCircle2 },
            { label: "Cancelled", value: statsMap["CANCELLED"] || 0, color: "rose", icon: Settings2 },
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
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border shadow-sm flex flex-col items-center justify-center py-24 text-center">
            <div className="p-4 bg-slate-50 rounded-full mb-6">
              <Settings2 className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No Work Orders Found</h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto">
              Your work order history is currently empty. Issue your first assignment to get started.
            </p>

            <Button asChild className="mt-8 gap-2 rounded-xl px-8 shadow-sm">
              <Link href="/admindashboard/tubewell/work-orders/create">
                <Plus className="h-4 w-4" />
                Issue Work Order
              </Link>
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
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

