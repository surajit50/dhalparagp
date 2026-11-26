"use client";

import { useMemo, useState } from "react";
import type { Agreement } from "@/types/agreement";
import { AgrementCertificate } from "@/components/PrintTemplet/Agrement-certificate";
import { formatDate } from "@/utils/utils";
import { gpcode } from "@/constants/gpinfor";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Building2,
  CalendarDays,
  FileText,
  Inbox,
  Layers,
  Search,
} from "lucide-react";

interface NitGroup {
  key: string;
  memoNumber: number;
  memoDate: Date;
  agreements: Agreement[];
}

function getNitMeta(agreement: Agreement) {
  const nit = agreement.acceptagency?.WorksDetail?.nitDetails;
  return {
    memoNumber: nit?.memoNumber ?? 0,
    memoDate: nit?.memoDate ? new Date(nit.memoDate) : new Date(),
  };
}

function getNitLabel(memoNumber: number, memoDate: Date) {
  return `${memoNumber}/${gpcode}/${memoDate.getFullYear()}`;
}

interface AgreementListProps {
  agreements: Agreement[];
}

export function AgreementList({ agreements }: AgreementListProps) {
  const [query, setQuery] = useState("");

  const groups = useMemo<NitGroup[]>(() => {
    const map = new Map<string, NitGroup>();

    for (const agreement of agreements) {
      const { memoNumber, memoDate } = getNitMeta(agreement);
      const key = `${memoNumber}-${memoDate.getTime()}`;

      if (!map.has(key)) {
        map.set(key, { key, memoNumber, memoDate, agreements: [] });
      }
      map.get(key)!.agreements.push(agreement);
    }

    return Array.from(map.values()).sort(
      (a, b) => b.memoDate.getTime() - a.memoDate.getTime()
    );
  }, [agreements]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;

    return groups
      .map((group) => {
        const nitMatch = getNitLabel(
          group.memoNumber,
          group.memoDate
        )
          .toLowerCase()
          .includes(q);

        const matchingAgreements = group.agreements.filter((agreement) => {
          const agency = agreement.acceptagency?.agencydetails?.name ?? "";
          const agreementNo = agreement.aggrementno ?? "";
          const description =
            agreement.workdetails?.activityDescription ?? "";
          return (
            agency.toLowerCase().includes(q) ||
            agreementNo.toLowerCase().includes(q) ||
            description.toLowerCase().includes(q)
          );
        });

        return {
          ...group,
          agreements: nitMatch ? group.agreements : matchingAgreements,
        };
      })
      .filter((group) => group.agreements.length > 0);
  }, [groups, query]);

  const totalAgreements = filteredGroups.reduce(
    (sum, group) => sum + group.agreements.length,
    0
  );

  if (agreements.length === 0) {
    return (
      <EmptyState
        title="No agreements found"
        description="No agreement records are available for the selected financial year."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by NIT no, agency, agreement no..."
            className="h-11 rounded-xl pl-10"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Layers className="h-4 w-4" />
          <span>
            <span className="font-semibold text-foreground">
              {filteredGroups.length}
            </span>{" "}
            NIT{filteredGroups.length !== 1 ? "s" : ""} ·{" "}
            <span className="font-semibold text-foreground">
              {totalAgreements}
            </span>{" "}
            Agreement{totalAgreements !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <EmptyState
          title="No matching agreements"
          description="Try adjusting your search to find the agreement you need."
        />
      ) : (
        <Accordion
          type="multiple"
          defaultValue={filteredGroups.map((group) => group.key)}
          className="space-y-4"
        >
          {filteredGroups.map((group) => (
            <AccordionItem
              key={group.key}
              value={group.key}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex flex-1 flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between sm:pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        NIT No.
                      </p>
                      <p className="font-semibold text-foreground">
                        {getNitLabel(group.memoNumber, group.memoDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="gap-1.5 rounded-lg border-slate-200 px-3 py-1 font-normal text-muted-foreground dark:border-slate-700"
                    >
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(group.memoDate)}
                    </Badge>
                    <Badge className="rounded-lg bg-teal-500 px-3 py-1 text-white hover:bg-teal-500">
                      {group.agreements.length} Agreement
                      {group.agreements.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-5 pb-5 pt-0">
                <div className="space-y-3">
                  {group.agreements.map((agreement, index) => (
                    <div
                      key={agreement.id}
                      className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:border-teal-200 hover:bg-teal-50/40 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-teal-900 dark:hover:bg-teal-950/20 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-semibold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                          {index + 1}
                        </span>

                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {agreement.workdetails?.activityDescription ||
                              "Work description not available"}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5" />
                              <span className="max-w-[240px] truncate">
                                {agreement.acceptagency?.agencydetails?.name ||
                                  "N/A"}
                              </span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5" />
                              Agreement {agreement.aggrementno}
                              {agreement.aggrementdate
                                ? ` · ${formatDate(agreement.aggrementdate)}`
                                : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center justify-end">
                        <AgrementCertificate agrement={agreement} />
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <Inbox className="h-7 w-7" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
