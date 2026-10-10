
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  FileWarning,
  Hash,
  Upload,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type WorkTableData = {
  id: string;
  fundName: string;
  financialYear: string;
  description: string;
  nitId: string;
  nitNo: string;
  nitDate: string;
  workSlNo: number;
  agencyName: string;
  workStatus: string;
  progress: number;
  allVerified: boolean;
};

function getStatusDetails(status: string) {
  const lower = (status || "").toLowerCase().replace(/[_-]/g, " ");

  if (lower.includes("complete") || lower === "billpaid") {
    return {
      icon: CheckCircle2,
      label: "Completed",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (lower.includes("progress") || lower === "ongoing") {
    return {
      icon: Clock,
      label: "In Progress",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    };
  }

  if (
    lower.includes("pending") ||
    lower.includes("not started") ||
    lower.includes("yettostart") ||
    lower === "approved" ||
    lower === "tenderpublish" ||
    lower === "tender publish"
  ) {
    return {
      icon: Clock,
      label: "Pending",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    icon: FileWarning,
    label: status || "Unknown",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  };
}

export const columns: ColumnDef<WorkTableData>[] = [
  {
    accessorKey: "fundName",
    header: "Fund Name",
    cell: ({ row }) => (
      <div className="min-w-[160px] max-w-[230px] whitespace-normal break-words py-2 text-sm font-medium text-slate-700">
        {row.original.fundName}
      </div>
    ),
  },
  {
    accessorKey: "financialYear",
    header: "Financial Year",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="whitespace-nowrap border-indigo-200 bg-indigo-50 text-indigo-700"
      >
        {row.original.financialYear || "N/A"}
      </Badge>
    ),
  },
  {
    accessorKey: "description",
    header: "Work Description",
    enableSorting: true,
    cell: ({ row }) => (
      <div className="min-w-[280px] max-w-[520px] py-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-slate-50">
            <FileText className="h-4 w-4 text-slate-600" />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="whitespace-normal break-words text-sm font-semibold leading-6 text-slate-900"
              title={row.original.description}
            >
              {row.original.description || "Work description not available"}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-1 text-xs text-slate-500">
              <Hash className="h-3 w-3" />
              Work Sl. No. {row.original.workSlNo}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "nitNo",
    header: "NIT Details",
    enableSorting: true,
    cell: ({ row }) => (
      <div className="min-w-[155px] space-y-2 py-2 text-xs">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            NIT Number
          </p>
          <p className="break-words font-mono font-semibold text-slate-800">
            {row.original.nitNo}
          </p>
        </div>

        <div className="flex items-start gap-1.5 text-slate-600">
          <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>{row.original.nitDate}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "agencyName",
    header: "Agency Name",
    cell: ({ row }) => (
      <div className="min-w-[170px] max-w-[280px] whitespace-normal break-words py-2 text-sm">
        {row.original.agencyName}
      </div>
    ),
  },
  {
    accessorKey: "workStatus",
    header: "Work Status",
    cell: ({ row }) => {
      const { icon: Icon, label, className } = getStatusDetails(
        row.original.workStatus
      );

      return (
        <div className="py-2">
          <Badge
            variant="outline"
            className={cn(
              "inline-flex gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 font-medium",
              className
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "progress",
    header: "Photo Progress",
    enableSorting: true,
    cell: ({ row }) => {
      const progress = Math.min(
        100,
        Math.max(0, Number(row.original.progress) || 0)
      );

      const barColor =
        progress >= 100
          ? "bg-emerald-500"
          : progress >= 60
            ? "bg-blue-500"
            : progress >= 30
              ? "bg-amber-500"
              : "bg-slate-400";

      return (
        <div className="min-w-[140px] space-y-2 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold tabular-nums">
              {progress}%
            </span>
            <span className="text-xs text-slate-500">
              {progress === 100 ? "Complete" : "Verified"}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full transition-all", barColor)}
              style={{ width: `${progress}%` }}
            />
          </div>

          {progress < 100 && (
            <p className="text-[11px] text-slate-400">
              {100 - progress}% remaining
            </p>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Action</div>,
    enableHiding: false,
    cell: ({ row }) => {
      const work = row.original;

      return (
        <div className="flex justify-end py-2">
          <Button
            asChild
            size="sm"
            variant={work.allVerified ? "outline" : "default"}
            className={cn(
              "gap-1.5 whitespace-nowrap",
              work.allVerified
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-slate-900 text-white hover:bg-slate-700"
            )}
          >
            <Link href={`/admindashboard/work-manage/upload-photo/${work.id}`}>
              {work.allVerified ? (
                <>
                  <Eye className="h-4 w-4" />
                  View Photos
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Photos
                </>
              )}
            </Link>
          </Button>
        </div>
      );
    },
  },
];
