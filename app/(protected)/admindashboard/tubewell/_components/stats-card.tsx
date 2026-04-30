"use client";

import {
  LucideIcon,
  AlertTriangle,
  Wrench,
  Settings2,
  CheckCircle2,
  Receipt,
  IndianRupee,
  PieChart,
  Layers,
  PackageSearch,
  Users,
  UserCheck,
  ClipboardList,
  Ban,
  History,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  AlertTriangle,
  Wrench,
  Settings2,
  CheckCircle2,
  Receipt,
  IndianRupee,
  PieChart,
  Layers,
  PackageSearch,
  Users,
  UserCheck,
  ClipboardList,
  Ban,
  History,
  Coins,
};

const colorMap = {
  blue: {
    text: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    iconBg: "bg-blue-100",
  },
  emerald: {
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    iconBg: "bg-emerald-100",
  },
  rose: {
    text: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    iconBg: "bg-rose-100",
  },
  amber: {
    text: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    iconBg: "bg-amber-100",
  },
  indigo: {
    text: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    iconBg: "bg-indigo-100",
  },
  slate: {
    text: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-100",
    iconBg: "bg-slate-100",
  },
};

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof iconMap;
  color?: keyof typeof colorMap;
  description?: string;
  isWarning?: boolean;
  className?: string;
}

export function StatsCard({
  label,
  value,
  icon,
  color = "slate",
  description,
  isWarning,
  className,
}: StatsCardProps) {
  const styles = colorMap[color];
  const Icon = iconMap[icon] || AlertTriangle;

  return (
    <div
      className={cn(
        "group bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all duration-300",
        styles.border,
        className,
      )}
    >
      <div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h2
              className={cn(
                "text-3xl font-extrabold tracking-tight transition-transform duration-300 group-hover:scale-105",
                styles.text,
              )}
            >
              {value}
            </h2>
          </div>
          {description && (
            <p className="text-sm text-slate-500 font-medium">{description}</p>
          )}
        </div>
        <div
          className={cn(
            "p-4 rounded-2xl transition-all duration-300 group-hover:rotate-6 group-hover:scale-110",
            styles.iconBg,
            styles.text,
          )}
        >
          {isWarning ? (
            <div className="relative">
              <Icon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </div>
          ) : (
            <Icon className="h-6 w-6" />
          )}
        </div>
      </div>
    </div>
  );
}
