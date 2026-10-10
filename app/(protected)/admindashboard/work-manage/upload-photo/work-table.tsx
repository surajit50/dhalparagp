
"use client";

import { useMemo, useState } from "react";
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { columns, type WorkTableData } from "./columns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type WorkTableProps = {
  data: WorkTableData[];
};

export function WorkTable({ data }: WorkTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [selectedFund, setSelectedFund] = useState("all");
  const [selectedNit, setSelectedNit] = useState("all");
  const [selectedAgency, setSelectedAgency] = useState("all");

  // Get unique fund names.
  const funds = useMemo(() => {
    return [...new Set(data.map((item) => item.fundName))].sort();
  }, [data]);

  // Get NIT options according to the selected fund.
  const nits = useMemo(() => {
    const filtered = data.filter(
      (item) =>
        selectedFund === "all" || item.fundName === selectedFund
    );

    const uniqueNits = new Map<
      string,
      { id: string; label: string }
    >();

    filtered.forEach((item) => {
      const id = item.nitId || item.nitNo;

      if (!uniqueNits.has(id)) {
        uniqueNits.set(id, {
          id,
          label: item.nitNo,
        });
      }
    });

    return [...uniqueNits.values()].sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [data, selectedFund]);

  // Get agency options according to the selected fund and NIT.
  const agencies = useMemo(() => {
    const filtered = data.filter(
      (item) =>
        (selectedFund === "all" ||
          item.fundName === selectedFund) &&
        (selectedNit === "all" ||
          item.nitId === selectedNit ||
          (!item.nitId && item.nitNo === selectedNit))
    );

    return [
      ...new Set(
        filtered.flatMap((item) =>
          item.agencyName.split(", ")
        ),
      ),
    ]
      .filter(
        (name) => name && name !== "Not assigned"
      )
      .sort((a, b) => a.localeCompare(b));
  }, [data, selectedFund, selectedNit]);

  // Apply all three cascading filters.
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const fundMatches =
        selectedFund === "all" ||
        item.fundName === selectedFund;

      const nitMatches =
        selectedNit === "all" ||
        item.nitId === selectedNit ||
        (!item.nitId && item.nitNo === selectedNit);

      const agencyMatches =
        selectedAgency === "all" ||
        item.agencyName
          .split(", ")
          .includes(selectedAgency);

      return fundMatches && nitMatches && agencyMatches;
    });
  }, [data, selectedFund, selectedNit, selectedAgency]);

  // Configure the data table.
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Reset dependent filters when a parent filter changes.
  function handleFundChange(value: string) {
    setSelectedFund(value);
    setSelectedNit("all");
    setSelectedAgency("all");
    table.setPageIndex(0);
  }

  function handleNitChange(value: string) {
    setSelectedNit(value);
    setSelectedAgency("all");
    table.setPageIndex(0);
  }

  function handleAgencyChange(value: string) {
    setSelectedAgency(value);
    table.setPageIndex(0);
  }

  function handleSearchChange(value: string) {
    setGlobalFilter(value);
    table.setPageIndex(0);
  }

  function resetFilters() {
    setSelectedFund("all");
    setSelectedNit("all");
    setSelectedAgency("all");
    setGlobalFilter("");
    setColumnFilters([]);
    table.setPageIndex(0);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Fund filter */}
        <Select
          value={selectedFund}
          onValueChange={handleFundChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by fund" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Funds</SelectItem>

            {funds.map((fund) => (
              <SelectItem key={fund} value={fund}>
                {fund}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* NIT filter */}
        <Select
          value={selectedNit}
          onValueChange={handleNitChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by NIT" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All NITs</SelectItem>

            {nits.map((nit) => (
              <SelectItem key={nit.id} value={nit.id}>
                {nit.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Agency filter */}
        <Select
          value={selectedAgency}
          onValueChange={handleAgencyChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by agency" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Agencies</SelectItem>

            {agencies.map((agency) => (
              <SelectItem key={agency} value={agency}>
                {agency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <Input
          placeholder="Search works..."
          value={globalFilter}
          onChange={(event) =>
            handleSearchChange(event.target.value)
          }
        />
      </div>

      {/* Results summary */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} work(s)
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={resetFilters}
        >
          Reset Filters
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No works found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Page{" "}
          {table.getState().pagination.pageIndex + 1} of{" "}
          {Math.max(table.getPageCount(), 1)}
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
