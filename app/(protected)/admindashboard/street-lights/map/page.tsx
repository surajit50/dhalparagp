"use client";

import "leaflet/dist/leaflet.css";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Leaflet must be loaded client-side only (no SSR)
const StreetLightMapView = dynamic(
  () => import("@/components/street-lights/StreetLightMapView").then((m) => m.StreetLightMapView),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-[500px] bg-muted/30 rounded-2xl border animate-pulse text-muted-foreground text-sm">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p>Loading map…</p>
      </div>
    </div>
  )}
);

export default function MapPage() {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background to-muted/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div className="flex items-center gap-4">
          <Link
            href="/admindashboard/street-lights"
            className="w-10 h-10 bg-card rounded-xl flex items-center justify-center border border-border/40 shadow-sm hover:bg-muted transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Street Light Map
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              All GPS-surveyed lights on an interactive map
            </p>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
        <div className="p-1">
          <StreetLightMapView />
        </div>
      </div>
    </div>
  );
}
