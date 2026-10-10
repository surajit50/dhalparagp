
"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  FilterX,
  Search,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { columns, type WorkTableData } from "./columns";

type WorkTableProps = {
  data: WorkTableData[];
};

const controlClass =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

export function WorkTable({ data }: WorkTableProps) {
  const [selectedFund, setSelectedFund] = useState("");
  const [selectedNit, setSelectedNit] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  const fundOptions = useMemo(
    () =>
      [...new Set(data.map((work) => work.fundName).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b)
      ),
    [data]
  );

  const fundWorks = useMemo(
    () =>
      selectedFund
        ? data.filter((work) => work.fundName === selectedFund)
        : data,
    [data, selectedFund]
  );

  const nitOptions = useMemo(() => {
    const uniqueNits = new Map<string, string>();

    for (const work of fundWorks) {
      if (work.nitId) {
        uniqueNits.set(work.nitId, work.nitNo);
      }
    }

    return [...uniqueNits.entries()]
      .map(([id, nitNo]) => ({ id, nitNo }))
      .sort((a, b) => a.nitNo.localeCompare(b.nitNo));
  }, [fundWorks]);

  const nitWorks = useMemo(
    () =>
      selectedNit
        ? fundWorks.filter((work) => work.nitId === selectedNit)
        : fundWorks,
    [fundWorks, selectedNit]
  );

  const agencyOptions = useMemo(
    () =>
      [
        ...new Set(
          nitWorks
            .map((work) => work.agencyName)
            .filter(
              (name) => name && name !== "Not assigned"
            )
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [nitWorks]
  );

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.filter((work) => {
      const matchesFund =
        !selectedFund || work.fundName === selectedFund;

      const matchesNit =
        !selectedNit || work.nitId === selectedNit;

      const matchesAgency =
        !selectedAgency || work.agencyName === selectedAgency;

      const searchableText = [
        work.description,
        work.nitNo,
        work.agencyName,
        work.workSlNo.toString(),
        work.fundName,
        work.financialYear,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      return (
        matchesFund &&
        matchesNit &&
        matchesAgency &&
        matchesSearch
      );
    });
  }, [data, selectedFund, selectedNit, selectedAgency, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / pageSize)
  );

  // Keep the current page within range if filters reduce the results.
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, safePage]);

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  function resetFilters() {
    setSelectedFund("");
    setSelectedNit("");
    setSelectedAgency("");
    setSearch("");
    setCurrentPage(1);
  }

  const firstItem =
    filteredData.length === 0
      ? 0
      : (safePage - 1) * pageSize + 1;

  const lastItem = Math.min(
    safePage * pageSize,
    filteredData.length
  );

  return (
    <div className="space-y-5">
      {/* Cascading filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <Search className="h-4 w-4" />
              Filter Works
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Select a fund first, then select its NIT and agency.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="gap-2"
          >
            <FilterX className="h-4 w-4" />
            Reset Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Fund */}
          <div className="space-y-1.5">
            <label
              htmlFor="fund-filter"
              className="text-sm font-medium text-slate-700"
            >
              1. Fund Name
            </label>

            <select
              id="fund-filter"
              className={controlClass}
              value={selectedFund}
              onChange={(event) => {
                setSelectedFund(event.target.value);
                setSelectedNit("");
                setSelectedAgency("");
                setCurrentPage(1);
              }}
            >
              <option value="">All Funds</option>
              {fundOptions.map((fund) => (
                <option key={fund} value={fund}>
                  {fund}
                </option>
              ))}
            </select>
          </div>

          {/* NIT */}
          <div className="space-y-1.5">
            <label
              htmlFor="nit-filter"
              className="text-sm font-medium text-slate-700"
            >
              2. NIT Number
            </label>

            <select
              id="nit-filter"
              className={controlClass}
              value={selectedNit}
              disabled={!selectedFund}
              onChange={(event) => {
                setSelectedNit(event.target.value);
                setSelectedAgency("");
                setCurrentPage(1);
              }}
            >
              <option value="">
                {selectedFund ? "All NITs" : "Select fund first"}
              </option>

              {nitOptions.map((nit) => (
                <option key={nit.id} value={nit.id}>
                  {nit.nitNo}
                </option>
              ))}
            </select>
          </div>

          {/* Agency */}
          <div className="space-y-1.5">
            <label
              htmlFor="agency-filter"
              className="text-sm font-medium text-slate-700"
            >
              3. Agency Name
            </label>

            <select
              id="agency-filter"
              className={controlClass}
              value={selectedAgency}
              disabled={!selectedNit}
              onChange={(event) => {
                setSelectedAgency(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">
                {selectedNit
                  ? "All Agencies"
                  : "Select NIT first"}
              </option>

              {agencyOptions.map((agency) => (
                <option key={agency} value={agency}>
                  {agency}
                </option>
              ))}
            </select>
          </div>

          {/* General search */}
          <div className="space-y-1.5">
            <label
              htmlFor="work-search"
              className="text-sm font-medium text-slate-700"
            >
              Search Works
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                id="work-search"
                type="search"
                placeholder="Work name, NIT, agency..."
                className={`${controlClass} pl-9`}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="text-sm text-slate-600">
            Matching works:{" "}
            <span className="font-semibold text-slate-900">
              {filteredData.length}
            </span>
          </p>

          {(selectedFund ||
            selectedNit ||
            selectedAgency ||
            search) && (
            <p className="text-xs text-slate-500">
              Filters are applied together.
            </p>
          )}
        </div>
      </div>

      {/* Works table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-slate-200 bg-slate-50"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap py-4 text-sm font-semibold text-slate-700"
                    >
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
                  <TableRow
                    key={row.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50/70"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="align-middle"
                      >
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
                    className="h-40 text-center"
                  >
                    <div className="space-y-2 text-slate-500">
                      <p className="font-medium">
                        No works found
                      </p>
                      <p className="text-sm">
                        Try changing the fund, NIT, agency, or search text.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-medium text-slate-800">
            {firstItem}–{lastItem}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-800">
            {filteredData.length}
          </span>{" "}
          works
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={safePage <= 1}
            onClick={() =>
              setCurrentPage((page) => Math.max(1, page - 1))
            }
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>

          <span className="whitespace-nowrap rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
            Page {safePage} of {totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() =>
              setCurrentPage((page) =>
                Math.min(totalPages, page + 1)
              )
            }
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
