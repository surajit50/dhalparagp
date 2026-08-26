"use client";

import { useState } from "react";
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
import { Eye, Pencil, MapPin, Camera, Filter } from "lucide-react";
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

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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

export function StreetLightTable() {
  const router = useRouter();
  const [mouzaFilter, setMouzaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [search, setSearch] = useState("");

  const params = new URLSearchParams();
  if (mouzaFilter) params.set("mouzaId", mouzaFilter);
  if (statusFilter) params.set("workingStatus", statusFilter);
  if (conditionFilter) params.set("lightCondition", conditionFilter);
  params.set("limit", "200");

  const { data, isLoading } = useSWR(
    `/api/street-lights?${params.toString()}`,
    fetcher,
    { refreshInterval: 30000 }
  );
  const { data: mouzas } = useSWR("/api/mouza-master", fetcher);

  const lights: StreetLightRow[] = data?.lights ?? [];

  // Client-side text search
  const filtered = lights.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.lightId.toLowerCase().includes(q) ||
      l.mouza?.mouzaName?.toLowerCase().includes(q) ||
      l.landmark?.toLowerCase().includes(q) ||
      l.sansad?.toLowerCase().includes(q)
    );
  });

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
            {row.original.lightType}{row.original.wattage ? ` ${row.original.wattage}W` : ""}
          </span>
        ) : "—",
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

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center p-4 bg-muted/30 rounded-xl border border-border/50">
        <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <Input
          placeholder="Search by ID, Mouza, location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-64 bg-white"
        />
        <Select value={mouzaFilter} onValueChange={setMouzaFilter}>
          <SelectTrigger className="h-8 w-44 bg-white">
            <SelectValue placeholder="All Mouzas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Mouzas</SelectItem>
            {(mouzas ?? []).map((m: { id: string; mouzaName: string }) => (
              <SelectItem key={m.id} value={m.id}>{m.mouzaName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-40 bg-white">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="WORKING">Working</SelectItem>
            <SelectItem value="NOT_WORKING">Not Working</SelectItem>
          </SelectContent>
        </Select>
        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="h-8 w-44 bg-white">
            <SelectValue placeholder="All Conditions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Conditions</SelectItem>
            <SelectItem value="GOOD">Good</SelectItem>
            <SelectItem value="REPAIR_REQUIRED">Repair Required</SelectItem>
            <SelectItem value="DEFECTIVE">Defective</SelectItem>
            <SelectItem value="MISSING">Missing</SelectItem>
          </SelectContent>
        </Select>
        {(mouzaFilter || statusFilter || conditionFilter || search) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setMouzaFilter(""); setStatusFilter(""); setConditionFilter(""); setSearch(""); }}
            className="h-8 text-xs"
          >
            Clear filters
          </Button>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} light{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-muted-foreground">
                  Loading street light register…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-muted-foreground">
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

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <Button size="sm" variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
        </div>
      </div>
    </div>
  );
}
