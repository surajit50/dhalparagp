"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  generateFinancialYears,
  getCurrentFinancialYear,
} from "@/utils/financialYear";

export function FinancialYearSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const financialYears = generateFinancialYears();

  const currentFinancialYear =
    searchParams.get("financialYear") || getCurrentFinancialYear();

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("financialYear", year);

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <label
        htmlFor="financial-year"
        className="text-sm font-semibold text-gray-700"
      >
        Financial Year
      </label>

      <div className="relative">
        <Select
          value={currentFinancialYear}
          onValueChange={handleYearChange}
        >
          <SelectTrigger
            id="financial-year"
            className="w-[200px] bg-white shadow-sm border-gray-300 focus:ring-2 focus:ring-red-600"
          >
            <SelectValue placeholder="Select financial year" />
          </SelectTrigger>

          <SelectContent>
            {financialYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isPending && (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-500" />
        )}
      </div>
    </div>
  );
}
