"use client";

import { useState, useMemo } from "react";
import { Loader2, FileText, Filter, IndianRupee, LayoutList, CheckSquare, ListFilter } from "lucide-react";
import type { Workorderdetails } from "@/types/tender-manage";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Checkbox } from "@/components/ui/checkbox";

import { ShowNitDetails } from "@/components/ShowNitDetails";
import { generateworkorderPDFAll } from "@/components/PrintTemplet/all-work-order";
import { formatDate } from "@/utils/utils";

interface WorkListProps {
  works: Workorderdetails[];
}

function getFinancialYear(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

export function WorkList({ works }: WorkListProps) {
  const [selectedWorks, setSelectedWorks] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedFund, setSelectedFund] = useState<string>("all");
  const [selectedMemo, setSelectedMemo] = useState<string>("all");
  const [selectedAgency, setSelectedAgency] = useState<string>("all");

  /* ---------- GROUP BY FY ---------- */

  const worksByYear = useMemo(() => {
    const grouped: Record<string, Workorderdetails[]> = {};

    works.forEach((work) => {
      const date = work.awardofcontractdetails?.workordeermemodate;
      if (!date) return;

      const fy = getFinancialYear(new Date(date));
      if (!grouped[fy]) grouped[fy] = [];
      grouped[fy].push(work);
    });

    return grouped;
  }, [works]);

  /* ---------- UNIQUE FILTERS ---------- */

  const uniqueFunds = useMemo(() => {
    const set = new Set<string>();
    works.forEach((w) => {
      const scheme =
        w.Bidagency?.WorksDetail?.ApprovedActionPlanDetails?.schemeName;
      if (scheme) set.add(scheme);
    });
    return Array.from(set);
  }, [works]);

  const uniqueMemos = useMemo(() => {
    const set = new Set<string>();
    works.forEach((w) => {
      const memo = w.Bidagency?.WorksDetail?.nitDetails?.memoNumber;
      if (memo) set.add(memo.toString());
    });
    return Array.from(set);
  }, [works]);

  const uniqueAgencies = useMemo(() => {
    const set = new Set<string>();
    works.forEach((w) => {
      const agency = w.Bidagency?.agencydetails?.name;
      if (agency) set.add(agency);
    });
    return Array.from(set);
  }, [works]);

  /* ---------- FILTER ---------- */

  const filteredWorks = useMemo(() => {
    return works.filter((work) => {
      const date = work.awardofcontractdetails?.workordeermemodate;
      const fy = date ? getFinancialYear(new Date(date)) : null;

      const scheme =
        work.Bidagency?.WorksDetail?.ApprovedActionPlanDetails?.schemeName;

      const memo =
        work.Bidagency?.WorksDetail?.nitDetails?.memoNumber?.toString();

      const agency = work.Bidagency?.agencydetails?.name;

      return (
        (selectedYear === "all" || fy === selectedYear) &&
        (selectedFund === "all" || scheme === selectedFund) &&
        (selectedMemo === "all" || memo === selectedMemo) &&
        (selectedAgency === "all" || agency === selectedAgency)
      );
    });
  }, [works, selectedYear, selectedFund, selectedMemo, selectedAgency]);

  const totalValue = filteredWorks.reduce(
    (sum, w) => sum + (w.Bidagency?.biddingAmount ?? 0),
    0
  );

  /* ---------- SELECT ---------- */

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWorks(filteredWorks.map((w) => w.id));
    } else {
      setSelectedWorks([]);
    }
  };

  /* ---------- PDF ---------- */

  const handleGeneratePDF = async () => {
    if (selectedWorks.length === 0) return alert("Select work");

    setIsGenerating(true);

    try {
      const res = await fetch("/api/bulk-work-order-data", {
        method: "POST",
        body: JSON.stringify({ workIds: selectedWorks }),
      });

      const data = await res.json();
      await generateworkorderPDFAll(data);
    } catch {
      alert("PDF Failed");
    } finally {
      setIsGenerating(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-5">

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Summary title="Total Works" value={works.length} icon={<LayoutList className="w-5 h-5" />} color="emerald" />
        <Summary title="Filtered" value={filteredWorks.length} icon={<ListFilter className="w-5 h-5" />} color="blue" />
        <Summary title="Selected" value={selectedWorks.length} icon={<CheckSquare className="w-5 h-5" />} color="violet" />
        <Summary
          title="Total Amount"
          value={`₹ ${totalValue.toLocaleString("en-IN")}`}
          icon={<IndianRupee className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* FILTER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <FilterSelect
            label="Financial Year"
            value={selectedYear}
            onChange={setSelectedYear}
            items={Object.keys(worksByYear)}
          />

          <FilterSelect
            label="Fund"
            value={selectedFund}
            onChange={setSelectedFund}
            items={uniqueFunds}
          />

          <FilterSelect
            label="Memo"
            value={selectedMemo}
            onChange={setSelectedMemo}
            items={uniqueMemos}
          />

          <FilterSelect
            label="Agency"
            value={selectedAgency}
            onChange={setSelectedAgency}
            items={uniqueAgencies}
          />

          <Button
            onClick={handleGeneratePDF}
            size="sm"
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md"
          >
            {isGenerating && <Loader2 className="animate-spin mr-2 w-4 h-4" />}
            <FileText className="mr-2 w-4 h-4" />
            Generate PDF
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/60">
              <TableHead className="w-10">
                <Checkbox
                  onCheckedChange={(c) => toggleSelectAll(c === true)}
                />
              </TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Work</TableHead>
              <TableHead className="font-semibold">NIT</TableHead>
              <TableHead className="font-semibold">Agency</TableHead>
              <TableHead className="text-right font-semibold">Amount</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredWorks.map((work) => (
              <TableRow
                key={work.id}
                className={`transition-colors ${
                  selectedWorks.includes(work.id)
                    ? "bg-emerald-50 dark:bg-emerald-950/20"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                }`}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedWorks.includes(work.id)}
                    onCheckedChange={(checked) =>
                      setSelectedWorks((prev) =>
                        checked
                          ? [...prev, work.id]
                          : prev.filter((id) => id !== work.id)
                      )
                    }
                  />
                </TableCell>

                <TableCell className="text-slate-600 dark:text-slate-400">
                  {work.awardofcontractdetails?.workordeermemodate
                    ? formatDate(
                        work.awardofcontractdetails.workordeermemodate
                      )
                    : "-"}
                </TableCell>

                <TableCell className="text-slate-700 dark:text-slate-300">
                  {work.Bidagency?.WorksDetail?.ApprovedActionPlanDetails
                    ?.activityDescription || "N/A"}
                </TableCell>

                <TableCell>
                  <ShowNitDetails
                    nitdetails={
                      work.Bidagency?.WorksDetail?.nitDetails?.memoNumber ?? ""
                    }
                    memoDate={
                      work.Bidagency?.WorksDetail?.nitDetails?.memoDate ||
                      new Date()
                    }
                    workslno={work.Bidagency?.WorksDetail?.workslno ?? ""}
                  />
                </TableCell>

                <TableCell className="text-slate-700 dark:text-slate-300">
                  {work.Bidagency?.agencydetails?.name || "N/A"}
                </TableCell>

                <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                  ₹ {work.Bidagency?.biddingAmount?.toLocaleString("en-IN") || 0}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  violet: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800",
  amber: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
};

function Summary({ title, value, icon, color = "emerald" }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl border ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{value}</h2>
    </div>
  );
}

function FilterSelect({ label, value, onChange, items }: any) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[160px] h-9 text-sm rounded-xl border-slate-200 dark:border-slate-700">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {items.map((i: string) => (
            <SelectItem key={i} value={i}>
              {i}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
