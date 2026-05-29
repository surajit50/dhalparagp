"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, MapPin, IndianRupee, Layers, Target } from "lucide-react";
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
import { Calculator, BookOpen, FileText } from "lucide-react";

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
      return <div className="text-muted-foreground font-medium">{pageIndex * pageSize + row.index + 1}</div>;
    },
  },

  {
    accessorKey: "activityCode",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0 hover:bg-transparent"
      >
        Plan Details
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const plan = row.original;
      return (
        <div className="flex flex-col space-y-1 min-w-[300px]">
          <span className="font-semibold text-blue-700 dark:text-blue-400">
            {plan.activityCode}
          </span>
          <span className="font-bold text-sm text-foreground">
            {plan.activityName}
          </span>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {plan.activityDescription}
          </p>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary" className="text-[10px]">
              {plan.schemeName}
            </Badge>
            <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-950/30">
              FY: {plan.financialYear}
            </Badge>
          </div>
        </div>
      );
    },
  },

  {
    id: "locationAndSector",
    header: "Location & Sector",
    cell: ({ row }) => {
      const plan = row.original;
      return (
        <div className="flex flex-col space-y-2 min-w-[200px]">
          <div className="flex items-start gap-1.5 text-sm">
            <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">{plan.locationofAsset}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Layers className="h-4 w-4 text-purple-600 shrink-0" />
            <span className="text-muted-foreground">{plan.sector}</span>
          </div>
          {plan.upasamiti && (
            <div className="flex items-center gap-1.5 text-sm">
              <Target className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="text-muted-foreground">{plan.upasamiti.replace(/_/g, ' ')}</span>
            </div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "estimatedCost",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0 hover:bg-transparent"
      >
        Financials
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const plan = row.original;
      return (
        <div className="flex flex-col space-y-1.5 min-w-[150px]">
          <div className="flex items-center font-bold text-emerald-700 dark:text-emerald-400">
            <IndianRupee className="h-4 w-4 mr-1" />
            {plan.estimatedCost?.toLocaleString("en-IN") || 0}
          </div>
          <div className="flex flex-col text-[11px] text-muted-foreground gap-0.5">
            <div className="flex justify-between">
              <span>General:</span>
              <span className="font-medium">₹{plan.generalFund?.toLocaleString("en-IN") || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>SC:</span>
              <span className="font-medium">₹{plan.scFund?.toLocaleString("en-IN") || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>ST:</span>
              <span className="font-medium">₹{plan.stFund?.toLocaleString("en-IN") || 0}</span>
            </div>
          </div>
        </div>
      );
    },
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
        <div className="flex flex-col gap-2">
          {hasEstimate ? (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 justify-start" title="Estimate Saved">
              <Calculator className="h-3 w-3 mr-1.5" /> Est. Saved
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 justify-start" title="No Estimate">
              <Calculator className="h-3 w-3 mr-1.5" /> No Est.
            </Badge>
          )}
          {hasMB ? (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 justify-start" title="MB Saved">
              <BookOpen className="h-3 w-3 mr-1.5" /> MB Saved
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 justify-start" title="No MB">
              <BookOpen className="h-3 w-3 mr-1.5" /> No MB
            </Badge>
          )}
          {hasBillAbstract ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 justify-start" title="Bill Abstract Saved">
              <FileText className="h-3 w-3 mr-1.5" /> Bill Saved
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 justify-start" title="No Bill">
              <FileText className="h-3 w-3 mr-1.5" /> No Bill
            </Badge>
          )}
        </div>
      );
    },
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
                Edit Plan
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="text-red-600 focus:bg-red-50 focus:text-red-700">
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
