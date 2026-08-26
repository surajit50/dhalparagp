"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Zap, Calendar, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils/date";
import { toTitleCase } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { LightIDBadge } from "./LightIDBadge";

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

  if (compact) {
    return (
      <div className="min-w-[240px] max-w-[280px] space-y-2 text-sm">
        <LightIDBadge lightId={light.lightId} />
        <div className="space-y-0.5 text-muted-foreground">
          <p><span className="font-medium text-foreground">Mouza:</span> {light.mouza?.mouzaName}</p>
          <p><span className="font-medium text-foreground">Sansad:</span> {light.sansad ?? "—"}</p>
          <p><span className="font-medium text-foreground">Landmark:</span> {light.landmark ?? "—"}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <StatusBadge type="working" value={light.workingStatus} />
          <StatusBadge type="condition" value={light.lightCondition} />
        </div>
        {light.lightType && (
          <p className="text-xs text-muted-foreground">
            {light.lightType}{light.wattage ? ` · ${light.wattage}W` : ""}
          </p>
        )}
        {light.latitude && light.longitude && (
          <p className="text-xs font-mono text-muted-foreground">
            {light.latitude.toFixed(6)}, {light.longitude.toFixed(6)}
          </p>
        )}
        {light.lightImageUrl && (
          <div className="rounded-lg overflow-hidden border">
            <Image
              src={light.lightImageUrl}
              alt="Light"
              width={280}
              height={140}
              className="object-cover w-full h-28"
            />
          </div>
        )}
        <Button
          size="sm"
          className="w-full gap-1.5"
          onClick={() => router.push(`/admindashboard/street-lights/register/${light.id}`)}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Full Details
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <LightIDBadge lightId={light.lightId} className="text-base" />
          <div className="flex gap-2 flex-wrap">
            <StatusBadge type="working" value={light.workingStatus} />
            <StatusBadge type="condition" value={light.lightCondition} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => router.push(`/admindashboard/street-lights/register/${light.id}/edit`)}
          >
            Edit Details
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => router.push(`/admindashboard/street-lights/complaints?lightId=${light.id}`)}
          >
            <Zap className="w-4 h-4" />
            File Complaint
          </Button>
        </div>
      </div>

      {(light.lightImageUrl || light.poleImageUrl) && (
        <div className="grid grid-cols-2 gap-3">
          {light.lightImageUrl && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Light Photo</p>
              <div className="rounded-xl overflow-hidden border aspect-video relative">
                <Image src={light.lightImageUrl} alt="Light" fill className="object-cover" />
              </div>
            </div>
          )}
          {light.poleImageUrl && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Pole Photo</p>
              <div className="rounded-xl overflow-hidden border aspect-video relative">
                <Image src={light.poleImageUrl} alt="Pole" fill className="object-cover" />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
          icon={<Zap className="w-3.5 h-3.5 text-yellow-500" />}
        />
        <DetailRow label="Pole Type" value={light.poleType ? toTitleCase(light.poleType) : undefined} />
        <DetailRow label="Ownership" value={light.ownership ? toTitleCase(light.ownership) : undefined} />
        <DetailRow
          label="Installation Year"
          value={light.installYear?.toString()}
          icon={<Calendar className="w-3.5 h-3.5 text-muted-foreground" />}
        />
        <DetailRow label="Last Inspection" value={formatDate(light.lastInspection!)} />
      </div>

      {light.latitude && light.longitude && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-semibold text-teal-800">GPS Location</span>
          </div>
          <div className="grid grid-cols-3 gap-4 font-mono text-sm">
            <div>
              <p className="text-xs text-teal-600">Latitude</p>
              <p className="font-semibold">{light.latitude.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-xs text-teal-600">Longitude</p>
              <p className="font-semibold">{light.longitude.toFixed(6)}</p>
            </div>
            {light.gpsAccuracy && (
              <div>
                <p className="text-xs text-teal-600">Accuracy</p>
                <p className="font-semibold">±{Math.round(light.gpsAccuracy)} m</p>
              </div>
            )}
          </div>
          <a
            href={`https://www.google.com/maps?q=${light.latitude},${light.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs text-teal-700 underline underline-offset-2 hover:text-teal-900"
          >
            <ExternalLink className="w-3 h-3" />
            Open in Google Maps
          </a>
        </div>
      )}

      {light.remarks && (
        <div className="rounded-lg bg-muted/50 p-4 text-sm">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Remarks</p>
          <p>{light.remarks}</p>
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
    <div className="flex items-start gap-2">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value ?? "—"}</p>
      </div>
    </div>
  );
}
