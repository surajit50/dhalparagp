"use client";

import useSWR from "swr";
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  Camera,
  Zap,
  Map,
  MessageSquareWarning,
} from "lucide-react";
import { fetcher } from "@/lib/utils";

interface Stats {
  totalLights: number;
  workingLights: number;
  notWorkingLights: number;
  repairRequired: number;
  ledLights: number;
  totalWattage: number;
  totalMouzas: number;
  withGPS: number;
  withoutGPS: number;
  withPhoto: number;
  withoutPhoto: number;
  openComplaints: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-border/50 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        {loading ? (
          <div className="h-7 w-16 bg-muted animate-pulse rounded" />
        ) : (
          <p className="text-2xl font-bold text-foreground">{value}</p>
        )}
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function StreetLightDashboard() {
  const { data: stats, isLoading } = useSWR<Stats>("/api/street-lights/stats", fetcher, {
    refreshInterval: 60000,
  });

  const workingPercent =
    stats?.totalLights ? Math.round((stats.workingLights / stats.totalLights) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Lightbulb}
          label="Total Lights"
          value={stats?.totalLights ?? 0}
          color="bg-orange-500"
          loading={isLoading}
        />
        <StatCard
          icon={CheckCircle2}
          label="Working"
          value={stats?.workingLights ?? 0}
          sub={stats ? `${workingPercent}% of total` : ""}
          color="bg-emerald-500"
          loading={isLoading}
        />
        <StatCard
          icon={XCircle}
          label="Not Working"
          value={stats?.notWorkingLights ?? 0}
          color="bg-red-500"
          loading={isLoading}
        />
        <StatCard
          icon={AlertTriangle}
          label="Repair Required"
          value={stats?.repairRequired ?? 0}
          color="bg-amber-500"
          loading={isLoading}
        />
        <StatCard
          icon={Zap}
          label="LED Lights"
          value={stats?.ledLights ?? 0}
          sub={stats ? `${stats.totalWattage.toLocaleString()} W total` : ""}
          color="bg-yellow-500"
          loading={isLoading}
        />
        <StatCard
          icon={Map}
          label="Mouzas Covered"
          value={stats?.totalMouzas ?? 0}
          color="bg-indigo-500"
          loading={isLoading}
        />
        <StatCard
          icon={MapPin}
          label="GPS Surveyed"
          value={stats?.withGPS ?? 0}
          sub={stats ? `${stats.withoutGPS} without GPS` : ""}
          color="bg-teal-500"
          loading={isLoading}
        />
        <StatCard
          icon={Camera}
          label="With Photos"
          value={stats?.withPhoto ?? 0}
          sub={stats ? `${stats.withoutPhoto} missing photo` : ""}
          color="bg-purple-500"
          loading={isLoading}
        />
      </div>

      {!isLoading && stats && stats.openComplaints > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-5 py-4">
          <MessageSquareWarning className="w-5 h-5 text-orange-600 flex-shrink-0" />
          <p className="text-sm font-medium text-orange-800">
            <strong>{stats.openComplaints}</strong> open complaint
            {stats.openComplaints !== 1 ? "s" : ""} pending resolution
          </p>
          <a
            href="/admindashboard/street-lights/complaints"
            className="ml-auto text-xs font-semibold text-orange-700 underline underline-offset-2 hover:text-orange-900"
          >
            View All →
          </a>
        </div>
      )}
    </div>
  );
}
