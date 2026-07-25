"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, X } from "lucide-react";

type StatusFilter = "ALL" | "ACTIVE" | "EXPIRED" | "COMPLETED" | "CANCELLED";

interface MobileFilterSheetProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function MobileFilterSheet({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onClearFilters,
  hasActiveFilters,
}: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 md:hidden"
          aria-label="Open filters"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>Filter Lease Records</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-6">
          {/* Search */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Search by Pond or Party
            </label>
            <div className="relative">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pr-8"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium mb-3 block">Status</label>
            <Tabs
              value={statusFilter}
              onValueChange={(v) => onStatusChange(v as StatusFilter)}
            >
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="ALL" className="text-xs">
                  All
                </TabsTrigger>
                <TabsTrigger value="ACTIVE" className="text-xs">
                  Active
                </TabsTrigger>
                <TabsTrigger value="EXPIRED" className="text-xs">
                  Expired
                </TabsTrigger>
                <TabsTrigger value="COMPLETED" className="text-xs">
                  Done
                </TabsTrigger>
                <TabsTrigger value="CANCELLED" className="text-xs">
                  Cancel
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t">
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={() => {
                  onClearFilters();
                  setOpen(false);
                }}
              >
                Clear Filters
              </Button>
            )}
            <Button
              onClick={() => setOpen(false)}
              className={hasActiveFilters ? "" : "col-span-2"}
            >
              Done
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
