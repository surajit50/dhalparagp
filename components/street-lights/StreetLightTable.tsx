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
import { Eye, Pencil, MapPin, Camera, Filter, X, Search, MoreVertical, Ban, Copy, Trash2, PowerOff, Activity, AlertTriangle, CheckCircle2, Lightbulb, Map as MapIcon } from "lucide-react";
import { toast } from "sonner";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const { data, isLoading, mutate } = useSWR<{ lights: StreetLightRow[] }>(queryUrl, fetcher, {
    refreshInterval: 30000,
  });
  const { data: mouzas } = useSWR<MouzaOption[]>("/api/mouza-master", fetcher);

  const handleDeactivate = async (id: string) => {
    try {
      const res = await fetch(`/api/street-lights/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workingStatus: "NOT_WORKING" }),
      });
      if (!res.ok) throw new Error("Failed to deactivate");
      toast.success("Street light deactivated");
      mutate();
    } catch (error) {
      toast.error("Error deactivating street light");
    }
  };

  const handleRemovePole = async (id: string) => {
    try {
      const res = await fetch(`/api/street-lights/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workingStatus: "NOT_WORKING", lightCondition: "MISSING" }),
      });
      if (!res.ok) throw new Error("Failed to remove pole");
      toast.success("Pole marked as removed");
      mutate();
    } catch (error) {
      toast.error("Error removing pole");
    }
  };

  const handleHardDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this entry? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/street-lights/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete entry");
      toast.success("Mistake entry permanently deleted");
      mutate();
    } catch (error) {
      toast.error("Error deleting entry");
    }
  };



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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleDeactivate(row.original.id)}
              >
                <PowerOff className="mr-2 h-4 w-4" />
                <span>Deactivate Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRemovePole(row.original.id)}
                className="text-orange-600 focus:text-orange-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Remove Pole</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleHardDelete(row.original.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Mistake Entry</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];



  // Stats calculation
  const stats = useMemo(() => {
    const total = lights.length;
    const working = lights.filter((l) => l.workingStatus === "WORKING").length;
    const notWorking = lights.filter((l) => l.workingStatus === "NOT_WORKING").length;
    const repairable = lights.filter((l) => l.workingStatus === "REPAIRABLE").length;

    const mouzaMap = new globalThis.Map<string, { total: number; working: number; notWorking: number }>();
    lights.forEach((l) => {
      const mName = l.mouza?.mouzaName || "Unknown";
      const current = mouzaMap.get(mName) || { total: 0, working: 0, notWorking: 0 };
      current.total += 1;
      if (l.workingStatus === "WORKING") current.working += 1;
      else if (l.workingStatus === "NOT_WORKING") current.notWorking += 1;
      mouzaMap.set(mName, current);
    });

    const mouzaStats = [...mouzaMap.entries()]
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);

    return { total, working, notWorking, repairable, mouzaStats };
  }, [lights]);

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center space-x-4 transition-all hover:shadow-md">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Lights</p>
            <h3 className="text-2xl font-bold">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center space-x-4 transition-all hover:shadow-md">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Working</p>
            <h3 className="text-2xl font-bold">{stats.working}</h3>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center space-x-4 transition-all hover:shadow-md">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Not Working</p>
            <h3 className="text-2xl font-bold">{stats.notWorking}</h3>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center space-x-4 transition-all hover:shadow-md">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Repairable</p>
            <h3 className="text-2xl font-bold">{stats.repairable}</h3>
          </div>
        </div>
      </div>

      {/* Mouza-wise Report */}
      {stats.mouzaStats.length > 0 && (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden transition-all">
          <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Mouza-wise Distribution</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stats.mouzaStats.map((m) => (
                <div key={m.name} className="flex flex-col p-3 rounded-lg border bg-muted/10 hover:bg-muted/30 transition-colors">
                  <span className="font-medium text-sm mb-2 truncate" title={m.name}>{m.name}</span>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold text-foreground/90">{m.total}</span>
                    <div className="text-[11px] font-medium text-muted-foreground flex flex-col items-end gap-0.5">
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {m.working} W
                      </span>
                      <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {m.notWorking} NW
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
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