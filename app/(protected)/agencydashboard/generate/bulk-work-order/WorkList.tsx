"use client";

import { useState, useMemo } from "react";
import { Loader2, FileText } from "lucide-react";
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
    <div className="space-y-4">

      {/* HEADER */}
      <div className="bg-blue-900 text-white px-6 py-3 rounded">
        <h1 className="text-lg font-semibold">
          Work Order Register
        </h1>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Summary title="Total Works" value={works.length} />
        <Summary title="Filtered" value={filteredWorks.length} />
        <Summary title="Selected" value={selectedWorks.length} />
        <Summary
          title="Total Amount"
          value={`₹ ${totalValue.toLocaleString("en-IN")}`}
        />
      </div>

      {/* FILTER */}
      <div className="bg-gray-50 border rounded p-4 flex flex-wrap gap-3">

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
          className="bg-blue-900 hover:bg-blue-800"
        >
          {isGenerating && <Loader2 className="animate-spin mr-2 w-4 h-4" />}
          <FileText className="mr-2 w-4 h-4" />
          Generate
        </Button>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded overflow-hidden">

        <Table>
          <TableHeader className="bg-blue-50">
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  onCheckedChange={(c) => toggleSelectAll(c === true)}
                />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Work</TableHead>
              <TableHead>NIT</TableHead>
              <TableHead>Agency</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredWorks.map((work) => (
              <TableRow key={work.id}>
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

                <TableCell>
                  {work.awardofcontractdetails?.workordeermemodate
                    ? formatDate(
                        work.awardofcontractdetails.workordeermemodate
                      )
                    : "-"}
                </TableCell>

                <TableCell>
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

                <TableCell>
                  {work.Bidagency?.agencydetails?.name || "N/A"}
                </TableCell>

                <TableCell className="text-right font-semibold text-blue-900">
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

function Summary({ title, value }: any) {
  return (
    <div className="bg-white border rounded p-4">
      <p className="text-xs text-gray-500">{title}</p>
      <h2 className="text-lg font-semibold text-blue-900">{value}</h2>
    </div>
  );
}

function FilterSelect({ label, value, onChange, items }: any) {
  return (
    <div>
      <label className="text-xs text-gray-600">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[160px] h-9 text-sm">
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
