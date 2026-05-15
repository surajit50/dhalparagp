/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Building2,
  Briefcase,
  Calculator,
  FileText,
  Scissors,
  Hash,
  MapPin,
  X,
} from "lucide-react";

interface Work {
  id: string;
  workslno?: number;
  name?: string;
  location?: string;
  estimateNumber?: string;
  ApprovedActionPlanDetails?: {
    activityDescription: string;
    activityCode: string;
  };
  _count?: {
    workEstimateItems?: number;
    workMeasurementBooks?: number;
    workBillAbstracts?: number;
    workBillDeductions?: number;
  };
}

interface WorkSearchAndSelectProps {
  works: Work[];
  selectedWorkId: string | null;
  onSelect: (workId: string) => void;
  placeholder?: string;
  showCountBadges?: boolean;
}

export default function WorkSearchAndSelect({
  works,
  selectedWorkId,
  onSelect,
  placeholder = "Search by work name, location, estimate, code, or serial no…",
  showCountBadges = false,
}: WorkSearchAndSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // 🔹 Helpers
  const getDisplayName = (work: Work) =>
    work.name ||
    work.ApprovedActionPlanDetails?.activityDescription ||
    `Work ${work.workslno ?? ""}`;

  const getWorkCode = (work: Work) =>
    work.estimateNumber || work.ApprovedActionPlanDetails?.activityCode || "";

  const getSearchableText = (work: Work) =>
    [
      getDisplayName(work),
      work.location,
      getWorkCode(work),
      work.workslno,
      work.ApprovedActionPlanDetails?.activityCode,
      work.ApprovedActionPlanDetails?.activityDescription,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

  // 🔍 Filter Logic
  const filteredWorks = useMemo(() => {
    if (!searchQuery.trim()) return works;
    const words = searchQuery.toLowerCase().split(/\s+/);

    return works.filter((work) =>
      words.every((word) => getSearchableText(work).includes(word)),
    );
  }, [works, searchQuery]);

  const count = (w: Work, k: keyof NonNullable<Work["_count"]>) =>
    w._count?.[k] || 0;

  return (
    <div className="bg-wb-bg p-5 rounded-2xl space-y-4 border border-wb-border/40 shadow-sm">
      {/* 🔍 Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="
            pl-10 pr-10 h-11
            bg-white/80 backdrop-blur
            border border-wb-border
            rounded-xl
            shadow-sm
            focus-visible:ring-2
            focus-visible:ring-wb-primary/60
            transition-all
          "
        />

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-black"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Result Count */}
      {searchQuery && (
        <p className="text-xs text-muted-foreground">
          Showing {filteredWorks.length} of {works.length} works
        </p>
      )}

      {/* 📦 Work List */}
      <ScrollArea className="h-96 rounded-xl border border-wb-border bg-white shadow-inner">
        <div className="p-3 space-y-3">
          {filteredWorks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">
                No works found
              </p>
              <p className="text-xs text-muted-foreground">
                Try different keywords
              </p>
            </div>
          ) : (
            filteredWorks.map((work) => {
              const isSelected = selectedWorkId === work.id;
              const code = getWorkCode(work);

              return (
                <button
                  key={work.id}
                  onClick={() => onSelect(work.id)}
                  className={`
                    group w-full text-left
                    px-4 py-3 rounded-xl border
                    transition-all duration-200
                    ${
                      isSelected
                        ? "border-wb-primary bg-wb-primary/5 shadow-md ring-2 ring-wb-primary/20"
                        : "border-wb-border hover:shadow-md hover:-translate-y-[1px]"
                    }
                  `}
                >
                  <div className="flex flex-col gap-2">
                    {/* Title */}
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-semibold leading-snug group-hover:text-wb-primary transition-colors">
                        {getDisplayName(work)}
                      </p>

                      {work.workslno && (
                        <span className="text-[11px] font-semibold text-wb-primary bg-wb-primary/10 px-2 py-0.5 rounded-full">
                          #{work.workslno}
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {work.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 opacity-70" />
                          {work.location}
                        </span>
                      )}

                      {code && (
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3 opacity-70" />
                          {code}
                        </span>
                      )}
                    </div>

                    {/* Badges */}
                    {showCountBadges && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {count(work, "workEstimateItems") > 0 && (
                          <Badge className="bg-orange-50 text-orange-600 border border-orange-200 text-[10px]">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {count(work, "workEstimateItems")}
                          </Badge>
                        )}

                        {count(work, "workMeasurementBooks") > 0 && (
                          <Badge className="bg-purple-50 text-purple-600 border border-purple-200 text-[10px]">
                            <Calculator className="h-3 w-3 mr-1" />
                            {count(work, "workMeasurementBooks")}
                          </Badge>
                        )}

                        {count(work, "workBillAbstracts") > 0 && (
                          <Badge className="bg-green-50 text-green-600 border border-green-200 text-[10px]">
                            <FileText className="h-3 w-3 mr-1" />
                            {count(work, "workBillAbstracts")}
                          </Badge>
                        )}

                        {count(work, "workBillDeductions") > 0 && (
                          <Badge className="bg-orange-50 text-orange-600 border border-orange-200 text-[10px]">
                            <Scissors className="h-3 w-3 mr-1" />
                            {count(work, "workBillDeductions")}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
