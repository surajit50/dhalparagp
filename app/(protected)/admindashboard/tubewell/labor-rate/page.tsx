import { getTubewellLaborRates } from "@/action/tubewell-labor-rate";
import { Coins } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { AddRateDialog } from "./components/add-rate-dialog";
import { PageHeader } from "../_components/page-header";
import { StatsCard } from "../_components/stats-card";

export default async function LaborRatesPage() {
  const rates = await getTubewellLaborRates();

  const totalRates = rates.length;
  const currentRate = rates.length > 0 ? `₹${rates[0].rate}` : "Not Set";

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHeader
          title="Labor Rates"
          description="Track and update labor costs for tubewell maintenance. Maintain a history of rate changes for accurate billing."
          icon="Coins"
        >
          <div className="rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
            <AddRateDialog />
          </div>
        </PageHeader>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          <StatsCard
            label="Rate Revision History"
            value={totalRates}
            color="slate"
            icon="History"
          />
          <StatsCard
            label="Current Active Rate"
            value={currentRate}
            color="emerald"
            icon="Coins"
          />
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          {rates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="p-4 bg-slate-50 rounded-full mb-6">
                <Coins className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                No Labor Rates Defined
              </h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                No custom labor rates found. Start by defining your first custom
                rate for tubewell work.
              </p>
              <div className="mt-8">
                <AddRateDialog />
              </div>
            </div>
          ) : (
            <div className="p-6">
              <DataTable columns={columns} data={rates} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
