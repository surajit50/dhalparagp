import { Lightbulb, Plus, Map } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StreetLightDashboard } from "@/components/street-lights/StreetLightDashboard";
import { StreetLightTable } from "@/components/street-lights/StreetLightTable";

export const metadata = {
  title: "Street Light Register | Dhalpara Gram Panchayat",
  description: "Digital asset register for all street lights organized Mouza-wise with GPS, photographs, and complaint management.",
};

export default function StreetLightPage() {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background to-muted/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 ring-1 ring-orange-500/20 transform transition-transform hover:scale-105">
            <Lightbulb className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Street Light Register
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Dhalpara GP — Digital Asset Register
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button asChild variant="outline" className="gap-2 rounded-xl h-11 px-5 border-orange-200 hover:bg-orange-50 hover:text-orange-700 transition-colors">
            <Link href="/admindashboard/street-lights/map">
              <Map className="w-4 h-4" />
              Map View
            </Link>
          </Button>
          <Button asChild className="gap-2 rounded-xl h-11 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/20 transition-all hover:shadow-lg hover:shadow-orange-500/40">
            <Link href="/admindashboard/street-lights/register/add">
              <Plus className="w-5 h-5" />
              Add Street Light
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        <StreetLightDashboard />
      </div>

      {/* Quick Links */}
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out delay-150 fill-mode-both">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <span className="text-orange-500">⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { href: "/admindashboard/street-lights/mouza", label: "Mouza Master", emoji: "🗺️", desc: "Manage zones" },
            { href: "/admindashboard/street-lights/register", label: "Full Register", emoji: "📋", desc: "All lights" },
            { href: "/admindashboard/street-lights/complaints", label: "Complaints", emoji: "📣", desc: "User reports" },
            { href: "/admindashboard/street-lights/reports", label: "Reports", emoji: "📊", desc: "Analytics" },
            { href: "/admindashboard/street-lights/survey", label: "Field Survey", emoji: "📱", desc: "Data collection" },
            { href: "/admindashboard/street-lights/map", label: "Map View", emoji: "📍", desc: "GIS layout" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col gap-2 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 hover:bg-orange-50/50 hover:border-orange-300/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between">
                <span className="text-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 drop-shadow-sm">{item.emoji}</span>
                <span className="text-orange-500/0 group-hover:text-orange-500/80 transition-colors">↗</span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-foreground/90 group-hover:text-orange-700 transition-colors">
                  {item.label}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5 block">
                  {item.desc}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Lights Table */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out delay-300 fill-mode-both">
        <div className="p-6 border-b border-border/40 bg-muted/20">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Street Lights</h2>
          <p className="text-sm text-muted-foreground mt-1">Overview of recently added or modified street lights</p>
        </div>
        <div className="p-6">
          <StreetLightTable />
        </div>
      </div>
    </div>
  );
}
