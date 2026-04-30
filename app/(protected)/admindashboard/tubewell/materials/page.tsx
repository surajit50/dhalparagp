import { getTubewellMaterials } from "@/action/tubewell";
import { db } from "@/lib/db";
import { Plus, PackageSearch } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { PageHeader } from "../_components/page-header";
import { StatsCard } from "../_components/stats-card";

export default async function MaterialsPage() {
  const [materials, lowStockCount] = await Promise.all([
    getTubewellMaterials(),
    db.tubewellMaterial.count({
      where: { stock: { lte: 10 } },
    }),
  ]);

  const totalItems = materials.length;
  const lowStock = lowStockCount;
  const activeCount = materials.filter((m) => m.isActive).length;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHeader
          title="Material Inventory"
          description="Maintain an accurate inventory of tubewell repair materials. Track stock levels and monitor low-stock alerts."
          icon="PackageSearch"
        >
          <Button
            asChild
            className="gap-2 rounded-xl px-6 py-6 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Link href="/admindashboard/tubewell/materials/add">
              <Plus className="h-5 w-5" />
              <span className="font-semibold">Add New Material</span>
            </Link>
          </Button>
        </PageHeader>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard
            label="Total Material Types"
            value={totalItems}
            color="slate"
            icon="Layers"
          />
          <StatsCard
            label="Low Stock Items"
            value={lowStock}
            color="rose"
            icon="PackageSearch"
            isWarning={lowStock > 0}
            description={
              lowStock > 0
                ? "Immediate attention required"
                : "Stock levels are healthy"
            }
          />
          <StatsCard
            label="Active Materials"
            value={activeCount}
            color="emerald"
            icon="PackageSearch"
          />
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          {materials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="p-4 bg-slate-50 rounded-full mb-6">
                <PackageSearch className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                No Materials Found
              </h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                Your inventory is currently empty. Start by adding your first
                tubewell material.
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
