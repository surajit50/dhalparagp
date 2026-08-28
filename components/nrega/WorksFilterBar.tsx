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
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface WorksFilterBarProps {
  financialYears: string[];
}

export function WorksFilterBar({ financialYears }: WorksFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [fy, setFy] = useState(searchParams.get("fy") || "all");
  const [status, setStatus] = useState(searchParams.get("status") || "all");

  const debouncedSearch = useDebounce(search, 500);

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
      
      // Reset page to 1 when filters change, unless we're explicitly changing page
      if (!paramsToUpdate.page) {
        params.delete("page");
      }
      
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const queryString = createQueryString({ search: debouncedSearch });
    router.push(`${pathname}?${queryString}`, { scroll: false });
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

  const clearFilters = () => {
    setSearch("");
    setFy("all");
    setStatus("all");
    router.push(pathname, { scroll: false });
  };

  const hasFilters = search !== "" || fy !== "all" || status !== "all";

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
      <div className="w-full sm:max-w-xs">
        <Input
          placeholder="Search by name, ID, GP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9"
        />
      </div>
      
      <Select value={fy} onValueChange={handleFyChange}>
        <SelectTrigger className="h-9 w-full sm:w-[150px]">
          <SelectValue placeholder="Financial Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          {financialYears.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger className="h-9 w-full sm:w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="APPROVED">Approved</SelectItem>
          <SelectItem value="ONGOING">Ongoing</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
        </SelectContent>
      </Select>
      
      {hasFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="h-9 px-3 text-muted-foreground"
        >
          Clear
        </Button>
      )}
    </div>
  );
}
