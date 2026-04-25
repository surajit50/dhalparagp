import { getBills } from "@/action/tubewell";
import { db } from "@/lib/db";
import { Plus, Receipt, IndianRupee, PieChart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

export default async function BillsPage() {
  const [bills, stats, pendingCount] = await Promise.all([
    getBills(),
    db.tubewellBill.aggregate({
      _sum: { netAmount: true },
      _count: { id: true },
    }),
    db.tubewellBill.count({
      where: { status: "GENERATED" },
    }),
  ]);

  const totalBills = stats._count.id;
  const totalAmount = stats._sum.netAmount || 0;
  const unpaidBills = pendingCount;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl border shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              Tubewell Bills (Mustor)
            </h1>
            <p className="text-slate-500 mt-2 max-w-2xl">
              Manage and track financial records for tubewell repairs. 
              Review generated bills, track payment statuses, and print official mustor rolls.
            </p>
          </div>

          <Button asChild className="gap-2 rounded-xl px-6 py-6 shadow-md hover:shadow-lg transition-all duration-200">
            <Link href="/admindashboard/tubewell/bills/create">
              <Plus className="h-5 w-5" />
              <span className="font-semibold">Generate New Bill</span>
            </Link>
          </Button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: "Total Bills Generated", value: totalBills, color: "slate", icon: Receipt },
            { 
              label: "Total Billed Amount", 
              value: `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(totalAmount)}`, 
              color: "emerald", 
              icon: IndianRupee 
            },
            { label: "Pending Payments", value: unpaidBills, color: "amber", icon: PieChart },
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
          {bills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="p-4 bg-slate-50 rounded-full mb-6">
                <Receipt className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No Bills Found</h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                No bills have been generated yet. Completed work orders will appear here once billed.
              </p>

              <Button asChild className="mt-8 gap-2 rounded-xl px-8 shadow-sm">
                <Link href="/admindashboard/tubewell/bills/create">
                  <Plus className="h-4 w-4" />
                  Generate Bill
                </Link>
              </Button>
            </div>
          ) : (
            <div className="p-6">
              <DataTable columns={columns} data={bills as any[]} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
