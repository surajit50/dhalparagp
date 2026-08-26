"use client";

import "leaflet/dist/leaflet.css";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Leaflet must be loaded client-side only (no SSR)
const StreetLightMapView = dynamic(
  () => import("@/components/street-lights/StreetLightMapView").then((m) => m.StreetLightMapView),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-96 bg-muted/30 rounded-xl border animate-pulse text-muted-foreground text-sm">
      Loading map…
    </div>
  )}
);

export default function MapPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admindashboard/street-lights" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Street Light Map</h1>
          <p className="text-sm text-muted-foreground">
            All GPS-surveyed lights on an interactive map
          </p>
        </div>
      </div>
      <StreetLightMapView />
    </div>
  );
}
