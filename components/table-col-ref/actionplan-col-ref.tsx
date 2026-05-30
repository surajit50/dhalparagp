"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Calculator, BookOpen, FileText } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

import { ApprovedActionPlanDetails, WorksDetail } from "@prisma/client";

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
      return <div className="text-muted-foreground font-medium text-center">{pageIndex * pageSize + row.index + 1}</div>;
    },
  },
  {
    accessorKey: "activityCode",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 hover:bg-transparent">
        Activity Code
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("activityCode")}</div>,
  },
  {
    accessorKey: "activityName",
    header: "Activity Name",
    cell: ({ row }) => <div className="font-medium min-w-[200px]">{row.getValue("activityName")}</div>,
  },
  {
    accessorKey: "activityDescription",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[300px] text-sm text-muted-foreground line-clamp-2" title={row.getValue("activityDescription")}>
        {row.getValue("activityDescription")}
      </div>
    ),
  },
  {
    accessorKey: "financialYear",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 hover:bg-transparent">
        Financial Year
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <Badge variant="outline">{row.getValue("financialYear")}</Badge>,
  },
  {
    accessorKey: "themeName",
    header: "Theme Name",
    cell: ({ row }) => <div>{row.getValue("themeName") || "-"}</div>,
  },
  {
    accessorKey: "activityFor",
    header: "Activity For",
    cell: ({ row }) => <div>{row.getValue("activityFor") || "-"}</div>,
  },
  {
    accessorKey: "sector",
    header: "Sector",
    cell: ({ row }) => <div>{row.getValue("sector") || "-"}</div>,
  },
  {
    accessorKey: "locationofAsset",
    header: "Location of Asset",
    cell: ({ row }) => <div>{row.getValue("locationofAsset") || "-"}</div>,
  },
  {
    accessorKey: "estimatedCost",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 hover:bg-transparent">
        Est. Cost (₹)
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = row.getValue("estimatedCost") as number;
      return <div className="font-semibold text-right">₹{amount?.toLocaleString("en-IN") || 0}</div>;
    },
  },
  {
    accessorKey: "generalFund",
    header: "General Fund (₹)",
    cell: ({ row }) => {
      const amount = row.getValue("generalFund") as number;
      return <div className="text-right">₹{amount?.toLocaleString("en-IN") || 0}</div>;
    },
  },
  {
    accessorKey: "scFund",
    header: "SC Fund (₹)",
    cell: ({ row }) => {
      const amount = row.getValue("scFund") as number;
      return <div className="text-right">₹{amount?.toLocaleString("en-IN") || 0}</div>;
    },
  },
  {
    accessorKey: "stFund",
    header: "ST Fund (₹)",
    cell: ({ row }) => {
      const amount = row.getValue("stFund") as number;
      return <div className="text-right">₹{amount?.toLocaleString("en-IN") || 0}</div>;
    },
  },
  {
    accessorKey: "fundType",
    header: "Fund Type",
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("fundType") || "-"}</Badge>,
  },
  {
    accessorKey: "totalduration",
    header: "Total Duration",
    cell: ({ row }) => <div>{row.getValue("totalduration") || "-"}</div>,
  },
  {
    accessorKey: "schemeName",
    header: "Scheme Name",
    cell: ({ row }) => <div>{row.getValue("schemeName") || "-"}</div>,
  },
  {
    accessorKey: "upasamiti",
    header: "Upasamiti",
    cell: ({ row }) => {
      const upasamiti = row.getValue("upasamiti") as string;
      return <div>{upasamiti?.replace(/_/g, " ") || "-"}</div>;
    },
  },
  {
    accessorKey: "focusArea",
    header: "Focus Area",
    cell: ({ row }) => <div>{row.getValue("focusArea") || "-"}</div>,
  },
  {
    accessorKey: "workType",
    header: "Work Type",
    cell: ({ row }) => <div>{row.getValue("workType") || "-"}</div>,
  },
  {
    accessorKey: "componentType",
    header: "Component Type",
    cell: ({ row }) => <div>{row.getValue("componentType") || "-"}</div>,
  },
  {
    accessorKey: "gramSansad",
    header: "Gram Sansad",
    cell: ({ row }) => <div>{row.getValue("gramSansad") || "-"}</div>,
  },
  {
    accessorKey: "sdgs",
    header: "SDGs",
    cell: ({ row }) => <div className="max-w-[150px] truncate" title={row.getValue("sdgs")}>{row.getValue("sdgs") || "-"}</div>,
  },
  {
    accessorKey: "beneficiariesSC",
    header: "Beneficiaries (SC)",
    cell: ({ row }) => <div className="text-right">{row.getValue("beneficiariesSC") || 0}</div>,
  },
  {
    accessorKey: "beneficiariesST",
    header: "Beneficiaries (ST)",
    cell: ({ row }) => <div className="text-right">{row.getValue("beneficiariesST") || 0}</div>,
  },
  {
    accessorKey: "beneficiariesGen",
    header: "Beneficiaries (Gen)",
    cell: ({ row }) => <div className="text-right">{row.getValue("beneficiariesGen") || 0}</div>,
  },
  {
    accessorKey: "unitType",
    header: "Unit Type",
    cell: ({ row }) => <div>{row.getValue("unitType") || "-"}</div>,
  },
  {
    accessorKey: "totalUnit",
    header: "Total Unit",
    cell: ({ row }) => <div className="text-right">{row.getValue("totalUnit") || 0}</div>,
  },
  {
    accessorKey: "implementedBy",
    header: "Implemented By",
    cell: ({ row }) => <div>{row.getValue("implementedBy") || "-"}</div>,
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ row }) => (
      <div className="max-w-[200px] text-sm text-muted-foreground line-clamp-2" title={row.getValue("remarks")}>
        {row.getValue("remarks") || "-"}
      </div>
    ),
  },
  {
    accessorKey: "isPublish",
    header: "Published",
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublish") as boolean;
      return isPublished ? (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Published</Badge>
      ) : (
        <Badge variant="outline" className="text-amber-600">Draft</Badge>
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
        <div className="flex flex-col gap-1.5 min-w-[100px]">
          <Badge variant={hasEstimate ? "default" : "outline"} className={hasEstimate ? "bg-orange-500" : ""}>
            <Calculator className="h-3 w-3 mr-1" /> {hasEstimate ? "Estimate" : "No Est."}
          </Badge>
          <Badge variant={hasMB ? "default" : "outline"} className={hasMB ? "bg-purple-500" : ""}>
            <BookOpen className="h-3 w-3 mr-1" /> {hasMB ? "MB" : "No MB"}
          </Badge>
          <Badge variant={hasBillAbstract ? "default" : "outline"} className={hasBillAbstract ? "bg-green-500" : ""}>
            <FileText className="h-3 w-3 mr-1" /> {hasBillAbstract ? "Bill" : "No Bill"}
          </Badge>
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
