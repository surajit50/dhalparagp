"use client";

import { useEffect, useState, useMemo } from "react";
import {
  columns,
  TenderStatusReportItem,
  isTenderFloatedLatest,
} from "./columns";
import { VisibleDataTable } from "@/components/visible-data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  FileText,
  CheckCircle2,
  Camera,
  IndianRupee,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getFundType } from "@/lib/actions";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------ */
/* STATUS OPTIONS                                   */
/* ------------------------------------------------ */

const STATUS_OPTIONS = ["published", "work order issued", "cancelled"];

/* ------------------------------------------------ */
/* PAGE                                             */
/* ------------------------------------------------ */

export default function TenderStatusReportPage() {
  const [data, setData] = useState<TenderStatusReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fundFilter, setFundFilter] = useState("all");
  const [financialYearFilter, setFinancialYearFilter] = useState("all");

  const [nitFilter, setNitFilter] = useState("");
  const [debouncedNit, setDebouncedNit] = useState("");

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const [schemeNames, setSchemeNames] = useState<Array<{ schemeName: string }>>(
    [],
  );

  /* ------------------------------------------------ */
  /* Debounce Search                                  */
  /* ------------------------------------------------ */

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedNit(nitFilter);
    }, 300);

    return () => clearTimeout(handler);
  }, [nitFilter]);

  /* ------------------------------------------------ */
  /* Fetch Fund Types                                 */
  /* ------------------------------------------------ */

  useEffect(() => {
    const fetchSchemeNames = async () => {
      try {
        const schemes = await getFundType();
        setSchemeNames(schemes || []);
      } catch (err) {
        console.error("Error fetching scheme names:", err);
      }
    };

    fetchSchemeNames();
  }, []);

  /* ------------------------------------------------ */
  /* Fetch Tender Data                                */
  /* ------------------------------------------------ */

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/tenders/status-report?fund=${fundFilter}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch tender data");
        }

        const result: TenderStatusReportItem[] = await response.json();

        /**
         * IMPORTANT:
         * Do NOT redefine NitItem.
         * Use the type already inside TenderStatusReportItem.
         */

        const grouped = new Map<string, TenderStatusReportItem>();

        result
          .sort((a, b) => {
            const aDate = a.nitDetails?.memoDate
              ? new Date(a.nitDetails.memoDate).getTime()
              : 0;
            const bDate = b.nitDetails?.memoDate
              ? new Date(b.nitDetails.memoDate).getTime()
              : 0;
            return bDate - aDate;
          })
          .forEach((work) => {
            const key =
              work?.ApprovedActionPlanDetails?.activityCode ?? "unknown";

            const nit = {
              id: work.nitDetails?.id,
              memoNumber: work.nitDetails?.memoNumber,
              memoDate: work.nitDetails?.memoDate,
              tenderStatus: work.tenderStatus,
              workOrderCancellation: work.WorkOrderCancellation ?? [],
              worksDetailId: work.id,
              workslno: work.workslno,
            };

            if (grouped.has(key)) {
              const existing = grouped.get(key)!;
              existing.nits = [...(existing.nits ?? []), nit];
            } else {
              grouped.set(key, {
                ...work,
                nits: [nit],
              });
            }
          });

        const groupedArray = Array.from(grouped.values()).map((item) => ({
          ...item,
          nits: [...(item.nits ?? [])].sort((a, b) => {
            const aDate = a.memoDate ? new Date(a.memoDate).getTime() : 0;
            const bDate = b.memoDate ? new Date(b.memoDate).getTime() : 0;
            return bDate - aDate;
          }),
        }));

        setData(groupedArray);
      } catch (err) {
        console.error(err);
        setError("Error loading tender status report.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fundFilter]);

  /* ------------------------------------------------ */
  /* ADVANCED FILTERING                               */
  /* ------------------------------------------------ */

  const getFinancialYear = (date?: string | Date | null): string => {
    if (!date) return "";
    const d = new Date(date);
    const baseYear = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
    const next = String((baseYear + 1) % 100).padStart(2, "0");
    return `${baseYear}-${next}`;
  };

  const financialYearOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach((row) => {
      (row.nits ?? []).forEach((nit) => {
        const fy = getFinancialYear(nit.memoDate);
        if (fy) set.add(fy);
      });
    });
    return Array.from(set).sort().reverse();
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const latestNit =
        row.nits && row.nits.length > 0 ? row.nits[0] : undefined;

      /* NIT FILTER */
      const matchNit =
        !debouncedNit.trim() ||
        row.nits?.some((nit) =>
          String(nit.memoNumber ?? "")
            .toLowerCase()
            .includes(debouncedNit.toLowerCase()),
        );

      /* STATUS FILTER */
      const matchStatus =
        selectedStatuses.length === 0 ||
        (() => {
          if (!latestNit) return false;

          const latestStatus = String(
            latestNit.tenderStatus ?? "",
          ).toLowerCase();
          const isCancelledLatest =
            (latestNit.workOrderCancellation?.length ?? 0) > 0 ||
            latestStatus === "cancelled";

          if (selectedStatuses.includes("cancelled") && isCancelledLatest) {
            return true;
          }

          return selectedStatuses.includes(latestStatus);
        })();

      const matchFY =
        financialYearFilter === "all" ||
        (row.nits ?? []).some(
          (nit) => getFinancialYear(nit.memoDate) === financialYearFilter,
        );

      return matchNit && matchStatus && matchFY;
    });
  }, [data, debouncedNit, selectedStatuses, financialYearFilter]);

  const statusSummary = useMemo(() => {
    const total = filteredData.length;

    let tenderFloated = 0;
    let workOrderIssued = 0;
    let workCompleted = 0;
    let geoTagged = 0;
    let billSentToBlock = 0;

    filteredData.forEach((row) => {
      const latestNit =
        row.nits && row.nits.length > 0 ? row.nits[0] : undefined;

      if (isTenderFloatedLatest(row)) tenderFloated += 1;
      if (row.AwardofContract) workOrderIssued += 1;
      if (row.completionDate) workCompleted += 1;
      if ((row._count?.workMeasurementBooks ?? 0) > 0) geoTagged += 1;

      if (row.workStatus === "billpaid" || row.workStatus === "billgenerated") {
        billSentToBlock += 1;
      }

      if (!latestNit) {
        return;
      }
    });

    return {
      total,
      tenderFloated,
      workOrderIssued,
      workCompleted,
      geoTagged,
      billSentToBlock,
    };
  }, [filteredData]);

  /* Toggle status */
  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  /* ------------------------------------------------ */
  /* STATES                                           */
  /* ------------------------------------------------ */

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500 font-medium">
        {error}
      </div>
    );
  }

  /* ------------------------------------------------ */
  /* UI                                               */
  /* ------------------------------------------------ */

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tender Status Report
          </h1>
          <p className="text-muted-foreground">
            Advanced multi-filter enabled.
          </p>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-wrap items-center gap-4">
          {/* FUND */}
          <Select value={fundFilter} onValueChange={setFundFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Fund Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Funds</SelectItem>
              {schemeNames.map((scheme) => (
                <SelectItem key={scheme.schemeName} value={scheme.schemeName}>
                  {scheme.schemeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* FINANCIAL YEAR */}
          <Select
            value={financialYearFilter}
            onValueChange={setFinancialYearFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Financial Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {financialYearOptions.map((fy) => (
                <SelectItem key={fy} value={fy}>
                  {fy}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* NIT SEARCH */}
          <Input
            placeholder="Search NIT..."
            value={nitFilter}
            onChange={(e) => setNitFilter(e.target.value)}
            className="w-[200px]"
          />

          {/* MULTI STATUS */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[220px]">
                {selectedStatuses.length === 0
                  ? "Filter Status"
                  : `${selectedStatuses.length} selected`}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {STATUS_OPTIONS.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={selectedStatuses.includes(status)}
                  onCheckedChange={() => toggleStatus(status)}
                >
                  {status.toUpperCase()}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filteredData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="border-blue-100 bg-blue-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">
                    Total Works
                  </div>
                  <div className="text-2xl font-bold">
                    {statusSummary.total}
                  </div>
                </div>
                <div className="rounded-full bg-blue-100 p-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-emerald-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">
                    Tender Floated (Yes)
                  </div>
                  <div className="text-2xl font-bold text-emerald-700">
                    {statusSummary.tenderFloated}
                  </div>
                </div>
                <div className="rounded-full bg-emerald-100 p-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 bg-indigo-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">
                    Work Order Issued (Yes)
                  </div>
                  <div className="text-2xl font-bold text-indigo-700">
                    {statusSummary.workOrderIssued}
                  </div>
                </div>
                <div className="rounded-full bg-indigo-100 p-2">
                  <FileText className="h-5 w-5 text-indigo-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-100 bg-teal-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">
                    Geo Photo Uploaded (Yes)
                  </div>
                  <div className="text-2xl font-bold text-teal-700">
                    {statusSummary.geoTagged}
                  </div>
                </div>
                <div className="rounded-full bg-teal-100 p-2">
                  <Camera className="h-5 w-5 text-teal-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100 bg-purple-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">
                    Work Completed (Yes)
                  </div>
                  <div className="text-2xl font-bold text-purple-700">
                    {statusSummary.workCompleted}
                  </div>
                </div>
                <div className="rounded-full bg-purple-100 p-2">
                  <CheckCircle2 className="h-5 w-5 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-100 bg-amber-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">
                    Bill Sent to Block (Yes)
                  </div>
                  <div className="text-2xl font-bold text-amber-700">
                    {statusSummary.billSentToBlock}
                  </div>
                </div>
                <div className="rounded-full bg-amber-100 p-2">
                  <IndianRupee className="h-5 w-5 text-amber-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Tender Details</CardTitle>
          <CardDescription>Multi-select filtering enabled.</CardDescription>
        </CardHeader>

        <CardContent>
          {filteredData.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              No tenders found.
            </div>
          ) : (
            <VisibleDataTable
              columns={columns}
              data={filteredData}
              title="Tender Status Report"
              pdfFileName="tender-status-report.pdf"
              excelFileName="tender-status-report.xlsx"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
