"use client"

import { useState } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  getFilteredRowModel,
  getPaginationRowModel,
  type VisibilityState,
} from "@tanstack/react-table"
import * as XLSX from "xlsx"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  FileDown,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings2,
} from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  containerClass?: string
  rowSelection?: Record<string, boolean>
  setRowSelection?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  renderBulkActions?: (table: any) => React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  containerClass,
  rowSelection = {},
  setRowSelection,
  renderBulkActions,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      globalFilter,
      rowSelection,
      columnVisibility,
    },
    enableRowSelection: true,
  })

  const handleExcelExport = () => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
    XLSX.writeFile(wb, "exported_data.xlsx")
  }

  return (
    <div className={`space-y-6 ${containerClass}`}>
      
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-background border rounded-xl p-4 shadow-sm">

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 pr-10 h-10 rounded-lg"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {renderBulkActions && renderBulkActions(table)}
          
          <span className="text-sm text-muted-foreground hidden sm:block whitespace-nowrap">
            {table.getFilteredRowModel().rows.length} records
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-lg">
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">View</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px] max-h-[350px] overflow-y-auto custom-scrollbar">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id.replace(/([A-Z])/g, " $1").trim()}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={handleExcelExport}
            variant="outline"
            className="gap-2 rounded-lg"
          >
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-background overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/40">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-5 py-3 text-sm font-medium cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <>
                          {{
                            asc: <ChevronUp className="h-4 w-4" />,
                            desc: <ChevronDown className="h-4 w-4" />,
                          }[header.column.getIsSorted() as string] ?? (
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/50 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-5 py-4 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Search className="h-8 w-8" />
                    No records found
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">

        <span className="text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() =>
              table.setPageIndex(table.getPageCount() - 1)
            }
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
