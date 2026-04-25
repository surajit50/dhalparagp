"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TenderStatus } from "@prisma/client";
import { X } from "lucide-react";

interface TenderFilterProps {
  statusOptions: TenderStatus[];
}

const statusVariants: Record<
  TenderStatus,
  "destructive" | "success" | "warning" | "default"
> = {
  Cancelled: "destructive",
  published: "success",
  publish: "success",
  ToBeOpened: "warning",
  TechnicalBidOpening: "warning",
  TechnicalEvaluation: "warning",
  FinancialBidOpening: "warning",
  FinancialEvaluation: "warning",
  Retender: "warning",
  AOC: "default",
};

export function TenderFilter({ statusOptions }: TenderFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedStatus = searchParams.get("status") || "all";

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }

    router.push(`?${params.toString()}`);
  };

  const clearFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 border rounded-md px-3 py-2">

      {/* Label */}
      <Label htmlFor="status-filter" className="text-xs text-muted-foreground whitespace-nowrap">
        Tender Status
      </Label>

      {/* Select */}
      <Select value={selectedStatus} onValueChange={handleStatusChange}>
        <SelectTrigger id="status-filter" className="w-[220px] h-9 bg-white text-sm">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>

          {statusOptions.map((status) => (
            <SelectItem key={status} value={status}>
              <div className="flex items-center gap-2">
                <Badge
                  variant={statusVariants[status]}
                  className="text-xs"
                >
                  {status}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Button */}
      {selectedStatus !== "all" && (
        <Button
          size="sm"
          variant="ghost"
          onClick={clearFilter}
          className="h-8 px-2 text-xs"
        >
          <X size={14} className="mr-1" />
          Clear
        </Button>
      )}

    </div>
  );
}
