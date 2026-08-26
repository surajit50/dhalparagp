"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { MapPin, Loader2 } from "lucide-react";
import { StreetLightDetailCard } from "./StreetLightDetailCard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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

export function StreetLightMapView() {
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: typeof import("react-leaflet")["MapContainer"];
    TileLayer: typeof import("react-leaflet")["TileLayer"];
    Marker: typeof import("react-leaflet")["Marker"];
    Popup: typeof import("react-leaflet")["Popup"];
    L: typeof import("leaflet");
  } | null>(null);
  const [selected, setSelected] = useState<LightMapPoint | null>(null);

  const { data, isLoading } = useSWR<{ lights: LightMapPoint[] }>(
    "/api/street-lights?limit=500",
    fetcher
  );

  const lights = (data?.lights ?? []).filter((l) => l.latitude && l.longitude);

  // Load Leaflet dynamically (client-side only)
  useEffect(() => {
    Promise.all([import("react-leaflet"), import("leaflet")]).then(
      ([rl, L]) => {
        // Fix default icon paths for Next.js
        // eslint-disable-next-line @typescript-eslint/no-require-imports
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
      }
    );
  }, []);

  const getMarkerIcon = (light: LightMapPoint, L: typeof import("leaflet")) => {
    const color =
      light.workingStatus === "NOT_WORKING"
        ? "#ef4444" // red
        : light.lightCondition === "REPAIR_REQUIRED"
          ? "#f59e0b" // amber
          : light.lightCondition === "DEFECTIVE"
            ? "#f97316" // orange
            : "#22c55e"; // green

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">
        <path fill="${color}" stroke="white" stroke-width="2"
          d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24S24 21 24 12C24 5.4 18.6 0 12 0z"/>
        <circle fill="white" cx="12" cy="12" r="4"/>
      </svg>`;

    return L.divIcon({
      html: svg,
      className: "",
      iconSize: [24, 36],
      iconAnchor: [12, 36],
      popupAnchor: [0, -36],
    });
  };

  if (isLoading || !MapComponents) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-muted/30 rounded-xl border border-border/50 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading map…</p>
      </div>
    );
  }

  if (lights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-muted/30 rounded-xl border border-border/50 gap-3">
        <MapPin className="w-10 h-10 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          No street lights with GPS coordinates found.
          <br />
          Add lights with GPS to see them on the map.
        </p>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, L } = MapComponents;

  // Center on mean coordinates
  const centerLat = lights.reduce((s, l) => s + (l.latitude ?? 0), 0) / lights.length;
  const centerLng = lights.reduce((s, l) => s + (l.longitude ?? 0), 0) / lights.length;

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {[
          { color: "#22c55e", label: "Working / Good" },
          { color: "#f59e0b", label: "Repair Required" },
          { color: "#f97316", label: "Defective" },
          { color: "#ef4444", label: "Not Working" },
        ].map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
        <span className="ml-auto font-medium text-foreground">
          {lights.length} light{lights.length !== 1 ? "s" : ""} on map
        </span>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm" style={{ height: "500px" }}>
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {lights.map((light) => (
            <Marker
              key={light.id}
              position={[light.latitude!, light.longitude!]}
              icon={getMarkerIcon(light, L)}
              eventHandlers={{ click: () => setSelected(light) }}
            >
              <Popup maxWidth={300}>
                <StreetLightDetailCard light={light as Parameters<typeof StreetLightDetailCard>[0]['light']} compact />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
