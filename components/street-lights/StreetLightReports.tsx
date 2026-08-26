"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { Download, BarChart3 } from "lucide-react";
import { fetcher, downloadCsv } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

const REPORT_TYPES = [
  { value: "mouza-wise", label: "Mouza-wise Register" },
  { value: "working-status", label: "Working / Non-working Lights" },
  { value: "defective", label: "Defective Light List" },
  { value: "repair-required", label: "Lights Requiring Repair" },
  { value: "no-photo", label: "Lights Without Photographs" },
  { value: "gps-survey", label: "GPS Survey Completion" },
  { value: "led-total", label: "Total LED Lights & Wattage" },
  { value: "new-installation", label: "New Installation Register" },
] as const;

type ReportType = (typeof REPORT_TYPES)[number]["value"];

type MouzaRow = {
  mouzaName: string;
  jlNo?: string;
  gramSansad: string;
  total: number;
  working: number;
  notWorking: number;
  defective: number;
  led: number;
  withPhoto: number;
  withGPS: number;
  totalWattage: number;
};

type GpsSurveyData = {
  total: number;
  withGPS: number;
  withoutGPS: number;
  percentage: number;
};

type LedTotalData = {
  lights: Array<Record<string, unknown>>;
  totalLED: number;
  totalWattage: number;
};

type GenericLightRow = Record<string, unknown> & {
  lightId: string;
  mouza?: { mouzaName: string };
  sansad?: string;
  landmark?: string;
  workingStatus: string;
  lightCondition: string;
};

export function StreetLightReports() {
  const [reportType, setReportType] = useState<ReportType>("mouza-wise");

  const { data, isLoading } = useSWR<unknown>(
    `/api/street-lights/reports?type=${reportType}`,
    fetcher
  );

  const currentLabel =
    REPORT_TYPES.find((r) => r.value === reportType)?.label ?? reportType;

  const exportableRows = useMemo<Record<string, unknown>[] | null>(() => {
    if (!data) return null;
    if (reportType === "mouza-wise") return (data as MouzaRow[]) ?? [];
    if (reportType === "gps-survey") return null;
    if (reportType === "led-total") return (data as LedTotalData).lights ?? [];
    const rows = Array.isArray(data) ? data : (data as { lights?: GenericLightRow[] }).lights ?? [];
    return rows;
  }, [data, reportType]);

  const handleExportCsv = () => {
    if (!exportableRows?.length) return;
    downloadCsv(exportableRows, `street-light-${reportType}-report`);
  };

  const mouzaRows = (reportType === "mouza-wise" ? (data as MouzaRow[]) : []) ?? [];

  const mouzaTotals = useMemo(() => {
    if (!mouzaRows.length) return null;
    return {
      total: mouzaRows.reduce((s, r) => s + Number(r.total), 0),
      working: mouzaRows.reduce((s, r) => s + Number(r.working), 0),
      notWorking: mouzaRows.reduce((s, r) => s + Number(r.notWorking), 0),
      defective: mouzaRows.reduce((s, r) => s + Number(r.defective), 0),
      led: mouzaRows.reduce((s, r) => s + Number(r.led), 0),
      withPhoto: mouzaRows.reduce((s, r) => s + Number(r.withPhoto), 0),
      withGPS: mouzaRows.reduce((s, r) => s + Number(r.withGPS), 0),
      totalWattage: mouzaRows.reduce((s, r) => s + Number(r.totalWattage), 0),
    };
  }, [mouzaRows]);

  const renderReport = () => {
    if (isLoading) {
      return (
        <div className="py-12 text-center text-muted-foreground animate-pulse">
          Generating report…
        </div>
      );
    }
    if (!data) return null;

    if (reportType === "mouza-wise") {
      return (
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Mouza</TableHead>
              <TableHead>JL No.</TableHead>
              <TableHead>Gram Sansad</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Working</TableHead>
              <TableHead className="text-center">Not Working</TableHead>
              <TableHead className="text-center">Defective</TableHead>
              <TableHead className="text-center">LED</TableHead>
              <TableHead className="text-center">With Photo</TableHead>
              <TableHead className="text-center">With GPS</TableHead>
              <TableHead className="text-right">Total Wattage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mouzaRows.map((r, i) => (
              <TableRow key={i} className="hover:bg-muted/30">
                <TableCell className="font-medium">{r.mouzaName}</TableCell>
                <TableCell className="text-muted-foreground">{r.jlNo ?? "—"}</TableCell>
                <TableCell>{r.gramSansad}</TableCell>
                <TableCell className="text-center font-semibold">{r.total}</TableCell>
                <TableCell className="text-center text-emerald-700 font-medium">
                  {r.working}
                </TableCell>
                <TableCell className="text-center text-red-700 font-medium">
                  {r.notWorking}
                </TableCell>
                <TableCell className="text-center text-orange-700 font-medium">
                  {r.defective}
                </TableCell>
                <TableCell className="text-center">{r.led}</TableCell>
                <TableCell className="text-center">{r.withPhoto}</TableCell>
                <TableCell className="text-center">{r.withGPS}</TableCell>
                <TableCell className="text-right font-mono">
                  {Number(r.totalWattage).toLocaleString()} W
                </TableCell>
              </TableRow>
            ))}
            {mouzaTotals && (
              <TableRow className="bg-orange-50 font-bold border-t-2">
                <TableCell colSpan={3} className="text-orange-800">
                  TOTAL
                </TableCell>
                <TableCell className="text-center">{mouzaTotals.total}</TableCell>
                <TableCell className="text-center text-emerald-700">
                  {mouzaTotals.working}
                </TableCell>
                <TableCell className="text-center text-red-700">
                  {mouzaTotals.notWorking}
                </TableCell>
                <TableCell className="text-center text-orange-700">
                  {mouzaTotals.defective}
                </TableCell>
                <TableCell className="text-center">{mouzaTotals.led}</TableCell>
                <TableCell className="text-center">{mouzaTotals.withPhoto}</TableCell>
                <TableCell className="text-center">{mouzaTotals.withGPS}</TableCell>
                <TableCell className="text-right font-mono">
                  {mouzaTotals.totalWattage.toLocaleString()} W
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      );
    }

    if (reportType === "gps-survey") {
      const d = data as GpsSurveyData;
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
          {[
            { label: "Total Lights", value: d.total, color: "text-foreground" },
            { label: "GPS Surveyed", value: d.withGPS, color: "text-emerald-700" },
            { label: "Without GPS", value: d.withoutGPS, color: "text-red-700" },
            { label: "Completion %", value: `${d.percentage}%`, color: "text-orange-700" },
          ].map((item) => (
            <div
              key={item.label}
              className="text-center p-4 rounded-xl bg-muted/30 border"
            >
              <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      );
    }

    if (reportType === "led-total") {
      const d = data as LedTotalData;
      return (
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="rounded-xl bg-yellow-50 border border-yellow-200 px-6 py-4 text-center min-w-[160px]">
              <p className="text-3xl font-bold text-yellow-700">{d.totalLED}</p>
              <p className="text-sm text-yellow-600">Total LED Lights</p>
            </div>
            <div className="rounded-xl bg-orange-50 border border-orange-200 px-6 py-4 text-center min-w-[160px]">
              <p className="text-3xl font-bold text-orange-700">
                {d.totalWattage.toLocaleString()} W
              </p>
              <p className="text-sm text-orange-600">Total Load</p>
            </div>
          </div>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Light ID</TableHead>
                <TableHead>Mouza</TableHead>
                <TableHead>Sansad</TableHead>
                <TableHead className="text-right">Wattage</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.lights.map((l, i) => (
                <TableRow key={i} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs text-orange-700">
                    {String(l.lightId)}
                  </TableCell>
                  <TableCell>
                    {((l.mouza as Record<string, unknown>)?.mouzaName as string) ?? "—"}
                  </TableCell>
                  <TableCell>{String(l.sansad ?? "—")}</TableCell>
                  <TableCell className="text-right font-mono">
                    {String(l.wattage ?? "—")} W
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      type="working"
                      value={String(l.workingStatus)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    const rows = (Array.isArray(data) ? data : (data as { lights?: GenericLightRow[] }).lights ?? []) as GenericLightRow[];

    if (!rows.length) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          No data found for this report.
        </div>
      );
    }

    return (
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Light ID</TableHead>
            <TableHead>Mouza</TableHead>
            <TableHead>Sansad</TableHead>
            <TableHead>Landmark</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Condition</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((l, i) => (
            <TableRow key={i} className="hover:bg-muted/30">
              <TableCell className="font-mono text-xs text-orange-700">
                {l.lightId}
              </TableCell>
              <TableCell>{l.mouza?.mouzaName ?? "—"}</TableCell>
              <TableCell>{l.sansad ?? "—"}</TableCell>
              <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                {l.landmark ?? "—"}
              </TableCell>
              <TableCell>
                <StatusBadge type="working" value={l.workingStatus} />
              </TableCell>
              <TableCell>
                <StatusBadge type="condition" value={l.lightCondition} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <BarChart3 className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <Select
          value={reportType}
          onValueChange={(v) => setReportType(v as ReportType)}
        >
          <SelectTrigger className="w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REPORT_TYPES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 ml-auto"
          onClick={handleExportCsv}
          disabled={!exportableRows?.length}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-lg bg-orange-50 border border-orange-200 px-4 py-2">
        <p className="text-sm font-semibold text-orange-800">{currentLabel}</p>
      </div>

      <div className="rounded-lg border border-border/50 shadow-sm overflow-auto">
        {renderReport()}
      </div>
    </div>
  );
}
