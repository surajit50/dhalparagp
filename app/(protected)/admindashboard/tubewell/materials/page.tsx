import { getTubewellMaterials } from "@/action/tubewell";
import { db } from "@/lib/db";
import { Plus, PackageSearch } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

export default async function MaterialsPage() {
  const [materials, lowStockCount] = await Promise.all([
    getTubewellMaterials(),
    db.tubewellMaterial.count({
      where: { stock: { lte: 10 } },
    }),
  ]);

  const totalItems = materials.length;
  const lowStock = lowStockCount;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl border shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <PackageSearch className="h-6 w-6 text-primary" />
              </div>
              Tubewell Material Stock
            </h1>
            <p className="text-slate-500 mt-2 max-w-2xl">
              Maintain an accurate inventory of tubewell repair materials. 
              Track stock levels, update unit rates, and monitor low-stock alerts.
            </p>
          </div>

          <Button asChild className="gap-2 rounded-xl px-6 py-6 shadow-md hover:shadow-lg transition-all duration-200">
            <Link href="/admindashboard/tubewell/materials/add">
              <Plus className="h-5 w-5" />
              <span className="font-semibold">Add New Material</span>
            </Link>
          </Button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: "Total Material Types", value: totalItems, color: "slate", icon: PackageSearch },
            { label: "Low Stock Items", value: lowStock, color: "rose", icon: PackageSearch, isWarning: lowStock > 0 },
            { label: "Active Materials", value: materials.filter(m => m.isActive).length, color: "emerald", icon: PackageSearch },
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
                  {stat.isWarning ? (
                    <div className="relative">
                      <stat.icon className="h-6 w-6" />
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                      </span>
                    </div>
                  ) : (
                    <stat.icon className="h-6 w-6" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          {materials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="p-4 bg-slate-50 rounded-full mb-6">
                <PackageSearch className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No Materials Found</h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                Your inventory is currently empty. Start by adding your first tubewell material.
              </p>

              <Button asChild className="mt-8 gap-2 rounded-xl px-8 shadow-sm">
                <Link href="/admindashboard/tubewell/materials/add">
                  <Plus className="h-4 w-4" />
                  Add Material
                </Link>
              </Button>
            </div>
          ) : (
            <div className="p-6">
              <DataTable columns={columns} data={materials} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
