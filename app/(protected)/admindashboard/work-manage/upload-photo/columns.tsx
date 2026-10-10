
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileWarning,
  CalendarDays,
  Hash,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type WorkTableData = {
  id: string;
  financialYear: string;
  description: string;
  nitNo: string;
  nitDate: string;
  workSlNo: number;
  workStatus: string;
  progress: number;
  allVerified: boolean;
};

const getStatusDetails = (status: string) => {
  const lower = (status || "").toLowerCase().replace(/[_-]/g, " ");

  if (
    lower.includes("complete") ||
    lower === "billpaid"
  ) {
    return {
      icon: CheckCircle2,
      label: "Completed",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (
    lower.includes("progress") ||
    lower === "ongoing" ||
    lower === "workinprogress"
  ) {
    return {
      icon: Clock,
      label: "In Progress",
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
    };
  }

  if (
    lower.includes("pending") ||
    lower.includes("not started") ||
    lower.includes("yettostart") ||
    lower === "approved" ||
    lower === "tenderpublish"
  ) {
    return {
      icon: AlertCircle,
      label: "Pending",
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    icon: FileWarning,
    label: status || "Unknown",
    className:
      "border-slate-200 bg-slate-50 text-slate-700",
  };
};

export const columns: ColumnDef<WorkTableData>[] = [
  {
    accessorKey: "financialYear",
    header: "Financial Year",
    enableSorting: true,
    meta: {
      label: "Financial Year",
    },
    cell: ({ row }) => (
      <div className="py-2">
        <Badge
          variant="outline"
          className="whitespace-nowrap border-indigo-200 bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700"
        >
          {row.original.financialYear || "N/A"}
        </Badge>
      </div>
    ),
  },

  {
    accessorKey: "description",
    header: "Work Description",
    enableSorting: true,
    meta: {
      label: "Work Description",
    },
    cell: ({ row }) => (
      <div className="min-w-[280px] max-w-[520px] py-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
            <FileText className="h-4 w-4 text-slate-600" />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="whitespace-normal break-words text-sm font-semibold leading-6 text-slate-900"
              title={row.original.description}
            >
              {row.original.description ||
                "Work description not available"}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Hash className="h-3 w-3" />
                Work Sl. No. {row.original.workSlNo}
              </span>
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
    meta: {
      label: "NIT Details",
      exportValue: (row: WorkTableData) =>
        `NIT No: ${row.nitNo}, Date: ${row.nitDate}, Sl. No.: ${row.workSlNo}`,
    },
    cell: ({ row }) => (
      <div className="min-w-[165px] space-y-2 py-2 text-xs">
        <div>
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            NIT Number
          </p>
          <p className="break-words font-mono font-semibold text-slate-800">
            {row.original.nitNo || "N/A"}
          </p>
        </div>

        <div className="flex items-start gap-1.5 text-slate-600">
          <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>{row.original.nitDate || "Date unavailable"}</span>
        </div>
      </div>
    ),
  },

  {
    accessorKey: "workStatus",
    header: "Work Status",
    enableSorting: true,
    meta: {
      label: "Work Status",
    },
    cell: ({ row }) => {
      const { icon: Icon, label, className } =
        getStatusDetails(row.original.workStatus);

      return (
        <div className="py-2">
          <Badge
            variant="outline"
            className={cn(
              "inline-flex whitespace-nowrap gap-1.5 rounded-full px-2.5 py-1.5 font-medium",
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
    meta: {
      label: "Photo Progress %",
    },
    cell: ({ row }) => {
      const progress = Math.min(
        100,
        Math.max(0, Number(row.original.progress) || 0)
      );

      const progressColor =
        progress >= 100
          ? "bg-emerald-500"
          : progress >= 60
            ? "bg-blue-500"
            : progress >= 30
              ? "bg-amber-500"
              : "bg-slate-400";

      return (
        <div className="min-w-[150px] space-y-2 py-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold tabular-nums text-slate-800">
              {progress}%
            </span>

            <span
              className={cn(
                "text-xs font-medium",
                progress >= 100
                  ? "text-emerald-600"
                  : "text-slate-500"
              )}
            >
              {progress >= 100 ? "Complete" : "Uploaded"}
            </span>
          </div>

          <Progress
            value={progress}
            className="h-2 overflow-hidden rounded-full bg-slate-100"
            indicatorClassName={progressColor}
          />

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
    header: () => (
      <div className="text-right">Action</div>
    ),
    enableHiding: false,
    cell: ({ row }) => {
      const work = row.original;

      return (
        <div className="flex justify-end py-2">
          {work.allVerified ? (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="gap-1.5 border-emerald-200 bg-emerald-50 font-medium text-emerald-700 shadow-sm hover:bg-emerald-100 hover:text-emerald-800"
            >
              <Link
                href={`/admindashboard/work-manage/upload-photo/${work.id}`}
              >
                <Eye className="h-4 w-4" />
                View Photos
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              className="gap-1.5 bg-slate-900 font-medium text-white shadow-sm hover:bg-slate-700"
            >
              <Link
                href={`/admindashboard/work-manage/upload-photo/${work.id}`}
              >
                <Upload className="h-4 w-4" />
                Upload Photos
              </Link>
            </Button>
          )}
        </div>
      );
    },
  },
];
