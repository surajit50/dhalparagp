"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import { MapPin, Loader2, Navigation2 } from "lucide-react";
import { fetcher } from "@/lib/utils";
import { StreetLightDetailCard } from "./StreetLightDetailCard";

interface LightMapPoint {
  id: string;
  lightId: string;
  mouza: { mouzaName: string; jlNo?: string };
  sansad?: string;
  landmark?: string;
  lightType?: string;
  wattage?: number;
  workingStatus: string;
  lightCondition: string;
  latitude?: number;
  longitude?: number;
  gpsAccuracy?: number;
  lightImageUrl?: string;
  poleImageUrl?: string;
  remarks?: string;
  poleNo?: string;
  roadName?: string;
  ward?: string;
  ownership?: string;
  installYear?: number;
  lastInspection?: string | null;
}

type MapComponents = {
  MapContainer: typeof import("react-leaflet")["MapContainer"];
  TileLayer: typeof import("react-leaflet")["TileLayer"];
  Marker: typeof import("react-leaflet")["Marker"];
  Popup: typeof import("react-leaflet")["Popup"];
  L: typeof import("leaflet");
};

export function StreetLightMapView() {
  const [MapComponents, setMapComponents] = useState<MapComponents | null>(null);
  const [selected, setSelected] = useState<LightMapPoint | null>(null);

  const { data, isLoading } = useSWR<{ lights: LightMapPoint[] }>(
    "/api/street-lights?limit=500",
    fetcher
  );

  const lights = useMemo(
    () => (data?.lights ?? []).filter((l) => l.latitude && l.longitude),
    [data]
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([import("react-leaflet"), import("leaflet")])
      .then(([rl, L]) => {
        if (cancelled) return;
        delete (L.default.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: "/leaflet/marker-icon-2x.png",
          iconUrl: "/leaflet/marker-icon.png",
          shadowUrl: "/leaflet/marker-shadow.png",
        });
        setMapComponents({
          MapContainer: rl.MapContainer,
          TileLayer: rl.TileLayer,
          Marker: rl.Marker,
          Popup: rl.Popup,
          L: L.default,
        });
      })
      .catch(() => {
        if (!cancelled) console.warn("Failed to load Leaflet map libraries");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const getMarkerIcon = useCallback(
    (light: LightMapPoint, L: MapComponents["L"]) => {
      const color =
        light.workingStatus === "NOT_WORKING"
          ? "#ef4444" // red
          : light.lightCondition === "REPAIR_REQUIRED"
          ? "#f59e0b" // amber
          : light.lightCondition === "DEFECTIVE"
          ? "#f97316" // orange
          : "#10b981"; // emerald

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="42" viewBox="0 0 24 36" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.3))">
          <path fill="${color}" stroke="#ffffff" stroke-width="2.5"
            d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24S24 21 24 12C24 5.4 18.6 0 12 0z"/>
          <g transform="translate(5.5, 5.5) scale(0.55)" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/>
            <path d="M9 18h6"/>
            <path d="M10 22h4"/>
          </g>
        </svg>`;

      return L.divIcon({
        html: svg,
        className: "transition-transform hover:scale-110",
        iconSize: [28, 42],
        iconAnchor: [14, 42],
        popupAnchor: [0, -42],
      });
    },
    []
  );

  const center = useMemo(() => {
    if (lights.length === 0) return [0, 0] as [number, number];
    const latSum = lights.reduce((s, l) => s + (l.latitude ?? 0), 0);
    const lngSum = lights.reduce((s, l) => s + (l.longitude ?? 0), 0);
    return [latSum / lights.length, lngSum / lights.length] as [number, number];
  }, [lights]);

  if (isLoading || !MapComponents) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="p-4 bg-background/50 rounded-full shadow-sm backdrop-blur-sm mb-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
          <p className="text-lg font-medium text-foreground">Loading interactive map…</p>
          <p className="text-sm text-muted-foreground mt-1">Initializing geospatial coordinates</p>
        </div>
      </div>
    );
  }

  if (lights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 gap-4 shadow-sm">
        <div className="p-5 bg-background/80 rounded-full shadow-sm">
          <Navigation2 className="w-12 h-12 text-muted-foreground/60" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-medium text-foreground">No GPS Data Available</p>
          <p className="text-muted-foreground text-sm max-w-md">
            There are no street lights with valid GPS coordinates to display. 
            Add coordinates to your street light entries to see them mapped here.
          </p>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, L } = MapComponents;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="relative">
        {/* Decorative background glow behind map */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-indigo-500/20 to-teal-500/20 rounded-[1.5rem] blur-xl opacity-70"></div>
        
        <div
          className="rounded-[1.25rem] overflow-hidden border border-border/60 shadow-xl relative z-10 bg-background"
          style={{ height: "calc(100vh - 280px)", minHeight: "550px" }}
        >
          <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }} className="z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {lights.map((light) => (
              <Marker
                key={light.id}
                position={[light.latitude!, light.longitude!]}
                icon={getMarkerIcon(light, L)}
                eventHandlers={{ click: () => setSelected(light) }}
              >
                <Popup maxWidth={320} className="rounded-xl overflow-hidden shadow-2xl p-0 border-0">
                  <StreetLightDetailCard
                    light={light as Parameters<typeof StreetLightDetailCard>[0]["light"]}
                    compact
                  />
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Floating Glass Legend */}
          <div className="absolute bottom-6 left-6 z-[400] pointer-events-none">
            <div className="bg-background/80 backdrop-blur-md border border-border/50 shadow-lg rounded-xl p-4 pointer-events-auto">
              <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status Legend</span>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {lights.length} LIGHTS
                </span>
              </div>
              <div className="flex flex-col gap-2.5 text-sm font-medium text-foreground">
                {[
                  { color: "#10b981", label: "Working / Good" },
                  { color: "#f59e0b", label: "Repair Required" },
                  { color: "#f97316", label: "Defective" },
                  { color: "#ef4444", label: "Not Working" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-inner ring-2 ring-background ring-offset-1"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
