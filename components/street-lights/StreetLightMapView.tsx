"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import { MapPin, Loader2 } from "lucide-react";
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
  const [selectedMouza, setSelectedMouza] = useState<string>("ALL");
  const [selectedSansad, setSelectedSansad] = useState<string>("ALL");

  const { data, isLoading } = useSWR<{ lights: LightMapPoint[] }>(
    "/api/street-lights?limit=10000",
    fetcher
  );

  const mappedLights = useMemo(() => {
    return (data?.lights ?? []).filter((l) => l.latitude && l.longitude);
  }, [data?.lights]);

  const uniqueMouzas = useMemo(() => {
    const mouzas = new Set(mappedLights.map((l) => l.mouza?.mouzaName).filter(Boolean));
    return Array.from(mouzas).sort();
  }, [mappedLights]);

  const uniqueSansads = useMemo(() => {
    let filteredForSansad = mappedLights;
    if (selectedMouza !== "ALL") {
      filteredForSansad = mappedLights.filter((l) => l.mouza?.mouzaName === selectedMouza);
    }
    const sansads = new Set(filteredForSansad.map((l) => l.sansad).filter(Boolean));
    return Array.from(sansads).sort();
  }, [mappedLights, selectedMouza]);

  const lights = useMemo(() => {
    let filtered = mappedLights;
    if (selectedMouza !== "ALL") {
      filtered = filtered.filter((l) => l.mouza?.mouzaName === selectedMouza);
    }
    if (selectedSansad !== "ALL") {
      filtered = filtered.filter((l) => l.sansad === selectedSansad);
    }
    return filtered;
  }, [mappedLights, selectedMouza, selectedSansad]);

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
          ? "#ef4444"
          : light.lightCondition === "REPAIR_REQUIRED"
            ? "#f59e0b"
            : light.lightCondition === "DEFECTIVE"
              ? "#f97316"
              : "#22c55e";

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
        <p className="text-muted-foreground text-sm text-center">
          No street lights with GPS coordinates found.
          <br />
          Add lights with GPS to see them on the map.
        </p>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, L } = MapComponents;

  return (
    <div className="flex flex-col flex-1 gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground flex-none">
        <div className="flex flex-wrap gap-4">
          {[
            { color: "#22c55e", label: "Working / Good" },
            { color: "#f59e0b", label: "Repair Required" },
            { color: "#f97316", label: "Defective" },
            { color: "#ef4444", label: "Not Working" },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            className="border border-border/50 rounded-md bg-background text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring"
            value={selectedMouza}
            onChange={(e) => {
              setSelectedMouza(e.target.value);
              setSelectedSansad("ALL"); // Reset sansad when mouza changes
            }}
          >
            <option value="ALL">All Mouzas</option>
            {uniqueMouzas.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select 
            className="border border-border/50 rounded-md bg-background text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring"
            value={selectedSansad}
            onChange={(e) => setSelectedSansad(e.target.value)}
          >
            <option value="ALL">All Sansads</option>
            {uniqueSansads.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className="font-medium text-foreground whitespace-nowrap">
            {lights.length} light{lights.length !== 1 ? "s" : ""} on map
          </span>
        </div>
      </div>

      <div
        className="flex-1 rounded-xl overflow-hidden border border-border/50 shadow-sm min-h-[400px]"
      >
        <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
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
                <StreetLightDetailCard
                  light={light as Parameters<typeof StreetLightDetailCard>[0]["light"]}
                  compact
                />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}