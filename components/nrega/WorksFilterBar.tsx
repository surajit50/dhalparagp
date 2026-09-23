"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Search, X, Filter, Download } from "lucide-react";
import { WORK_STATUS_OPTIONS } from "@/lib/utils/nrega";

interface WorksFilterBarProps {
  financialYears: string[];
  gramSansads?: string[];
  csvRows?: Record<string, string | number>[];
  csvFilename?: string;
}

export function WorksFilterBar({ financialYears, gramSansads = [], csvRows, csvFilename = "nrega-works" }: WorksFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cancelledRef = useRef(false);

  const handleCsvExport = () => {
    if (!csvRows || csvRows.length === 0) return;
    const headers = Object.keys(csvRows[0]);
    const lines = [
      headers.map((h) => `"${h}"`).join(","),
      ...csvRows.map((row) =>
        headers.map((h) => {
          const val = row[h] ?? "";
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${csvFilename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [fy, setFy] = useState(searchParams.get("fy") || "all");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [gs, setGs] = useState(searchParams.get("gs") || "all");

  const debouncedSearch = useDebounce(search, 400);

  const createQueryString = useCallback(
    (paramsToUpdate: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      
      for (const [key, value] of Object.entries(paramsToUpdate)) {
        if (value === null || value === "all" || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      
      if (!paramsToUpdate.page) {
        params.delete("page");
      }
      
      return params.toString();
    },
    [searchParams]
  );

  // Cancelled-flag guard for navigation effect
  useEffect(() => {
    cancelledRef.current = false;
    const queryString = createQueryString({ search: debouncedSearch });
    if (!cancelledRef.current) {
      router.push(`${pathname}?${queryString}`, { scroll: false });
    }
    return () => {
      cancelledRef.current = true;
    };
  }, [debouncedSearch, pathname, router, createQueryString]);

  const handleFyChange = (value: string) => {
    setFy(value);
    const queryString = createQueryString({ fy: value });
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    const queryString = createQueryString({ status: value });
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };

  const handleGsChange = (value: string) => {
    setGs(value);
    const queryString = createQueryString({ gs: value });
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };

  const clearFilters = () => {
    setSearch("");
    setFy("all");
    setStatus("all");
    setGs("all");
    router.push(pathname, { scroll: false });
  };

  const activeFilterCount = [
    search !== "",
    fy !== "all",
    status !== "all",
    gs !== "all",
  ].filter(Boolean).length;

  const hasFilters = activeFilterCount > 0;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center flex-wrap gap-3">
      <div className="flex items-center gap-2 lg:gap-4">
        <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground whitespace-nowrap">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-[10px] rounded-full">
              {activeFilterCount}
            </Badge>
          )}
        </span>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row flex-wrap gap-2">
        <div className="relative sm:min-w-[260px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name, ID, GP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 pr-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded-sm"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        
        <Select value={fy} onValueChange={handleFyChange}>
          <SelectTrigger className="h-9 w-full sm:w-[150px]">
            <SelectValue placeholder="Financial Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {financialYears.map((year) => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="h-9 w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {WORK_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {gramSansads.length > 0 && (
          <Select value={gs} onValueChange={handleGsChange}>
            <SelectTrigger className="h-9 w-full sm:w-[180px]">
              <SelectValue placeholder="Gram Sansad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sansads</SelectItem>
              {gramSansads.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {hasFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="h-9 px-3 text-muted-foreground hover:text-destructive"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        )}

        {csvRows && csvRows.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCsvExport}
            className="h-9 px-3 gap-1.5 ml-auto"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        )}
      </div>
    </div>
  );
}
