"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  addYears,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
} from "date-fns";
import { toast } from "sonner";
import { formatDate } from "@/utils/utils";
import { cn } from "@/lib/utils";
import { verifyPondLease } from "./actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  FileWarning,
  Layers,
  MapPin,
  MoreHorizontal,
  Phone,
  Search,
  TrendingUp,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { AddLeaseDialog } from "./add-lease-dialog";
import { AddPondDialog } from "./add-pond-dialog";
import { AddPaymentDialog } from "./add-payment-dialog";
import { BulkNoticeGenerateDialog } from "./bulk-notice-generate-dialog";
import { BulkReprintNoticeDialog } from "./bulk-reprint-notice-dialog";
import { EditLeaseDialog } from "./edit-lease-dialog";
import { ExtendLeaseDialog } from "./extend-lease-dialog";
import { LeaseAgreementPrint } from "./lease-agreement-print";
import { LeaseCollectionListPrint } from "./lease-collection-list-print";
import { LeaseStatusChart } from "./lease-status-chart";
import { MarkNoticeReceivedDialog } from "./mark-notice-received-dialog";
import { MobileFilterSheet } from "./mobile-filter-sheet";
import { NoticeGenerateDialog } from "./notice-generate-dialog";
import { PendingByYear } from "./pending-by-year";
import { PendingDetailsDialog } from "./pending-details-dialog";
import { PendingListPrint } from "./pending-list-print";
import { PublicPondSection } from "./public-pond-section";
import { ReprintNoticeDialog } from "./reprint-notice-dialog";
import { ResetNoticeCountDialog } from "./reset-notice-count-dialog";
import { UpdateLeaseStatusDialog } from "./update-lease-status-dialog";

interface PondLeaseClientProps {
  data: any[];
  ponds: any[];
  allPonds: any[];
  publicPonds: any[];
  initialTab?: string;
  initialSearch?: string;
}

type StatusFilter = "ALL" | "ACTIVE" | "EXPIRED" | "COMPLETED" | "CANCELLED";

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "EXPIRED", label: "Expired" },
  { value: "COMPLETED", label: "Done" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function PondLeaseClient({
  data,
  ponds,
  allPonds,
  publicPonds,
  initialTab = "dashboard",
  initialSearch = "",
}: PondLeaseClientProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedLeases, setSelectedLeases] = useState<string[]>([]);

  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  const filteredData = useMemo(() => {
    return data.filter((lease) => {
      const matchesSearch =
        (lease.pond.name?.toLowerCase() ?? "").includes(
          searchTerm.toLowerCase(),
        ) ||
        (lease.leasePartyName?.toLowerCase() ?? "").includes(
          searchTerm.toLowerCase(),
        );

      const matchesStatus =
        statusFilter === "ALL" || lease.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  useMemo(() => {
    setSelectedLeases([]);
  }, [searchTerm, statusFilter]);

  const totalLeases = data.length;
  const activeLeases = data.filter((lease) => lease.status === "ACTIVE").length;
  const expiredLeases = data.filter(
    (lease) => lease.status === "EXPIRED",
  ).length;
  const totalPendingAmount = data.reduce(
    (sum, lease) => sum + lease.pendingAmount,
    0,
  );
  const filteredPendingAmount = filteredData.reduce(
    (sum, lease) => sum + lease.pendingAmount,
    0,
  );

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "border-emerald-200/70 bg-emerald-500/10 text-emerald-700";
      case "EXPIRED":
        return "border-amber-200/70 bg-amber-500/10 text-amber-700";
      case "COMPLETED":
        return "border-blue-200/70 bg-blue-500/10 text-blue-700";
      case "CANCELLED":
        return "border-slate-200/70 bg-slate-500/10 text-slate-700";
      default:
        return "border-slate-200/70 bg-slate-500/10 text-slate-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle2 className="h-3 w-3" />;
      case "EXPIRED":
        return <AlertTriangle className="h-3 w-3" />;
      case "COMPLETED":
        return <FileCheck className="h-3 w-3" />;
      case "CANCELLED":
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const handleVerify = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to final verify this lease? Once verified, details cannot be modified.",
      )
    ) {
      return;
    }

    try {
      await verifyPondLease(id);
      toast.success("Lease final verified");
    } catch {
      toast.error("Verification failed");
    }
  };

  const formatRemainingTime = (end: Date, today: Date) => {
    if (end < today) return "Expired";

    const years = differenceInYears(end, today);
    const dateAfterYears = addYears(today, years);
    const months = differenceInMonths(end, dateAfterYears);
    const dateAfterMonths = addMonths(dateAfterYears, months);
    const days = differenceInDays(end, dateAfterMonths);

    const parts = [];
    if (years > 0) parts.push(`${years} yr`);
    if (months > 0) parts.push(`${months} mo`);
    if (days > 0) parts.push(`${days} d`);

    return parts.length > 0 ? parts.join(" ") : "Expires today";
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "ALL";

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeases(filteredData.map((lease) => lease.id));
      return;
    }

    setSelectedLeases([]);
  };

  const handleSelectLease = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedLeases((prev) => [...prev, id]);
      return;
    }

    setSelectedLeases((prev) => prev.filter((leaseId) => leaseId !== id));
  };

  const getLeaseMetrics = (lease: any) => {
    const today = new Date();
    const start = new Date(lease.leaseStartDate);
    const end = new Date(lease.leaseEndDate);
    const totalDays = Math.max(differenceInDays(end, start), 1);
    const usedDays = differenceInDays(today, start);
    const progress = Math.min(Math.max((usedDays / totalDays) * 100, 0), 100);
    const daysLeft = differenceInDays(end, today);
    const isExpiringSoon =
      daysLeft <= 30 && daysLeft > 0 && lease.status === "ACTIVE";
    const isOverdue = daysLeft < 0 && lease.status === "ACTIVE";
    const paidPercentage =
      lease.totalAmount > 0 ? (lease.paidAmount / lease.totalAmount) * 100 : 0;

    return {
      today,
      start,
      end,
      totalDays,
      usedDays,
      progress,
      isExpiringSoon,
      isOverdue,
      paidPercentage,
    };
  };

  const renderLeaseActions = (lease: any) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 rounded-full border border-border/60 bg-background/80"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <LeaseAgreementPrint lease={lease} />

        <AddPaymentDialog lease={lease} />
        <ExtendLeaseDialog lease={lease} />

        {!lease.isVerified && <EditLeaseDialog lease={lease} />}

        {!lease.isVerified && (
          <DropdownMenuItem onClick={() => handleVerify(lease.id)}>
            <CheckCircle2 className="mr-2 h-4 w-4 text-blue-600" />
            Final Verify
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <NoticeGenerateDialog lease={lease} />

        {(lease.status === "ACTIVE" || lease.status === "EXPIRED") && (
          <>
            <MarkNoticeReceivedDialog lease={lease} />
            <ReprintNoticeDialog lease={lease} />
            <ResetNoticeCountDialog lease={lease} />
            <UpdateLeaseStatusDialog lease={lease} statusType="COMPLETED" />
            <UpdateLeaseStatusDialog lease={lease} statusType="CANCELLED" />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <Tabs defaultValue={initialTab} className="space-y-8">
      <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-background/85 p-6 shadow-sm backdrop-blur xl:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
        <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-16 left-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <Badge
              variant="outline"
              className="rounded-full border-blue-200/70 bg-blue-50/80 px-3 py-1 text-blue-700"
            >
              Lease register
            </Badge>

            <div className="space-y-2">
              <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-700 shadow-sm">
                  <FileCheck className="h-6 w-6" />
                </span>
                Pond Lease Management
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Manage lease records, payment follow-up, and notice activity
                from a cleaner dashboard designed for quick review on both
                desktop and mobile.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 xl:max-w-xl xl:justify-end">
            <PendingListPrint leases={data} />
            <LeaseCollectionListPrint leases={data} ponds={allPonds} />
            <AddPondDialog />
            <AddLeaseDialog ponds={ponds} />
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Total Leases
                </p>
                <p className="mt-2 text-2xl font-semibold">{totalLeases}</p>
              </div>
              <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-700">
                <Layers className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Active
                </p>
                <p className="mt-2 text-2xl font-semibold text-emerald-700">
                  {activeLeases}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-700">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Pending Amount
                </p>
                <p className="mt-2 text-2xl font-semibold text-rose-700">
                  {currency.format(totalPendingAmount)}
                </p>
              </div>
              <div className="rounded-2xl bg-rose-500/10 p-3 text-rose-700">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Expired
                </p>
                <p className="mt-2 text-2xl font-semibold text-amber-700">
                  {expiredLeases}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-700">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-background/80 p-2 shadow-sm">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-transparent md:grid-cols-3">
          <TabsTrigger
            value="dashboard"
            className="rounded-xl border border-transparent px-4 py-3 data-[state=active]:border-blue-200/80 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
          >
            Dashboard & Analytics
          </TabsTrigger>
          <TabsTrigger
            value="records"
            className="rounded-xl border border-transparent px-4 py-3 data-[state=active]:border-blue-200/80 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
          >
            Lease Records
          </TabsTrigger>
          <TabsTrigger
            value="public"
            className="rounded-xl border border-transparent px-4 py-3 data-[state=active]:border-blue-200/80 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
          >
            Public Ponds
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="dashboard" className="mt-0 space-y-6">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Card className="overflow-hidden border-border/60 bg-background/90 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Leases
                  </p>
                  <h3 className="mt-2 text-3xl font-bold">{totalLeases}</h3>
                </div>
                <div className="rounded-2xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-900/30">
                  <Layers className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/60 bg-background/90 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Leases
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-emerald-700">
                    {activeLeases}
                  </h3>
                </div>
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/30">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/60 bg-background/90 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending Amount
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-rose-700">
                    {currency.format(totalPendingAmount)}
                  </h3>
                </div>
                <div className="rounded-2xl bg-rose-100 p-3 text-rose-700 dark:bg-rose-900/30">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/60 bg-background/90 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Expired Leases
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-amber-700">
                    {expiredLeases}
                  </h3>
                </div>
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700 dark:bg-amber-900/30">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60 bg-background/90 shadow-sm">
            <CardHeader className="space-y-2 pb-2">
              <CardTitle className="text-lg">Lease Status Overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Distribution of lease agreements by current status.
              </p>
            </CardHeader>
            <CardContent>
              <LeaseStatusChart data={data} />
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/90 shadow-sm">
            <CardHeader className="space-y-2 pb-2">
              <CardTitle className="text-lg">Pending Amount by Year</CardTitle>
              <p className="text-sm text-muted-foreground">
                Year-wise breakdown of outstanding collections.
              </p>
            </CardHeader>
            <CardContent>
              <PendingByYear leases={data} />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="records" className="mt-0">
        <Card className="overflow-hidden border-border/60 bg-background/90 shadow-sm">
          <CardHeader className="space-y-5 border-b bg-muted/20">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-xl">Lease Records</CardTitle>
                  <Badge variant="outline" className="rounded-full">
                    {filteredData.length} showing
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full border-rose-200 bg-rose-50 text-rose-700"
                  >
                    Pending {currency.format(filteredPendingAmount)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Search, filter, and manage all pond lease agreements from a
                  single workspace.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {hasActiveFilters && (
                  <Badge
                    variant="outline"
                    className="rounded-full border-blue-200 bg-blue-50 text-blue-700"
                  >
                    Filter:{" "}
                    {statusFilter === "ALL"
                      ? "Search"
                      : statusOptions.find(
                          (option) => option.value === statusFilter,
                        )?.label}
                  </Badge>
                )}

                {selectedLeases.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700">
                    <span>{selectedLeases.length} selected</span>
                    <BulkNoticeGenerateDialog
                      leases={data.filter((lease) =>
                        selectedLeases.includes(lease.id),
                      )}
                    />
                    <BulkReprintNoticeDialog
                      leases={data.filter((lease) =>
                        selectedLeases.includes(lease.id),
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="hidden flex-col gap-3 md:flex lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by pond or lease party..."
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
                      setStatusFilter(value as StatusFilter)
                    }
                  >
                    <TabsList className="grid h-11 grid-cols-5 rounded-xl border border-border/60 bg-background p-1">
                      {statusOptions.map((option) => (
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

              <div className="md:hidden">
                <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Filters</p>
                    <p className="text-xs text-muted-foreground">
                      {statusFilter === "ALL"
                        ? "All statuses"
                        : statusOptions.find(
                            (option) => option.value === statusFilter,
                          )?.label}
                      {searchTerm ? ` • ${searchTerm}` : ""}
                    </p>
                  </div>
                  <MobileFilterSheet
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    onClearFilters={clearFilters}
                    hasActiveFilters={hasActiveFilters}
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center text-muted-foreground">
                <FileText className="mb-4 h-12 w-12 opacity-30" />
                <p className="text-lg font-medium text-foreground">
                  No lease records found
                </p>
                <p className="mt-1 text-sm">
                  Try adjusting your search or filters.
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="link"
                    onClick={clearFilters}
                    className="mt-2"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid gap-4 p-4 md:hidden">
                  {filteredData.map((lease, index) => {
                    const {
                      today,
                      start,
                      end,
                      totalDays,
                      usedDays,
                      progress,
                      isExpiringSoon,
                      isOverdue,
                      paidPercentage,
                    } = getLeaseMetrics(lease);

                    return (
                      <div
                        key={lease.id}
                        className={cn(
                          "rounded-3xl border border-border/60 bg-background/90 p-4 shadow-sm",
                          selectedLeases.includes(lease.id) &&
                            "border-blue-200 bg-blue-50/40",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedLeases.includes(lease.id)}
                                onCheckedChange={(checked) =>
                                  handleSelectLease(
                                    lease.id,
                                    checked as boolean,
                                  )
                                }
                              />
                              <span className="text-xs font-medium text-muted-foreground">
                                Record #{index + 1}
                              </span>
                            </div>

                            <div>
                              <p className="text-base font-semibold">
                                {lease.pond.name}
                              </p>
                              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>{lease.pond.location}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              className={cn(
                                "gap-1 rounded-full border font-medium",
                                getStatusClasses(lease.status),
                              )}
                            >
                              {getStatusIcon(lease.status)}
                              {lease.status}
                            </Badge>
                            {renderLeaseActions(lease)}
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 rounded-2xl border border-border/50 bg-muted/20 p-4">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                              Lease Party
                            </p>
                            <p className="mt-1 font-medium">
                              {lease.leasePartyName}
                            </p>
                            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              {lease.leasePartyMobile}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-foreground">
                                {formatDate(start)}
                              </span>
                              <span className="text-muted-foreground">to</span>
                              <span className="font-medium text-foreground">
                                {formatDate(end)}
                              </span>
                            </div>
                            <Progress
                              value={progress}
                              className={cn(
                                "mt-3 h-2",
                                isExpiringSoon && "[&>div]:bg-orange-500",
                                isOverdue && "[&>div]:bg-red-500",
                              )}
                            />
                            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {usedDays > totalDays
                                  ? "Completed"
                                  : `${Math.round(progress)}% complete`}
                              </span>
                              <span className="font-medium">
                                {isOverdue
                                  ? "Expired"
                                  : formatRemainingTime(end, today)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-border/50 bg-background/70 p-4">
                          <div className="grid gap-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                Lease Amount
                              </span>
                              <span className="font-semibold">
                                {currency.format(lease.totalAmount)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                Paid
                              </span>
                              <span className="font-medium text-emerald-700">
                                {currency.format(lease.paidAmount)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                Pending
                              </span>
                              <span className="font-semibold text-rose-700">
                                {currency.format(lease.pendingAmount)}
                              </span>
                            </div>
                          </div>

                          {lease.pendingAmount > 0 && (
                            <>
                              <Progress
                                value={paidPercentage}
                                className="mt-3 h-1.5 [&>div]:bg-emerald-500"
                              />
                              <div className="mt-3">
                                <PendingDetailsDialog lease={lease} />
                              </div>
                            </>
                          )}
                        </div>

                        {((lease.noticeCount && lease.noticeCount > 0) ||
                          lease.lastNoticeDate) && (
                          <div className="mt-4 rounded-2xl border border-orange-200/70 bg-orange-50/80 p-3 text-sm text-orange-700">
                            <div className="flex items-center gap-2 font-medium">
                              <FileWarning className="h-4 w-4" />
                              {lease.noticeCount || 1} Notice
                              {(lease.noticeCount || 1) > 1 ? "s" : ""} Sent
                            </div>
                            {lease.noticeReceivedDate && (
                              <div className="mt-2 flex items-center gap-2 border-t border-orange-200 pt-2 text-xs text-emerald-700">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Received:{" "}
                                {new Date(
                                  lease.noticeReceivedDate,
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="hidden md:block">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/80">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-12 text-center">
                            <Checkbox
                              checked={
                                selectedLeases.length > 0 &&
                                selectedLeases.length === filteredData.length
                              }
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead className="font-semibold">#</TableHead>
                          <TableHead className="font-semibold">Pond</TableHead>
                          <TableHead className="font-semibold">Party</TableHead>
                          <TableHead className="font-semibold">
                            Lease Period
                          </TableHead>
                          <TableHead className="font-semibold">
                            Lease Amount
                          </TableHead>
                          <TableHead className="font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="text-right font-semibold">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {filteredData.map((lease, index) => {
                          const {
                            today,
                            start,
                            end,
                            totalDays,
                            usedDays,
                            progress,
                            isExpiringSoon,
                            isOverdue,
                            paidPercentage,
                          } = getLeaseMetrics(lease);

                          return (
                            <TableRow
                              key={lease.id}
                              className={cn(
                                "transition-colors duration-150 hover:bg-muted/40",
                                selectedLeases.includes(lease.id) &&
                                  "bg-blue-50/40",
                              )}
                            >
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={selectedLeases.includes(lease.id)}
                                  onCheckedChange={(checked) =>
                                    handleSelectLease(
                                      lease.id,
                                      checked as boolean,
                                    )
                                  }
                                />
                              </TableCell>

                              <TableCell className="font-mono text-sm">
                                {index + 1}
                              </TableCell>

                              <TableCell>
                                <div className="font-semibold text-foreground">
                                  {lease.pond.name}
                                </div>
                                <div className="mt-0.5 flex items-center text-xs text-muted-foreground">
                                  <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">
                                    {lease.pond.location}
                                  </span>
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="font-medium">
                                  {lease.leasePartyName}
                                </div>
                                <div className="mt-0.5 flex items-center text-xs text-muted-foreground">
                                  <Phone className="mr-1 h-3 w-3 flex-shrink-0" />
                                  <span>{lease.leasePartyMobile}</span>
                                </div>
                              </TableCell>

                              <TableCell className="min-w-[220px]">
                                <div className="text-sm">
                                  <span className="font-medium">
                                    {formatDate(start)}
                                  </span>
                                  <span className="mx-1 text-muted-foreground">
                                    →
                                  </span>
                                  <span className="font-medium">
                                    {formatDate(end)}
                                  </span>
                                </div>

                                <div className="mb-1 mt-2">
                                  <Progress
                                    value={progress}
                                    className={cn(
                                      "h-1.5",
                                      isExpiringSoon && "[&>div]:bg-orange-500",
                                      isOverdue && "[&>div]:bg-red-500",
                                    )}
                                  />
                                </div>

                                <div className="mt-1 flex items-center justify-between gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {usedDays > totalDays
                                      ? "Completed"
                                      : `${Math.round(progress)}%`}
                                  </span>

                                  {!isOverdue ? (
                                    <Badge
                                      variant="secondary"
                                      className="whitespace-nowrap rounded-full text-[10px]"
                                    >
                                      {formatRemainingTime(end, today)}
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="destructive"
                                      className="whitespace-nowrap rounded-full text-[10px]"
                                    >
                                      Expired
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell className="min-w-[220px]">
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      Lease Amount:
                                    </span>
                                    <span className="font-semibold">
                                      {currency.format(lease.totalAmount)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      Paid:
                                    </span>
                                    <span className="font-medium text-emerald-700">
                                      {currency.format(lease.paidAmount)}
                                    </span>
                                  </div>
                                  {lease.pendingAmount > 0 && (
                                    <>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                          Pending:
                                        </span>
                                        <span className="font-bold text-rose-700">
                                          {currency.format(lease.pendingAmount)}
                                        </span>
                                      </div>
                                      <Progress
                                        value={paidPercentage}
                                        className="mt-1 h-1 [&>div]:bg-emerald-500"
                                      />
                                      <div className="pt-1">
                                        <PendingDetailsDialog lease={lease} />
                                      </div>
                                    </>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="flex flex-col items-start gap-2">
                                  <Badge
                                    className={cn(
                                      "gap-1 rounded-full border font-medium shadow-sm",
                                      getStatusClasses(lease.status),
                                    )}
                                  >
                                    {getStatusIcon(lease.status)}
                                    {lease.status}
                                  </Badge>

                                  {((lease.noticeCount &&
                                    lease.noticeCount > 0) ||
                                    lease.lastNoticeDate) && (
                                    <div className="flex flex-col gap-1 rounded-xl border border-orange-200 bg-orange-50 px-2.5 py-2 text-xs font-medium text-orange-700">
                                      <div className="flex items-center gap-1">
                                        <FileWarning className="h-3 w-3" />
                                        {lease.noticeCount || 1} Notice
                                        {(lease.noticeCount || 1) > 1
                                          ? "s"
                                          : ""}{" "}
                                        Sent
                                      </div>
                                      {lease.noticeReceivedDate && (
                                        <div className="mt-0.5 flex items-center gap-1 border-t border-orange-200 pt-1 text-[10px] text-emerald-700">
                                          <CheckCircle2 className="h-3 w-3" />
                                          Received:{" "}
                                          {new Date(
                                            lease.noticeReceivedDate,
                                          ).toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell className="text-right">
                                {renderLeaseActions(lease)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="public" className="mt-0">
        <PublicPondSection publicPonds={publicPonds} />
      </TabsContent>
    </Tabs>
  );
}
