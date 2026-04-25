"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  className?: string;
}

function parseParamDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
}

export function DateRangeFilter({ className }: DateRangeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [range, setRange] = useState<DateRange | undefined>();

  useEffect(() => {
    const from = parseParamDate(searchParams.get("from"));
    const to = parseParamDate(searchParams.get("to"));
    if (from || to) {
      setRange({ from, to });
    } else {
      setRange(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const label = useMemo(() => {
    if (range?.from && range?.to) {
      return `${format(range.from, "PPP")} – ${format(range.to, "PPP")}`;
    }
    if (range?.from) {
      return `${format(range.from, "PPP")} –`;
    }
    return "Select date range";
  }, [range]);

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (range?.from) {
      params.set("from", format(range.from, "yyyy-MM-dd"));
    } else {
      params.delete("from");
    }
    if (range?.to) {
      params.set("to", format(range.to, "yyyy-MM-dd"));
    } else {
      params.delete("to");
    }
    router.push(`?${params.toString()}`);
  };

  const clear = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !range?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-2">
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={range}
              onSelect={setRange}
              initialFocus
            />
            <div className="flex items-center justify-end gap-2 p-2 pt-0">
              <Button variant="ghost" onClick={clear}>
                Clear
              </Button>
              <Button onClick={apply}>Apply</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DateRangeFilter;

