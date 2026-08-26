"use client";

import { cn } from "@/lib/utils";
import { toTitleCase } from "@/lib/utils";

type WorkingStatus = "WORKING" | "NOT_WORKING";
type LightCondition = "GOOD" | "REPAIR_REQUIRED" | "DEFECTIVE" | "MISSING";
type ComplaintStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

type StatusType = "working" | "condition" | "complaint" | "priority";

const STATUS_MAPS: Record<
  StatusType,
  Record<string, { label: string; className: string }>
> = {
  working: {
    WORKING: { label: "Working", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    NOT_WORKING: { label: "Not Working", className: "bg-red-100 text-red-800 border-red-200" },
  },
  condition: {
    GOOD: { label: "Good", className: "bg-green-100 text-green-800 border-green-200" },
    REPAIR_REQUIRED: { label: "Repair Required", className: "bg-amber-100 text-amber-800 border-amber-200" },
    DEFECTIVE: { label: "Defective", className: "bg-red-100 text-red-800 border-red-200" },
    MISSING: { label: "Missing", className: "bg-gray-100 text-gray-700 border-gray-200" },
  },
  complaint: {
    PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    ASSIGNED: { label: "Assigned", className: "bg-blue-100 text-blue-800 border-blue-200" },
    IN_PROGRESS: { label: "In Progress", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    RESOLVED: { label: "Resolved", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    CLOSED: { label: "Closed", className: "bg-gray-100 text-gray-600 border-gray-200" },
  },
  priority: {
    LOW: { label: "Low", className: "bg-slate-100 text-slate-600 border-slate-200" },
    NORMAL: { label: "Normal", className: "bg-blue-100 text-blue-700 border-blue-200" },
    HIGH: { label: "High", className: "bg-orange-100 text-orange-700 border-orange-200" },
    URGENT: { label: "Urgent", className: "bg-red-100 text-red-700 border-red-200" },
  },
};

const FALLBACK_CLASS = "bg-gray-100 text-gray-600 border-gray-200";

interface StatusBadgeProps {
  type: StatusType;
  value: string;
  className?: string;
}

export function StatusBadge({ type, value, className }: StatusBadgeProps) {
  const config = STATUS_MAPS[type][value];
  const label = config?.label ?? toTitleCase(value);
  const badgeClass = config?.className ?? FALLBACK_CLASS;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        badgeClass,
        className
      )}
    >
      {label}
    </span>
  );
}
