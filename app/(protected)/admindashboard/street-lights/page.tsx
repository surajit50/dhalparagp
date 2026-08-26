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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Street Light Register</h1>
            <p className="text-sm text-muted-foreground">
              Dhalpara GP — Digital Asset Register
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/admindashboard/street-lights/map">
              <Map className="w-4 h-4" />
              Map View
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/admindashboard/street-lights/register/add">
              <Plus className="w-4 h-4" />
              Add Street Light
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <StreetLightDashboard />

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/admindashboard/street-lights/mouza", label: "Mouza Master", emoji: "🗺️" },
          { href: "/admindashboard/street-lights/register", label: "Full Register", emoji: "📋" },
          { href: "/admindashboard/street-lights/complaints", label: "Complaints", emoji: "📣" },
          { href: "/admindashboard/street-lights/reports", label: "Reports", emoji: "📊" },
          { href: "/admindashboard/street-lights/survey", label: "Field Survey", emoji: "📱" },
          { href: "/admindashboard/street-lights/map", label: "Map View", emoji: "🗺️" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 hover:bg-muted/50 hover:border-orange-200 transition-all hover:shadow-sm group"
          >
            <span className="text-xl">{item.emoji}</span>
            <span className="text-sm font-medium group-hover:text-orange-700 transition-colors">
              {item.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Recent Lights Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Street Light Register</h2>
        <StreetLightTable />
      </div>
    </div>
  );
}
