"use client";

import { cn } from "@/lib/utils";

type WorkingStatus = "WORKING" | "NOT_WORKING";
type LightCondition = "GOOD" | "REPAIR_REQUIRED" | "DEFECTIVE" | "MISSING";
type ComplaintStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

const WORKING_STATUS_MAP: Record<WorkingStatus, { label: string; className: string }> = {
  WORKING: { label: "Working", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  NOT_WORKING: { label: "Not Working", className: "bg-red-100 text-red-800 border-red-200" },
};

const CONDITION_MAP: Record<LightCondition, { label: string; className: string }> = {
  GOOD: { label: "Good", className: "bg-green-100 text-green-800 border-green-200" },
  REPAIR_REQUIRED: { label: "Repair Required", className: "bg-amber-100 text-amber-800 border-amber-200" },
  DEFECTIVE: { label: "Defective", className: "bg-red-100 text-red-800 border-red-200" },
  MISSING: { label: "Missing", className: "bg-gray-100 text-gray-700 border-gray-200" },
};

const COMPLAINT_STATUS_MAP: Record<ComplaintStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  ASSIGNED: { label: "Assigned", className: "bg-blue-100 text-blue-800 border-blue-200" },
  IN_PROGRESS: { label: "In Progress", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  RESOLVED: { label: "Resolved", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  CLOSED: { label: "Closed", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

const PRIORITY_MAP: Record<Priority, { label: string; className: string }> = {
  LOW: { label: "Low", className: "bg-slate-100 text-slate-600 border-slate-200" },
  NORMAL: { label: "Normal", className: "bg-blue-100 text-blue-700 border-blue-200" },
  HIGH: { label: "High", className: "bg-orange-100 text-orange-700 border-orange-200" },
  URGENT: { label: "Urgent", className: "bg-red-100 text-red-700 border-red-200" },
};

interface StatusBadgeProps {
  type: "working" | "condition" | "complaint" | "priority";
  value: string;
  className?: string;
}

export function StatusBadge({ type, value, className }: StatusBadgeProps) {
  let label = value;
  let badgeClass = "bg-gray-100 text-gray-600 border-gray-200";

  if (type === "working") {
    const config = WORKING_STATUS_MAP[value as WorkingStatus];
    if (config) { label = config.label; badgeClass = config.className; }
  } else if (type === "condition") {
    const config = CONDITION_MAP[value as LightCondition];
    if (config) { label = config.label; badgeClass = config.className; }
  } else if (type === "complaint") {
    const config = COMPLAINT_STATUS_MAP[value as ComplaintStatus];
    if (config) { label = config.label; badgeClass = config.className; }
  } else if (type === "priority") {
    const config = PRIORITY_MAP[value as Priority];
    if (config) { label = config.label; badgeClass = config.className; }
  }

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
