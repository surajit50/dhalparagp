
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
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedFund, setSelectedFund] = useState("all");
  const [selectedNit, setSelectedNit] = useState("all");
  const [selectedAgency, setSelectedAgency] = useState("all");

  const funds = useMemo(
    () => [...new Set(data.map((item) => item.fundName))].sort(),
    [data]
  );

  const nits = useMemo(() => {
    const filtered = data.filter(
      (item) => selectedFund === "all" || item.fundName === selectedFund
    );

    return [
      ...new Map(
        filtered.map((item) => [
          item.nitId || item.nitNo,
          { id: item.nitId || item.nitNo, label: item.nitNo },
        ])
      ).values(),
    ];
  }, [data, selectedFund]);

  const agencies = useMemo(() => {
    const filtered = data.filter(
      (item) =>
        (selectedFund === "all" || item.fundName === selectedFund) &&
        (selectedNit === "all" ||
          item.nitId === selectedNit ||
          (!item.nitId && item.nitNo === selectedNit))
    );

    return [...new Set(filtered.flatMap((item) => item.agencyName.split(", "))]
      .filter((name) => name && name !== "Not assigned")]
      .sort();
  }, [data, selectedFund, selectedNit]);

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        const fundMatches =
          selectedFund === "all" || item.fundName === selectedFund;

        const nitMatches =
          selectedNit === "all" ||
          item.nitId === selectedNit ||
          (!item.nitId && item.nitNo === selectedNit);

        const agencyMatches =
          selectedAgency === "all" ||
          item.agencyName
            .split(", ")
            .some((agency) => agency === selectedAgency);

        return fundMatches && nitMatches && agencyMatches;
      }),
    [data, selectedFund, selectedNit, selectedAgency]
  );

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

  function handleFundChange(value: string) {
    setSelectedFund(value);
    setSelectedNit("all");
    setSelectedAgency("all");
  }

  function handleNitChange(value: string) {
    setSelectedNit(value);
    setSelectedAgency("all");
  }

  function resetFilters() {
    setSelectedFund("all");
    setSelectedNit("all");
    setSelectedAgency("all");
    setGlobalFilter("");
    setColumnFilters([]);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select value={selectedFund} onValueChange={handleFundChange}>
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

        <Select value={selectedNit} onValueChange={handleNitChange}>
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

        <Select
          value={selectedAgency}
          onValueChange={setSelectedAgency}
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

        <Input
          placeholder="Search works..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing {filteredData.length} work(s)
        </p>
        <Button variant="outline" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>

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
            {table.getRowModel().rows.length ? (
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

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {Math.max(table.getPageCount(), 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
