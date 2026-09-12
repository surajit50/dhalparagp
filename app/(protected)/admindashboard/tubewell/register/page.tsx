import Link from "next/link";
import { Plus, Wrench, Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTubewells } from "@/action/tubewell";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { PageHeader } from "../_components/page-header";
import { StatsCard } from "../_components/stats-card";
import { ExportTubewellsButton } from "./export-button";

export const dynamic = "force-dynamic";

export default async function TubewellRegisterPage() {
  const tubewells = await getTubewells();

  const total = tubewells.length;
  const working = tubewells.filter((t) => t.condition === "WORKING").length;
  const defective = tubewells.filter((t) => t.condition === "DEFECTIVE").length;
  const abandoned = tubewells.filter((t) => t.condition === "ABANDONED").length;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHeader
          title="Tubewell Register"
          description="Complete register of all tubewell assets in Dhalpara Gram Panchayat. Track by Mouza, condition, and GPS location."
          icon="Wrench"
        >
          <div className="flex gap-3 flex-wrap">
            <ExportTubewellsButton tubewells={tubewells} />
            <Button
              asChild
              className="gap-2 rounded-xl px-6 py-6 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Link href="/admindashboard/tubewell/register/add">
                <Plus className="w-5 h-5" />
                Add Tubewell
              </Link>
            </Button>
          </div>
        </PageHeader>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            label="Total Tubewells Registered"
            value={total}
            color="slate"
            icon="Wrench"
          />
          <StatsCard
            label="Working Condition"
            value={working}
            color="emerald"
            icon="CheckCircle2"
          />
          <StatsCard
            label="Defective (Needs Repair)"
            value={defective}
            color="rose"
            icon="AlertTriangle"
            isWarning={defective > 0}
            description={
              defective > 0
                ? "Prioritize for maintenance"
                : "All in good condition"
            }
          />
          <StatsCard
            label="Abandoned"
            value={abandoned}
            color="amber"
            icon="AlertTriangle"
          />
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          {tubewells.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="p-4 bg-slate-50 rounded-full mb-6">
                <Wrench className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                No Tubewells Registered Yet
              </h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                The register is empty. Start by adding your first tubewell with GPS coordinates.
              </p>

              <Button asChild className="mt-8 gap-2 rounded-xl px-8 shadow-sm">
                <Link href="/admindashboard/tubewell/register/add">
                  <Plus className="h-4 w-4" />
                  Add First Tubewell
                </Link>
              </Button>
            </div>
          ) : (
            <div className="p-6">
              <DataTable columns={columns} data={tubewells} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
