"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import { Eye, Pencil, MapPin, Camera, Filter, X, Search } from "lucide-react";
import { fetcher } from "@/lib/utils";
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
import { StatusBadge } from "./StatusBadge";
import { LightIDBadge } from "./LightIDBadge";

interface StreetLightRow {
  id: string;
  lightId: string;
  mouza: { mouzaName: string };
  sansad?: string;
  landmark?: string;
  lightType?: string;
  wattage?: number;
  workingStatus: string;
  lightCondition: string;
  latitude?: number;
  longitude?: number;
  lightImageUrl?: string;
}

interface MouzaOption {
  id: string;
  mouzaName: string;
}

export function StreetLightTable() {
  const router = useRouter();
  const [mouzaFilter, setMouzaFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [conditionFilter, setConditionFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Build query URL with filters
  const queryUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (mouzaFilter && mouzaFilter !== "ALL") params.set("mouzaId", mouzaFilter);
    if (statusFilter && statusFilter !== "ALL") params.set("workingStatus", statusFilter);
    if (conditionFilter && conditionFilter !== "ALL") params.set("lightCondition", conditionFilter);
    params.set("limit", "200");
    return `/api/street-lights?${params.toString()}`;
  }, [mouzaFilter, statusFilter, conditionFilter]);

  // Fetch data
  const { data, isLoading } = useSWR<{ lights: StreetLightRow[] }>(queryUrl, fetcher, {
    refreshInterval: 30000,
  });
  const { data: mouzas } = useSWR<MouzaOption[]>("/api/mouza-master", fetcher);

  const lights = data?.lights ?? [];

  // Local search filter (client‑side)
  const filtered = useMemo(() => {
    if (!search) return lights;
    const q = search.toLowerCase();
    return lights.filter(
      (l) =>
        l.lightId.toLowerCase().includes(q) ||
        l.mouza?.mouzaName?.toLowerCase().includes(q) ||
        l.landmark?.toLowerCase().includes(q) ||
        l.sansad?.toLowerCase().includes(q)
    );
  }, [lights, search]);

  // ----- Table columns (unchanged) -----
  const columns: ColumnDef<StreetLightRow>[] = [
    {
      accessorKey: "lightId",
      header: "Light ID",
      cell: ({ row }) => <LightIDBadge lightId={row.original.lightId} showCopy />,
    },
    {
      accessorKey: "mouza.mouzaName",
      header: "Mouza",
      cell: ({ row }) => row.original.mouza?.mouzaName ?? "—",
    },
    {
      accessorKey: "sansad",
      header: "Sansad",
      cell: ({ row }) => row.original.sansad ?? "—",
    },
    {
      accessorKey: "landmark",
      header: "Location",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground max-w-[160px] truncate block">
          {row.original.landmark ?? "—"}
        </span>
      ),
    },
    {
      id: "type",
      header: "Type / Watt",
      cell: ({ row }) =>
        row.original.lightType ? (
          <span className="text-sm">
            {row.original.lightType}
            {row.original.wattage ? ` ${row.original.wattage}W` : ""}
          </span>
        ) : (
          "—"
        ),
    },
    {
      accessorKey: "workingStatus",
      header: "Status",
      cell: ({ row }) => <StatusBadge type="working" value={row.original.workingStatus} />,
    },
    {
      accessorKey: "lightCondition",
      header: "Condition",
      cell: ({ row }) => <StatusBadge type="condition" value={row.original.lightCondition} />,
    },
    {
      id: "indicators",
      header: "GPS / Photo",
      cell: ({ row }) => (
        <div className="flex gap-1.5">
          {row.original.latitude && row.original.longitude ? (
            <span title="GPS captured" className="text-emerald-500">
              <MapPin className="w-4 h-4" />
            </span>
          ) : (
            <span title="No GPS" className="text-muted-foreground/40">
              <MapPin className="w-4 h-4" />
            </span>
          )}
          {row.original.lightImageUrl ? (
            <span title="Photo available" className="text-emerald-500">
              <Camera className="w-4 h-4" />
            </span>
          ) : (
            <span title="No photo" className="text-muted-foreground/40">
              <Camera className="w-4 h-4" />
            </span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              router.push(`/admindashboard/street-lights/register/${row.original.id}`)
            }
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              router.push(`/admindashboard/street-lights/register/${row.original.id}/edit`)
            }
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  // React Table instance
  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (mouzaFilter !== "ALL") count++;
    if (statusFilter !== "ALL") count++;
    if (conditionFilter !== "ALL") count++;
    if (search !== "") count++;
    return count;
  }, [mouzaFilter, statusFilter, conditionFilter, search]);

  const clearAllFilters = () => {
    setMouzaFilter("ALL");
    setStatusFilter("ALL");
    setConditionFilter("ALL");
    setSearch("");
  };

  // ----- Debug wrappers for Select (remove after testing) -----
  const handleMouzaChange = (value: string) => {
    console.log("[Mouza filter] changed to:", value);
    setMouzaFilter(value);
  };
  const handleStatusChange = (value: string) => {
    console.log("[Status filter] changed to:", value);
    setStatusFilter(value);
  };
  const handleConditionChange = (value: string) => {
    console.log("[Condition filter] changed to:", value);
    setConditionFilter(value);
  };

  return (
    <div className="space-y-6">
      {/* ----- Improved Filter Bar ----- */}
      <div className="bg-card rounded-xl border shadow-sm p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, Mouza, landmark…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>

          {/* Mouza filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Mouza</label>
            <Select value={mouzaFilter} onValueChange={handleMouzaChange}>
              <SelectTrigger className="h-10 w-full bg-background">
                <SelectValue placeholder="All Mouzas" />
              </SelectTrigger>
              <SelectContent className="z-50"> {/* Ensure dropdown appears above other elements */}
                <SelectItem value="ALL">All Mouzas</SelectItem>
                {(mouzas ?? []).map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.mouzaName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-10 w-full bg-background">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="WORKING">Working</SelectItem>
                <SelectItem value="NOT_WORKING">Not Working</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Condition filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Condition</label>
            <Select value={conditionFilter} onValueChange={handleConditionChange}>
              <SelectTrigger className="h-10 w-full bg-background">
                <SelectValue placeholder="All Conditions" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="ALL">All Conditions</SelectItem>
                <SelectItem value="GOOD">Good</SelectItem>
                <SelectItem value="REPAIR_REQUIRED">Repair Required</SelectItem>
                <SelectItem value="DEFECTIVE">Defective</SelectItem>
                <SelectItem value="MISSING">Missing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear button */}
          <div className="flex items-end justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={clearAllFilters}
              disabled={activeFilterCount === 0}
              className="h-10 px-3 w-full sm:w-auto"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-muted-foreground border-t pt-3 mt-2">
          <span>{filtered.length} light{filtered.length !== 1 ? "s" : ""}</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* ----- Table ----- */}
      <div className="rounded-lg border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className="px-4 py-3 font-semibold text-xs uppercase tracking-wide"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12 text-muted-foreground"
                >
                  Loading street light register…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12 text-muted-foreground"
                >
                  No street lights found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ----- Pagination ----- */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
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
