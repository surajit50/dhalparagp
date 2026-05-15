"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Eye, Upload, CheckCircle2, Clock, AlertCircle, FileWarning } from "lucide-react";
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
  const lower = status.toLowerCase();
  if (lower.includes("complete") || lower === "completed") {
    return {
      variant: "success" as const,
      icon: CheckCircle2,
      label: "Completed",
    };
  }
  if (lower.includes("progress") || lower === "ongoing") {
    return {
      variant: "default" as const,
      icon: Clock,
      label: "In Progress",
    };
  }
  if (lower.includes("pending") || lower === "not started") {
    return {
      variant: "secondary" as const,
      icon: AlertCircle,
      label: "Pending",
    };
  }
  return {
    variant: "outline" as const,
    icon: FileWarning,
    label: status,
  };
};

export const columns: ColumnDef<WorkTableData>[] = [
  {
    accessorKey: "financialYear",
    header: "FY",
    // @ts-ignore
    label: "Financial Year",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="bg-slate-50 text-slate-700 font-medium whitespace-nowrap border-slate-200"
      >
        {row.getValue("financialYear")}
      </Badge>
    ),
  },
  {
    accessorKey: "description",
    header: "Work Description",
    // @ts-ignore
    label: "Work Description",
    cell: ({ row }) => (
      <div
        className="max-w-[320px] line-clamp-2 font-medium text-slate-800"
        title={row.getValue("description")}
      >
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "nitNo",
    header: "NIT Details",
    // @ts-ignore
    label: "NIT Number",
    cell: ({ row }) => (
      <div className="text-xs space-y-0.5">
        <p className="text-slate-700">
          <span className="text-slate-400">No:</span>{" "}
          <span className="font-mono">{row.getValue("nitNo")}</span>
        </p>
        <p className="text-slate-700">
          <span className="text-slate-400">Date:</span> {row.original.nitDate}
        </p>
        <p className="text-slate-700">
          <span className="text-slate-400">Sl No:</span> {row.original.workSlNo}
        </p>
      </div>
    ),
    meta: {
      exportValue: (row: WorkTableData) => `No: ${row.nitNo}, Date: ${row.nitDate}, Sl No: ${row.workSlNo}`,
    },
  },
  {
    accessorKey: "workStatus",
    header: "Status",
    // @ts-ignore
    label: "Status",
    cell: ({ row }) => {
      const status = row.getValue("workStatus") as string;
      const { icon: Icon, label } = getStatusDetails(status);
      return (
        <Badge
          variant="secondary"
          className={cn(
            "capitalize whitespace-nowrap gap-1 pl-1.5 pr-2.5 py-1 font-medium",
            status.toLowerCase().includes("complete") &&
              "bg-emerald-50 text-emerald-700 border-emerald-200",
            status.toLowerCase().includes("progress") &&
              "bg-orange-50 text-orange-700 border-orange-200",
            status.toLowerCase().includes("pending") &&
              "bg-amber-50 text-amber-700 border-amber-200"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "progress",
    header: "Progress",
    // @ts-ignore
    label: "Progress %",
    cell: ({ row }) => {
      const progress = row.getValue("progress") as number;
      const progressColor =
        progress >= 80
          ? "bg-emerald-500"
          : progress >= 50
          ? "bg-orange-500"
          : progress >= 20
          ? "bg-amber-500"
          : "bg-slate-400";
      return (
        <div className="w-[140px]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-slate-700">{progress}%</span>
            <span className="text-slate-400">Complete</span>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-slate-100"
            // @ts-ignore
            indicatorClassName={progressColor}
          />
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const work = row.original;
      return (
        <div className="flex justify-end">
          {work.allVerified ? (
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1.5"
            >
              <Link href={`/admindashboard/work-manage/upload-photo/${work.id}`}>
                <Eye className="h-4 w-4" />
                View
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              className="gap-1.5 bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
            >
              <Link href={`/admindashboard/work-manage/upload-photo/${work.id}`}>
                <Upload className="h-4 w-4" />
                Upload
              </Link>
            </Button>
          )}
        </div>
      );
    },
  },
];
