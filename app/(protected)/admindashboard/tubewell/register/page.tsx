import Link from "next/link";
import { Plus, Wrench, AlertTriangle, CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTubewells, getMouzaWiseTubewellSummary } from "@/action/tubewell";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { ExportTubewellsButton, ExportMouzaSummaryButton } from "./export-button";
import { PageHeader } from "../_components/page-header";
import { StatsCard } from "../_components/stats-card";


export const dynamic = "force-dynamic";

export default async function TubewellRegisterPage() {
  const [tubewells, mouzaSummary] = await Promise.all([
    getTubewells(),
    getMouzaWiseTubewellSummary(),
  ]);

  const total = tubewells.length;
  const working = tubewells.filter((t: { condition: string; }) => t.condition === "WORKING").length;
  const defective = tubewells.filter((t: { condition: string; }) => t.condition === "DEFECTIVE").length;
  const abandoned = tubewells.filter((t: { condition: string; }) => t.condition === "ABANDONED").length;

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

        {/* MOUZA-WISE SUMMARY */}
        {mouzaSummary.length > 0 && (
          <div className="bg-white rounded-3xl border shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Mouza-wise Summary</h2>
                  <p className="text-sm text-slate-500">
                    {mouzaSummary.length} mouza{mouzaSummary.length > 1 ? "s" : ""} covered by the register
                  </p>
                </div>
              </div>
              <ExportMouzaSummaryButton rows={mouzaSummary} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mouzaSummary.map((m) => (
                <div key={m.mouza} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-800 truncate">{m.mouza}</h3>
                    <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-full px-2.5 py-1 shrink-0">
                      {m.total} total
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 py-2">
                      <p className="text-lg font-extrabold text-emerald-700">{m.working}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/80">Working</p>
                    </div>
                    <div className="rounded-xl bg-rose-50 border border-rose-100 py-2">
                      <p className="text-lg font-extrabold text-rose-700">{m.defective}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600/80">Defective</p>
                    </div>
                    <div className="rounded-xl bg-slate-100 border border-slate-200 py-2">
                      <p className="text-lg font-extrabold text-slate-700">{m.abandoned}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Abandoned</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
