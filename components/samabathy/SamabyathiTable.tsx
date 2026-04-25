"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Calendar,
  FileText,
  PlusCircle,
  ArrowUpDown,
  Search,
  X,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";

interface SamabyathiApplication {
  id: string;
  applicationNumber: string | null;
  applicantName: string;
  mobileNumber: string;
  villageName: string;
  deceasedName: string;
  relation: string;
  dateOfDeath: Date | string;
  status: string;
  sanctionAmount: number | null;
  createdAt: Date | string;
}

interface SamabyathiTableProps {
  data: SamabyathiApplication[];
}

export default function SamabyathiTable({ data }: SamabyathiTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<SamabyathiApplication>[] = [
    {
      accessorKey: "applicationNumber",
      header: "App Number",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-primary">
          {row.getValue("applicationNumber") || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "applicantName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0 font-semibold"
          >
            <User className="h-3.5 w-3.5 mr-2" />
            Applicant
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">
            {row.getValue("applicantName")}
          </span>
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-tighter">
            ID: {row.original.id.slice(-6)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "villageName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0 font-semibold"
          >
            <MapPin className="h-3.5 w-3.5 mr-2" />
            Village
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("villageName")}</span>
      ),
    },
    {
      accessorKey: "deceasedName",
      header: "Deceased",
      cell: ({ row }) => row.getValue("deceasedName"),
    },
    {
      accessorKey: "dateOfDeath",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0 font-semibold"
          >
            <Calendar className="h-3.5 w-3.5 mr-2" />
            Date of Death
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("dateOfDeath"));
        return (
          <span className="text-muted-foreground">
            {format(date, "dd MMM yyyy")}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={
              status === "APPROVED" || status === "PAID"
                ? "default"
                : status === "PENDING"
                  ? "secondary"
                  : status === "UNDER_REVIEW"
                    ? "outline"
                    : "outline"
            }
            className={
              status === "APPROVED" || status === "PAID"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                : status === "PENDING"
                  ? "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20"
                  : status === "UNDER_REVIEW"
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"
                    : ""
            }
          >
            {status.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "sanctionAmount",
      header: () => <div className="text-right pr-6">Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("sanctionAmount") || "0");
        return (
          <div className="text-right font-bold text-foreground pr-6">
            ₹{amount.toLocaleString("en-IN")}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Global Search Input */}
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all columns..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9 pr-9"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-background overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
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
                  className="group hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-[300px] text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-4 bg-muted rounded-full">
                      <FileText className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-medium">
                        {globalFilter
                          ? "No results found"
                          : "No applications found"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {globalFilter
                          ? `No applications matching "${globalFilter}" were found.`
                          : "Get started by creating a new application."}
                      </p>
                    </div>
                    {!globalFilter && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="mt-4"
                      >
                        <Link href="/admindashboard/manage-samabyathi/applications/new">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          New Application
                        </Link>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-2 py-4 border-t">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{" "}
            to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              data.length,
            )}{" "}
            of {data.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
