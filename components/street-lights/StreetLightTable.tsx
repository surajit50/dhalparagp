"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StatusBadge } from "./StatusBadge";
import { LightIDBadge } from "./LightIDBadge";
import { DataTable } from "../data-table";

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Keys to force re‑render of uncontrolled Selects when cleared
  const [mouzaKey, setMouzaKey] = useState(0);
  const [statusKey, setStatusKey] = useState(0);
  const [conditionKey, setConditionKey] = useState(0);

  // Build query URL
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

  // Local search filter
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

  // Table columns (unchanged)
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
        <span className="text-sm text-muted-foreground break-words whitespace-pre-wrap max-w-xs block">
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
            <span
              title="Photo available"
              className="text-emerald-500 cursor-pointer hover:text-emerald-600 transition-colors"
              onClick={() => setSelectedImage(row.original.lightImageUrl!)}
            >
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



  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-background p-4 rounded-xl border shadow-sm">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lights..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <Select
            key={`mouza-${mouzaKey}`}
            value={mouzaFilter}
            onValueChange={setMouzaFilter}
          >
            <SelectTrigger className="w-[160px] h-10">
              <SelectValue placeholder="Mouza" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Mouzas</SelectItem>
              {mouzas?.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.mouzaName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            key={`status-${statusKey}`}
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[160px] h-10">
              <SelectValue placeholder="Working Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="WORKING">Working</SelectItem>
              <SelectItem value="NOT_WORKING">Not Working</SelectItem>
              <SelectItem value="REPAIRABLE">Repairable</SelectItem>
            </SelectContent>
          </Select>

          <Select
            key={`condition-${conditionKey}`}
            value={conditionFilter}
            onValueChange={setConditionFilter}
          >
            <SelectTrigger className="w-[160px] h-10">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Conditions</SelectItem>
              <SelectItem value="GOOD">Good</SelectItem>
              <SelectItem value="DAMAGED">Damaged</SelectItem>
              <SelectItem value="MISSING">Missing</SelectItem>
            </SelectContent>
          </Select>

          {(mouzaFilter !== "ALL" || statusFilter !== "ALL" || conditionFilter !== "ALL" || search) && (
            <Button
              variant="ghost"
              onClick={() => {
                setMouzaFilter("ALL");
                setStatusFilter("ALL");
                setConditionFilter("ALL");
                setSearch("");
                setMouzaKey((prev) => prev + 1);
                setStatusKey((prev) => prev + 1);
                setConditionKey((prev) => prev + 1);
              }}
              className="h-10 px-3 text-muted-foreground"
            >
              <Filter className="w-4 h-4 mr-2" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
      />

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="sm:max-w-xl p-0 border-none bg-transparent shadow-none">
          {selectedImage && (
            <img src={selectedImage} alt="Street Light" className="w-full h-auto rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}