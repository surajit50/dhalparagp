import { Droplets, Plus, Map, Wrench, FileText, ClipboardList, Package, Users, Receipt } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Tubewell Management System | Dhalpara Gram Panchayat",
  description: "Complete management dashboard for tubewells, including registers, surveys, materials, and repair requests.",
};

export default function TubewellDashboardPage() {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background to-muted/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-blue-500/20 transform transition-transform hover:scale-105">
            <Droplets className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Tubewell Management
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              Dhalpara GP — Complete Water Asset System
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button asChild variant="outline" className="gap-2 rounded-xl h-11 px-5 border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors">
            <Link href="/admindashboard/tubewell/requests/add">
              <Plus className="w-4 h-4" />
              New Repair Request
            </Link>
          </Button>
          <Button asChild className="gap-2 rounded-xl h-11 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40">
            <Link href="/admindashboard/tubewell/register/add">
              <Plus className="w-5 h-5" />
              Add Tubewell
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Stats (Placeholder until backend integration) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        <div className="bg-card rounded-2xl p-6 border border-border/40 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Tubewells</p>
            <h3 className="text-2xl font-bold">142</h3>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border/40 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Repair Requests</p>
            <h3 className="text-2xl font-bold">12</h3>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border/40 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pending Work Orders</p>
            <h3 className="text-2xl font-bold">5</h3>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border/40 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Material Stock Items</p>
            <h3 className="text-2xl font-bold">28</h3>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out delay-150 fill-mode-both">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
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
                <span className="text-3xl transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 drop-shadow-sm">{item.emoji}</span>
                <span className="text-blue-500/0 group-hover:text-blue-500/80 transition-colors">↗</span>
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
  );
}
