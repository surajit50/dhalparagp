"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Eye, Edit } from "lucide-react";
import { TubewellSurveyInput } from "@/schema/tubewell";

// Mock Data
const data: (TubewellSurveyInput & { id: string, dateAdded: string })[] = [
  {
    id: "1",
    tubewellNo: "TW-001",
    tubewellType: "MARK_II",
    condition: "WORKING",
    landmark: "Near Primary School",
    latitude: 26.123,
    longitude: 89.123,
    dateAdded: "2023-10-01",
  },
  {
    id: "2",
    tubewellNo: "TW-002",
    tubewellType: "ORDINARY",
    condition: "DEFECTIVE",
    landmark: "House of Ram",
    latitude: 26.124,
    longitude: 89.124,
    dateAdded: "2023-10-05",
  },
  {
    id: "3",
    tubewellNo: "TW-003",
    tubewellType: "SUBMERSIBLE",
    condition: "WORKING",
    landmark: "Market Crossing",
    latitude: 26.125,
    longitude: 89.125,
    dateAdded: "2023-10-10",
  },
];

const columns: ColumnDef<TubewellSurveyInput & { id: string, dateAdded: string }>[] = [
  {
    accessorKey: "tubewellNo",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Tubewell No.
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-semibold text-blue-700 ml-4">{row.getValue("tubewellNo")}</div>,
  },
  {
    accessorKey: "tubewellType",
    header: "Type",
    cell: ({ row }) => {
      const val = row.getValue("tubewellType") as string;
      return <Badge variant="outline" className="text-blue-600 border-blue-200">{val.replace("_", " ")}</Badge>;
    },
  },
  {
    accessorKey: "landmark",
    header: "Landmark",
  },
  {
    accessorKey: "condition",
    header: "Condition",
    cell: ({ row }) => {
      const condition = row.getValue("condition") as string;
      const getVariant = () => {
        if (condition === "WORKING") return "default"; // green-ish in custom badges usually
        if (condition === "DEFECTIVE") return "destructive";
        return "secondary";
      };
      const getColorClass = () => {
        if (condition === "WORKING") return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
        if (condition === "DEFECTIVE") return "bg-rose-100 text-rose-700 hover:bg-rose-100";
        return "bg-slate-100 text-slate-700 hover:bg-slate-100";
      };

      return <Badge className={getColorClass()}>{condition}</Badge>;
    },
  },
  {
    accessorKey: "dateAdded",
    header: "Date Registered",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:bg-slate-100">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export function TubewellTable() {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-blue-50/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No tubewells found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  );
}
