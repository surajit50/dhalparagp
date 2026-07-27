"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { deletePond, verifyPond } from "./actions";
import { PondDialog } from "./pond-dialog";
import { PondInventoryPrint } from "./pond-inventory-print";
import {
  formatPondAreaAcre,
  formatPondLocationDisplay,
  parsePondAreaDecimal,
} from "@/lib/utils/pond-lease";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowUpRight,
  CheckCircle2,
  MapPin,
  Search,
  Trash2,
  Waves,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PondsClientProps {
  data: any[];
}

type PondStatusFilter = "ALL" | "AVAILABLE" | "LEASED" | "PUBLIC";

const pondStatusOptions: Array<{ value: PondStatusFilter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "AVAILABLE", label: "Available" },
  { value: "LEASED", label: "Leased" },
  { value: "PUBLIC", label: "Public" },
];

export function PondsClient({ data }: PondsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PondStatusFilter>("ALL");

  const totalPonds = data.length;
  const availablePonds = data.filter((pond) => pond.status === "AVAILABLE").length;
  const leasedPonds = data.filter((pond) => pond.status === "LEASED").length;
  const publicPonds = data.filter(
    (pond) => pond.pondType === "PUBLIC" || pond.status === "PUBLIC_USE",
  ).length;

  const filteredData = useMemo(() => {
    return data.filter((pond) => {
      const matchesSearch =
        (pond.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (pond.jlNo?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (pond.plotNo?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (pond.location?.toLowerCase() ?? "").includes(
          searchTerm.toLowerCase(),
        );

      let matchesStatus = true;
      if (statusFilter === "AVAILABLE") {
        matchesStatus = pond.status === "AVAILABLE";
      } else if (statusFilter === "LEASED") {
        matchesStatus = pond.status === "LEASED";
      } else if (statusFilter === "PUBLIC") {
        matchesStatus =
          pond.pondType === "PUBLIC" || pond.status === "PUBLIC_USE";
      }

      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const handleDelete = async (id: string) => {
    try {
      await deletePond(id);
      toast.success("Pond deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete pond");
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await verifyPond(id);
      toast.success("Pond verified successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to verify pond");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "ALL";

  const getStatusBadge = (pond: any) => {
    if (pond.pondType === "PUBLIC" || pond.status === "PUBLIC_USE") {
      return (
        <Badge className="rounded-full border-sky-200/70 bg-sky-500/10 text-sky-700 hover:bg-sky-500/20">
          PUBLIC USE
        </Badge>
      );
    }

    if (pond.status === "AVAILABLE") {
      return (
        <Badge className="rounded-full border-emerald-200/70 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20">
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          AVAILABLE
        </Badge>
      );
    }

    return (
      <Badge className="rounded-full border-amber-200/70 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20">
        <XCircle className="mr-1.5 h-3.5 w-3.5" />
        LEASED
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-background/85 p-6 shadow-sm backdrop-blur xl:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
        <div className="absolute -right-12 top-0 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-16 left-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <Badge
              variant="outline"
              className="rounded-full border-blue-200/70 bg-blue-50/80 px-3 py-1 text-blue-700"
            >
              Pond register
            </Badge>

            <div className="space-y-2">
              <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-700 shadow-sm">
                  <Waves className="h-6 w-6" />
                </span>
                Pond Inventory Management
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Browse pond records, spot lease availability quickly, and manage
                inventory from a more polished overview.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 xl:justify-end">
            <PondInventoryPrint ponds={filteredData} />
            <PondDialog />
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Total Ponds
                </p>
                <p className="mt-2 text-2xl font-semibold">{totalPonds}</p>
              </div>
              <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-700">
                <Waves className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Available
                </p>
                <p className="mt-2 text-2xl font-semibold text-emerald-700">
                  {availablePonds}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Leased
                </p>
                <p className="mt-2 text-2xl font-semibold text-amber-700">
                  {leasedPonds}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-700">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Public Use
                </p>
                <p className="mt-2 text-2xl font-semibold text-sky-700">
                  {publicPonds}
                </p>
              </div>
              <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-700">
                <MapPin className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-border/60 bg-background/90 shadow-sm">
        <CardHeader className="space-y-5 border-b bg-muted/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl font-semibold">Pond List</CardTitle>
                <Badge variant="outline" className="rounded-full">
                  {filteredData.length} showing
                </Badge>
                {hasActiveFilters && (
                  <Badge
                    variant="outline"
                    className="rounded-full border-blue-200 bg-blue-50 text-blue-700"
                  >
                    {statusFilter === "ALL"
                      ? "Search active"
                      : pondStatusOptions.find(
                          (option) => option.value === statusFilter,
                        )?.label}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Review pond details, lease availability, and quick actions from
                a cleaner inventory table.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by pond, JL no, plot no, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 rounded-xl border-border/60 bg-background pl-9 pr-9"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Tabs
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as PondStatusFilter)
                  }
                  className="w-full md:w-auto"
                >
                  <TabsList className="grid h-11 w-full grid-cols-4 rounded-xl border border-border/60 bg-background p-1 md:w-auto">
                    {pondStatusOptions.map((option) => (
                      <TabsTrigger
                        key={option.value}
                        value={option.value}
                        className="rounded-lg px-3"
                      >
                        {option.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="h-11 rounded-xl"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center text-muted-foreground">
              <Waves className="mb-4 h-12 w-12 opacity-30" />
              <p className="text-lg font-medium text-foreground">No ponds found</p>
              <p className="mt-1 text-sm">
                Try adjusting your search terms or filters.
              </p>
              {hasActiveFilters && (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-4 p-4 md:hidden">
                {filteredData.map((pond, index) => (
                  <div
                    key={pond.id}
                    className="rounded-3xl border border-border/60 bg-background/90 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Record #{index + 1}
                        </p>
                        <p className="mt-1 text-lg font-semibold">{pond.name}</p>
                        <div className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                          <span>{formatPondLocationDisplay(pond)}</span>
                        </div>
                      </div>
                      {getStatusBadge(pond)}
                    </div>

                    <div className="mt-4 grid gap-3 rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">Area</span>
                        <div className="text-right">
                          <div className="font-medium">
                            {pond.area ? `${pond.area} Decimal` : "N/A"}
                          </div>
                          {pond.area &&
                            formatPondAreaAcre(parsePondAreaDecimal(pond.area)) && (
                              <div className="text-xs text-blue-700">
                                {formatPondAreaAcre(
                                  parsePondAreaDecimal(pond.area),
                                )}
                              </div>
                            )}
                        </div>
                      </div>

                      {(pond.status === "LEASED" ||
                        (pond.pondType !== "PUBLIC" &&
                          pond.status !== "PUBLIC_USE" &&
                          pond.status !== "AVAILABLE")) && (
                        <Link
                          href={`/admindashboard/register/pond-lease?tab=records&search=${encodeURIComponent(
                            pond.name,
                          )}`}
                        >
                          <Button
                            variant="outline"
                            className="w-full justify-between rounded-xl"
                          >
                            View related lease
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                      {!pond.isVerified && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleVerify(pond.id)}
                          className="rounded-full text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700"
                          title="Verify Pond"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}

                      <PondDialog initialData={pond} disabled={pond.isVerified} />

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-red-50 hover:text-red-600"
                            disabled={pond.isVerified}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Pond?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. Deleting will fail if
                              the pond has lease records.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(pond.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/80">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">SL</TableHead>
                        <TableHead className="font-semibold">Pond Name</TableHead>
                        <TableHead className="font-semibold">
                          Location (JL No, Plot No)
                        </TableHead>
                        <TableHead className="font-semibold">
                          Area (Decimal / Acre)
                        </TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="pr-6 text-right font-semibold">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredData.map((pond, index) => (
                        <TableRow
                          key={pond.id}
                          className="transition-colors duration-150 hover:bg-muted/40"
                        >
                          <TableCell className="font-mono text-sm">
                            {index + 1}
                          </TableCell>

                          <TableCell className="font-semibold text-foreground">
                            {pond.name}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-start text-sm text-muted-foreground">
                              <MapPin className="mr-1.5 mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">
                                {formatPondLocationDisplay(pond)}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="text-sm text-muted-foreground">
                            {pond.area ? (
                              <div>
                                <div>{pond.area} Decimal</div>
                                {formatPondAreaAcre(
                                  parsePondAreaDecimal(pond.area),
                                ) && (
                                  <div className="text-xs text-blue-700">
                                    {formatPondAreaAcre(
                                      parsePondAreaDecimal(pond.area),
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(pond)}

                              {pond.status === "LEASED" && (
                                <Link
                                  href={`/admindashboard/register/pond-lease?tab=records&search=${encodeURIComponent(
                                    pond.name,
                                  )}`}
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-blue-600"
                                    title="View Lease"
                                  >
                                    <ArrowUpRight className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="pr-6 text-right">
                            <div className="flex justify-end gap-2">
                              {!pond.isVerified && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleVerify(pond.id)}
                                  className="rounded-full text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700"
                                  title="Verify Pond"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}

                              <PondDialog
                                initialData={pond}
                                disabled={pond.isVerified}
                              />

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                      "rounded-full hover:bg-red-50 hover:text-red-600",
                                    )}
                                    disabled={pond.isVerified}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Pond?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. Deleting will
                                      fail if the pond has lease records.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>

                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(pond.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
