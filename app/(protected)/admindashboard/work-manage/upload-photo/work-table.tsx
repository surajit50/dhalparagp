"use client";

import { useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Eye,
  Upload,
  ChevronLeft,
  ChevronRight,
  FileWarning,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Define the shape of our data
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

// Helper to get status variant and icon
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

// Define TanStack Columns
export const columns: ColumnDef<WorkTableData>[] = [
  {
    accessorKey: "financialYear",
    header: "FY",
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
  },
  {
    accessorKey: "workStatus",
    header: "Status",
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
              "bg-blue-50 text-blue-700 border-blue-200",
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
    cell: ({ row }) => {
      const progress = row.getValue("progress") as number;
      const progressColor =
        progress >= 80
          ? "bg-emerald-500"
          : progress >= 50
          ? "bg-blue-500"
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

// The Table Component
interface WorkTableProps {
  data: WorkTableData[];
  currentPage: number;
  totalPages: number;
  agencySearch: string;
}

export function WorkTable({ data, currentPage, totalPages, agencySearch }: WorkTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rowCount = data.length;
  const startItem = rowCount > 0 ? (currentPage - 1) * 10 + 1 : 0;
  const endItem = Math.min(currentPage * 10, rowCount * currentPage); // Assuming page size 10; adjust if dynamic

  // Fallback for when page size is unknown; just show page info
  const showItemRange = rowCount > 0 && totalPages > 0;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-slate-200">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="bg-slate-50/80 text-slate-700 font-semibold text-sm py-4"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <FileWarning className="h-10 w-10 text-slate-300" />
                      <p className="text-base font-medium">No works found</p>
                      <p className="text-sm text-slate-400">
                        Try adjusting your search criteria.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
          <div className="text-sm text-slate-500">
            {showItemRange && (
              <>
                Showing <span className="font-medium text-slate-700">{startItem}</span> to{" "}
                <span className="font-medium text-slate-700">{endItem}</span> of{" "}
                <span className="font-medium text-slate-700">{rowCount * totalPages}</span> works
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              asChild={currentPage > 1}
              className="border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              {currentPage > 1 ? (
                <Link href={`?agency=${agencySearch}&page=${currentPage - 1}`}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Link>
              ) : (
                <span className="opacity-50">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </span>
              )}
            </Button>

            <div className="flex items-center">
              <span className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              asChild={currentPage < totalPages}
              className="border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              {currentPage < totalPages ? (
                <Link href={`?agency=${agencySearch}&page=${currentPage + 1}`}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              ) : (
                <span className="opacity-50">
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
