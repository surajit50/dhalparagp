import { Droplets, Plus, Map, Wrench, FileText, ClipboardList, Package, Users, Receipt, AlertTriangle, CheckCircle2, IndianRupee, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTubewellDashboardStats } from "@/action/tubewell";
import { formatCurrency } from "@/lib/utils";
import { StatsCard } from "./_components/stats-card";
import { PageHeader } from "./_components/page-header";

export const metadata = {
  title: "Tubewell Management System | Dhalpara Gram Panchayat",
  description: "Complete management dashboard for tubewells, including registers, surveys, materials, and repair requests.",
};

export const dynamic = "force-dynamic";

export default async function TubewellDashboardPage() {
  const stats = await getTubewellDashboardStats();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHeader
          title="Tubewell Management"
          description="Complete water asset system for Dhalpara Gram Panchayat — register, maintain, and track all tubewells."
          icon="Wrench"
        >
          <div className="flex gap-3 flex-wrap">
            <Button
              asChild
              variant="outline"
              className="gap-2 rounded-xl h-11 px-5 border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <Link href="/admindashboard/tubewell/requests/add">
                <Plus className="w-4 h-4" />
                New Repair Request
              </Link>
            </Button>
            <Button
              asChild
              className="gap-2 rounded-xl h-11 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40"
            >
              <Link href="/admindashboard/tubewell/register/add">
                <Plus className="w-5 h-5" />
                Add Tubewell
              </Link>
            </Button>
          </div>
        </PageHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            label="Total Tubewells"
            value={stats.totalTubewells}
            color="blue"
            icon="Wrench"
            description={`${stats.workingTubewells} working · ${stats.defectiveTubewells} defective`}
            isWarning={stats.defectiveTubewells > 0}
          />
          <StatsCard
            label="Active Repair Requests"
            value={stats.activeRepairRequests}
            color="amber"
            icon="AlertTriangle"
            description="Pending + Approved + WO Issued"
            isWarning={stats.activeRepairRequests > 5}
          />
          <StatsCard
            label="Pending Work Orders"
            value={stats.pendingWorkOrders}
            color="indigo"
            icon="ClipboardList"
            description={`${stats.completedThisMonth} completed this month`}
          />
          <StatsCard
            label="Active Materials"
            value={stats.totalMaterialTypes}
            color="emerald"
            icon="Package"
            description={`${stats.lowStockCount} low stock`}
            isWarning={stats.lowStockCount > 0}
          />
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard
            label="Active Mistris Onboard"
            value={stats.activeMistris}
            color="slate"
            icon="Users"
            description="Available for work order assignment"
          />
          <StatsCard
            label="Total Amount Collected"
            value={formatCurrency(stats.totalPaidAmount)}
            color="emerald"
            icon="IndianRupee"
            description="Across all paid bills"
          />
          <StatsCard
            label="Completed This Month"
            value={stats.completedThisMonth}
            color="emerald"
            icon="CheckCircle2"
            description="Work orders closed"
          />
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2 pl-1">
            <span className="text-blue-500">💧</span> System Modules
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { href: "/admindashboard/tubewell/register", label: "Full Register", emoji: "📋", desc: "All tubewell assets" },
              { href: "/admindashboard/tubewell/survey", label: "Field Survey", emoji: "📱", desc: "Mobile data collection" },
              { href: "/admindashboard/tubewell/materials", label: "Material Stock", emoji: "📦", desc: "Inventory management" },
              { href: "/admindashboard/tubewell/mistri", label: "Mistri Management", emoji: "👷", desc: "Worker directory" },
              { href: "/admindashboard/tubewell/labor-rate", label: "Labor Rates", emoji: "💰", desc: "Standardized costs" },
              { href: "/admindashboard/tubewell/requests", label: "Repair Requests", emoji: "🔧", desc: "Public & internal tickets" },
              { href: "/admindashboard/tubewell/work-orders", label: "Work Orders", emoji: "📝", desc: "Assignments & tracking" },
              { href: "/admindashboard/tubewell/bills", label: "Bills (Mustor)", emoji: "🧾", desc: "Financial processing" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col gap-2 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-5 hover:bg-blue-50/50 hover:border-blue-300/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between">
                  <span className="text-3xl transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 drop-shadow-sm">
                    {item.emoji}
                  </span>
                  <span className="text-blue-500/0 group-hover:text-blue-500/80 transition-colors">
                    ↗
                  </span>
                </div>
                <div className="mt-2">
                  <span className="block text-base font-semibold text-foreground/90 group-hover:text-blue-700 transition-colors">
                    {item.label}
                  </span>
                  <span className="text-sm text-muted-foreground mt-1 block">
                    {item.desc}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
