
"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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

export const columns: ColumnDef<WorkTableData>[] = [
  {
    accessorKey: "fundName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fund Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "financialYear",
    header: "Financial Year",
  },
  {
    accessorKey: "description",
    header: "Work Description",
    cell: ({ row }) => (
      <div className="min-w-[200px] max-w-[350px] whitespace-normal">
        {row.original.description}
      </div>
    ),
  },
  {
    id: "nitDetails",
    accessorFn: (row) => `${row.nitNo} ${row.nitDate}`,
    header: "NIT Details",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium">{row.original.nitNo}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.nitDate}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "agencyName",
    header: "Agency Name",
    cell: ({ row }) => (
      <div className="min-w-[160px] whitespace-normal">
        {row.original.agencyName}
      </div>
    ),
  },
  {
    accessorKey: "workStatus",
    header: "Work Status",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.workStatus}</Badge>
    ),
  },
  {
    accessorKey: "progress",
    header: "Photo Verification",
    cell: ({ row }) => {
      const progress = row.original.progress;

      return (
        <div className="min-w-[150px] space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span>{progress}% verified</span>
            <span>
              {row.original.allVerified ? "Complete" : "Pending"}
            </span>
          </div>
          <Progress value={progress} />
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => (
      <Button asChild size="sm" variant="outline">
        <Link
          href={`/admindashboard/work-manage/upload-photo/${row.original.id}`}
        >
          Upload / View
          <ExternalLink className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    ),
  },
];
