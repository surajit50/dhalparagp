import { getTubewellLaborRates } from "@/action/tubewell-labor-rate";
import { Coins, HardHat } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { AddRateDialog } from "./components/add-rate-dialog";

export default async function LaborRatesPage() {
    const rates = await getTubewellLaborRates();

    const totalRates = rates.length;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl border shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              Labor Rates Management
            </h1>
            <p className="text-slate-500 mt-2 max-w-2xl">
              Track and update labor costs for tubewell maintenance. 
              Maintain a history of rate changes to ensure accurate billing and transparency.
            </p>
          </div>

          <div className="rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
            <AddRateDialog />
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: "Rate Revision History", value: totalRates, color: "slate", icon: HardHat },
            { 
                label: "Current Active Rate", 
                value: rates.length > 0 ? `₹${rates[0].rate}` : "Not Set",
                color: "emerald", 
                icon: Coins 
            },
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
          {rates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="p-4 bg-slate-50 rounded-full mb-6">
                <Coins className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No Labor Rates Defined</h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                No custom labor rates found. Start by defining your first custom rate for tubewell work.
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
