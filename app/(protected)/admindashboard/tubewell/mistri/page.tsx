import { getMistris } from "@/action/tubewell";
import { db } from "@/lib/db";
import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { PageHeader } from "../_components/page-header";
import { StatsCard } from "../_components/stats-card";

export const dynamic = "force-dynamic";

export default async function MistriPage() {
  const [mistris, activeMistrisCount] = await Promise.all([
    getMistris(),
    db.mistri.count({
      where: { isActive: true },
    }),
  ]);

  const total = mistris.length;
  const activeCount = activeMistrisCount;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHeader
          title="Mistri Management"
          description="Register and manage mechanics for tubewell maintenance. Keep track of contact information and availability."
          icon="Users"
        >
          <Button
            asChild
            className="gap-2 rounded-xl px-6 py-6 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Link href="/admindashboard/tubewell/mistri/add">
              <Plus className="h-5 w-5" />
              <span className="font-semibold">Add New Mistri</span>
            </Link>
          </Button>
        </PageHeader>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatsCard
            label="Total Registered Mistris"
            value={total}
            color="slate"
            icon="Users"
          />
          <StatsCard
            label="Currently Active"
            value={activeCount}
            color="emerald"
            icon="UserCheck"
          />
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          {mistris.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="p-4 bg-slate-50 rounded-full mb-6">
                <Users className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                No Mistris Found
              </h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                No mechanics have been registered yet. Start by adding your
                first mistri.
              </p>

              <Button asChild className="mt-8 gap-2 rounded-xl px-8 shadow-sm">
                <Link href="/admindashboard/tubewell/mistri/add">
                  <Plus className="h-4 w-4" />
                  Add Mistri
                </Link>
              </Button>
            </div>
          ) : (
            <div className="p-6">
              <DataTable columns={columns} data={mistris} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
