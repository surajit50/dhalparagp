"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ApprovedActionPlanDetails, WorksDetail } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Calculator, BookOpen, FileText, CreditCard } from "lucide-react";

type ActionPlanWithWorks = ApprovedActionPlanDetails & {
  WorksDetail: (WorksDetail & {
    _count: {
      workEstimateItems: number;
      workMeasurementBooks: number;
      workBillAbstracts: number;
    };
  })[];
};

export const actionplancolumns: ColumnDef<ActionPlanWithWorks>[] = [
  {
    id: "slNo",
    header: "SL No.",
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination?.pageIndex ?? 0;
      const pageSize = table.getState().pagination?.pageSize ?? 10;
      return pageIndex * pageSize + row.index + 1;
    },
  },

  {
    accessorKey: "activityCode",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Activity Code
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("activityCode")}</div>,
  },

  {
    accessorKey: "activityDescription",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[400px] whitespace-normal">
        {row.getValue("activityDescription")}
      </div>
    ),
  },

  {
    id: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const plan = row.original;
      const firstWork = plan.WorksDetail?.[0];
      const hasEstimate = (firstWork?._count?.workEstimateItems || 0) > 0;
      const hasMB = (firstWork?._count?.workMeasurementBooks || 0) > 0;
      const hasBillAbstract = (firstWork?._count?.workBillAbstracts || 0) > 0;

      return (
        <div className="flex gap-2">
          {hasEstimate ? (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200" title="Estimate Saved">
              <Calculator className="h-3 w-3 mr-1" />
              Est
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200" title="No Estimate">
              Est
            </Badge>
          )}
          {hasMB ? (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200" title="MB Saved">
              <BookOpen className="h-3 w-3 mr-1" />
              MB
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200" title="No MB">
              MB
            </Badge>
          )}
          {hasBillAbstract ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200" title="Bill Abstract Saved">
              <FileText className="h-3 w-3 mr-1" />
              Bill
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200" title="No Bill">
              Bill
            </Badge>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "financialYear",
    header: "Financial Year",
    cell: ({ row }) => <div>{row.getValue("financialYear")}</div>,
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const plan = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href={`/admindashboard/work-manage/edit/${plan.id}`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="text-red-600">
              <Link href={`/admindashboard/work-manage/delete/${plan.id}`}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
