"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

interface FinancialYearFilterProps {
  className?: string;
}

export function FinancialYearFilter({ className }: FinancialYearFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedYear, setSelectedYear] = useState<string>("");

  // Get current financial year range (April 1 - March 31)
  const getFinancialYearRange = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed (0 = Jan)

    const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const endYear = currentMonth >= 3 ? currentYear + 1 : currentYear;

    return { startYear, endYear };
  };

  // Generate financial year options (current year and 5 years back)
  const generateFinancialYears = () => {
    const { startYear } = getFinancialYearRange();
    const years = [];
    
    for (let i = 0; i < 6; i++) {
      const year = startYear - i;
      const financialYear = `${year}-${year + 1}`;
      years.push(financialYear);
    }
    
    return years;
  };

  const financialYears = generateFinancialYears();

  useEffect(() => {
    // Set initial value from URL params or current financial year
    const yearFromUrl = searchParams.get("financialYear");
    if (yearFromUrl) {
      setSelectedYear(yearFromUrl);
    } else {
      const { startYear } = getFinancialYearRange();
      const currentFinancialYear = `${startYear}-${startYear + 1}`;
      setSelectedYear(currentFinancialYear);
    }
  }, [searchParams]);

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    
    // Update URL with new financial year
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("financialYear", value);
    } else {
      params.delete("financialYear");
    }
    
    // Preserve other search params
    const currentSearch = searchParams.get("search");
    if (currentSearch) {
      params.set("search", currentSearch);
    }
    
    router.push(`?${params.toString()}`);
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <Label htmlFor="financial-year" className="text-sm font-medium">
          Financial Year:
        </Label>
      </div>
      <Select value={selectedYear} onValueChange={handleYearChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Financial Year" />
        </SelectTrigger>
        <SelectContent>
          {financialYears.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Utility function to get date range for a financial year
export function getFinancialYearDateRange(financialYear: string) {
  const [startYearStr] = financialYear.split("-");
  const startYear = parseInt(startYearStr);
  
  const financialYearStart = new Date(startYear, 3, 1); // April 1
  const financialYearEnd = new Date(startYear + 1, 2, 31); // March 31
  
  return { financialYearStart, financialYearEnd };
} 