"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Zap, Calendar, ExternalLink, X, Navigation } from "lucide-react";
import { formatDate } from "@/lib/utils/date";
import { toTitleCase } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { LightIDBadge } from "./LightIDBadge";
import { useState, useEffect } from "react";

interface StreetLightDetailCardProps {
  light: {
    id: string;
    lightId: string;
    mouza: { mouzaName: string; jlNo?: string | null };
    sansad?: string | null;
    ward?: string | null;
    landmark?: string | null;
    roadName?: string | null;
    poleNo?: string | null;
    lightType?: string | null;
    wattage?: number | null;
    poleType?: string | null;
    ownership?: string | null;
    installYear?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    gpsAccuracy?: number | null;
    lightCondition: string;
    workingStatus: string;
    lastInspection?: string | Date | null;
    remarks?: string | null;
    lightImageUrl?: string | null;
    poleImageUrl?: string | null;
  };
  compact?: boolean;
}

export function StreetLightDetailCard({ light, compact }: StreetLightDetailCardProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (compact) {
    return (
      <div className="min-w-[250px] max-w-[280px] flex flex-col gap-3 font-sans">
        <div className="flex items-center justify-between">
          <LightIDBadge lightId={light.lightId} />
        </div>
        
        <div className="space-y-1 text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40">
          <p className="flex justify-between items-center"><span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Mouza</span> <span className="font-medium text-foreground">{light.mouza?.mouzaName}</span></p>
          <p className="flex justify-between items-center"><span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">Sansad</span> <span className="font-medium text-foreground">{light.sansad ?? "—"}</span></p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <StatusBadge type="working" value={light.workingStatus} />
          <StatusBadge type="condition" value={light.lightCondition} />
        </div>

        {light.lightType && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md w-fit">
            <Zap className="w-3.5 h-3.5" />
            {light.lightType}{light.wattage ? ` · ${light.wattage}W` : ""}
          </div>
        )}

        {light.lightImageUrl && (
          <div
            className="rounded-xl overflow-hidden border border-border/50 shadow-sm cursor-pointer group relative mt-1"
            onClick={() => setSelectedImage(light.lightImageUrl!)}
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10" />
            <Image
              src={light.lightImageUrl}
              alt="Light"
              width={280}
              height={140}
              className="object-cover w-full h-32 transform group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        <Button
          size="sm"
          className="w-full gap-2 mt-1 shadow-md hover:shadow-lg transition-all rounded-xl"
          onClick={() => router.push(`/admindashboard/street-lights/register/${light.id}`)}
        >
          View Full Details
          <ExternalLink className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 pb-6 border-b border-border/40">
        <div className="space-y-3">
          <LightIDBadge lightId={light.lightId} className="text-lg px-3 py-1 shadow-sm" />
          <div className="flex gap-2.5 flex-wrap">
            <StatusBadge type="working" value={light.workingStatus} />
            <StatusBadge type="condition" value={light.lightCondition} />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            className="flex-1 md:flex-none gap-2 hover:bg-muted/50 transition-colors shadow-sm rounded-xl"
            onClick={() => router.push(`/admindashboard/street-lights/register/${light.id}/edit`)}
          >
            Edit Details
          </Button>
          <Button
            className="flex-1 md:flex-none gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all rounded-xl"
            onClick={() => router.push(`/admindashboard/street-lights/complaints?lightId=${light.id}`)}
          >
            <Zap className="w-4 h-4 fill-current" />
            File Complaint
          </Button>
        </div>
      </div>

      {/* Photos Section */}
      {(light.lightImageUrl || light.poleImageUrl) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {light.lightImageUrl && (
            <div className="space-y-2 group">
              <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Light Unit
              </p>
              <div
                className="rounded-2xl overflow-hidden border border-border/50 shadow-sm aspect-[4/3] relative cursor-pointer"
                onClick={() => setSelectedImage(light.lightImageUrl!)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Image src={light.lightImageUrl} alt="Light" fill className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
            </div>
          )}
          {light.poleImageUrl && (
            <div className="space-y-2 group">
              <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Pole & Surroundings
              </p>
              <div
                className="rounded-2xl overflow-hidden border border-border/50 shadow-sm aspect-[4/3] relative cursor-pointer"
                onClick={() => setSelectedImage(light.poleImageUrl!)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Image src={light.poleImageUrl} alt="Pole" fill className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Grid */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          Technical Specifications
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6">
          <DetailRow
            label="Mouza"
            value={`${light.mouza?.mouzaName}${light.mouza?.jlNo ? ` (JL: ${light.mouza.jlNo})` : ""}`}
          />
          <DetailRow label="Sansad" value={light.sansad} />
          <DetailRow label="Ward" value={light.ward} />
          <DetailRow label="Landmark" value={light.landmark} />
          <DetailRow label="Road Name" value={light.roadName} />
          <DetailRow label="Pole No." value={light.poleNo} />
          <DetailRow label="Light Type" value={light.lightType} />
          <DetailRow
            label="Wattage"
            value={light.wattage ? `${light.wattage} W` : undefined}
            icon={<Zap className="w-4 h-4 text-amber-500" />}
          />
          <DetailRow label="Pole Type" value={light.poleType ? toTitleCase(light.poleType) : undefined} />
          <DetailRow label="Ownership" value={light.ownership ? toTitleCase(light.ownership) : undefined} />
          <DetailRow
            label="Installation Year"
            value={light.installYear?.toString()}
            icon={<Calendar className="w-4 h-4 text-blue-500" />}
          />
          <DetailRow label="Last Inspection" value={light.lastInspection ? formatDate(light.lastInspection) : undefined} />
        </div>
      </div>

      {/* GPS Location Section */}
      {light.latitude && light.longitude && (
        <div className="rounded-2xl border border-teal-200/60 dark:border-teal-900/50 bg-gradient-to-br from-teal-50 to-emerald-50/50 dark:from-teal-950/20 dark:to-emerald-900/10 p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-teal-100 dark:bg-teal-900/30 rounded-full blur-3xl group-hover:bg-teal-200 dark:group-hover:bg-teal-800/40 transition-colors duration-700" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2.5 bg-teal-100 dark:bg-teal-900/50 rounded-xl">
              <Navigation className="w-5 h-5 text-teal-700 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-teal-900 dark:text-teal-300">GPS Coordinates</h3>
              <p className="text-sm text-teal-700/80 dark:text-teal-400/70">Geospatial location data</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 font-mono text-sm relative z-10 bg-white/60 dark:bg-black/20 p-4 rounded-xl border border-white/40 dark:border-white/5 backdrop-blur-sm">
            <div>
              <p className="text-xs font-sans font-medium text-teal-600/80 dark:text-teal-400/80 uppercase tracking-wider mb-1">Latitude</p>
              <p className="font-semibold text-teal-900 dark:text-teal-100 text-base">{light.latitude.toFixed(6)}°</p>
            </div>
            <div>
              <p className="text-xs font-sans font-medium text-teal-600/80 dark:text-teal-400/80 uppercase tracking-wider mb-1">Longitude</p>
              <p className="font-semibold text-teal-900 dark:text-teal-100 text-base">{light.longitude.toFixed(6)}°</p>
            </div>
            {light.gpsAccuracy && (
              <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-teal-200 dark:border-teal-800/50 pt-4 md:pt-0 md:pl-6">
                <p className="text-xs font-sans font-medium text-teal-600/80 dark:text-teal-400/80 uppercase tracking-wider mb-1">Accuracy</p>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                  <p className="font-semibold text-teal-900 dark:text-teal-100 text-base">±{Math.round(light.gpsAccuracy)}m</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-5 relative z-10">
            <a
              href={`https://www.google.com/maps?q=${light.latitude},${light.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-teal-950 text-sm font-medium text-teal-700 dark:text-teal-300 rounded-lg shadow-sm border border-teal-100 dark:border-teal-800 hover:shadow-md hover:bg-teal-50 dark:hover:bg-teal-900 transition-all"
            >
              Open in Google Maps
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Remarks Section */}
      {light.remarks && (
        <div className="rounded-xl border border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20 p-5 relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-amber-400" />
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mb-2">Remarks / Notes</p>
          <p className="text-amber-950 dark:text-amber-100/90 leading-relaxed">{light.remarks}</p>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center animate-in zoom-in-95 duration-300">
            <div className="absolute inset-0 bg-black rounded-2xl shadow-2xl -z-10" />
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute -top-4 -right-4 md:top-4 md:right-4 text-white bg-black/60 backdrop-blur-md rounded-full p-2.5 hover:bg-red-500 hover:text-white transition-all shadow-xl border border-white/10"
              onClick={() => setSelectedImage(null)}
              aria-label="Close image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="mt-0.5 p-1.5 rounded-md bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors text-muted-foreground">
        {icon || <div className="w-1.5 h-1.5 m-1 rounded-full bg-current opacity-50" />}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70 mb-0.5">{label}</p>
        <p className="font-medium text-foreground text-base leading-snug">{value || <span className="text-muted-foreground/40 italic">Not specified</span>}</p>
      </div>
    </div>
  );
}

