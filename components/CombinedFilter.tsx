"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface FundType {
  fundType: string;
}

interface SchemeName {
  schemeName: string;
}

interface CombinedFilterProps {
  nitOptions: string[];
  financialYears: string[];
  fundTypes: FundType[];
  schemeNames: SchemeName[];
  selectedNit?: string;
  selectedFundType?: string;
  selectedSchemeName?: string;
  selectedYear?: string;
  selectedSortBy?: string;
  selectedOrder?: "asc" | "desc";
}

export default function CombinedFilter({
  nitOptions,
  financialYears,
  fundTypes,
  schemeNames,
  selectedNit = "",
  selectedFundType = "",
  selectedSchemeName = "",
  selectedYear = "",
  selectedSortBy = "nit",
  selectedOrder = "asc",
}: CombinedFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<"nit" | "schemeName">(
    selectedNit ? "nit" : selectedSchemeName ? "schemeName" : "nit",
  );
  const [isLoading, setIsLoading] = useState(false);

  // Query string creation logic remains unchanged
  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        value === null ? newParams.delete(key) : newParams.set(key, value);
      });
      return newParams.toString();
    },
    [searchParams],
  );

  // Loading state management
  useEffect(() => {
    if (isLoading) setIsLoading(false);
  }, [searchParams, isLoading]);

  // Default year selection
  useEffect(() => {
    if (!searchParams.has("year") && financialYears.length > 0) {
      const defaultYear = financialYears[0];
      router.replace(`${pathname}?${createQueryString({ year: defaultYear })}`);
    }
  }, [searchParams, financialYears, router, pathname, createQueryString]);

  // Event handlers remain unchanged
  const handleYearChange = (year: string) => {
    if (year === selectedYear) return;
    setIsLoading(true);
    router.push(
      `${pathname}?${createQueryString({
        year,
        nit: null,
        schemeName: null,
        fundType: null,
        tab: searchParams.get("tab") || "all",
      })}`,
    );
  };

  const handleFilterChange = (value: string) => {
    setIsLoading(true);
    const params = {
      nit: activeFilter === "nit" ? value || null : null,
      schemeName: activeFilter === "schemeName" ? value || null : null,
      tab: searchParams.get("tab") || "all",
    };
    router.push(`${pathname}?${createQueryString(params)}`);
  };

  const handleFundTypeChange = (value: string) => {
    setIsLoading(true);
    router.push(
      `${pathname}?${createQueryString({
        fundType: value === "all" ? null : value,
        tab: searchParams.get("tab") || "all",
      })}`,
    );
  };

  const handleFilterTypeChange = (filterType: "nit" | "schemeName") => {
    setActiveFilter(filterType);
    router.push(
      `${pathname}?${createQueryString({
        nit: null,
        schemeName: null,
        tab: searchParams.get("tab") || "all",
      })}`,
    );
  };

  const handleSortChange = (sortBy: string) => {
    setIsLoading(true);
    router.push(`${pathname}?${createQueryString({ sortBy })}`);
  };

  const handleOrderChange = (order: string) => {
    setIsLoading(true);
    router.push(`${pathname}?${createQueryString({ order })}`);
  };

  return (
    <Card className="p-4 md:p-6 space-y-4 md:space-y-6 bg-white shadow-xl border-0 rounded-xl md:rounded-2xl transition-all duration-300 hover:shadow-2xl">
      {/* Financial Year Selector */}
      <div className="relative">
        <Label className="text-sm md:text-base font-semibold text-gray-700 mb-2 md:mb-3 block">
          Financial Year <span className="text-orange-600">*</span>
        </Label>
        <Select
          value={selectedYear}
          onValueChange={handleYearChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg py-4 md:py-5 px-4 hover:border-orange-100 focus:ring-2 focus:ring-orange-500 transition-colors">
            <SelectValue placeholder="Select year" />
            {/* Responsive loading spinner positioning */}
            {isLoading && (
              <Loader2 className="absolute right-4 md:right-8 h-4 w-4 animate-spin text-orange-600" />
            )}
          </SelectTrigger>
          <SelectContent className="rounded-lg border-2 border-gray-100 shadow-lg max-h-[calc(100vh-200px)]">
            {financialYears.map((year) => (
              <SelectItem
                key={year}
                value={year}
                className="text-sm md:text-base hover:bg-orange-50 focus:bg-orange-50 transition-colors"
              >
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedYear && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Filter Type Selector - Responsive Radio Group */}
          <div className="bg-orange-50 p-3 md:p-4 rounded-xl border-2 border-orange-100">
            <RadioGroup
              value={activeFilter}
              onValueChange={(value) =>
                handleFilterTypeChange(value as "nit" | "schemeName")
              }
              className="flex flex-col md:flex-row gap-3 md:gap-4"
            >
              {["nit", "schemeName"].map((filterType) => (
                <div
                  key={filterType}
                  className={`w-full md:flex-1 p-2 rounded-lg cursor-pointer transition-all ${
                    activeFilter === filterType
                      ? "bg-orange-600 text-white shadow-md"
                      : "bg-white hover:bg-orange-50"
                  }`}
                >
                  <RadioGroupItem
                    value={filterType}
                    id={`filter-${filterType}`}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={`filter-${filterType}`}
                    className={`w-full block text-center font-medium cursor-pointer px-4 py-2 ${
                      activeFilter === filterType
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                  >
                    {filterType === "nit" ? "NIT Number" : "Scheme Name"}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Dynamic Filter Selector */}
          <div className="relative mt-4 md:mt-6">
            <Label className="text-sm md:text-base font-semibold text-gray-700 mb-2 md:mb-3 block">
              {activeFilter === "nit"
                ? "Select NIT Number"
                : "Select Scheme Name"}
            </Label>
            <Select
              value={activeFilter === "nit" ? selectedNit : selectedSchemeName}
              onValueChange={handleFilterChange}
              disabled={isLoading || !selectedYear}
            >
              <SelectTrigger className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg py-4 md:py-5 px-4 hover:border-orange-100 focus:ring-2 focus:ring-orange-500 transition-colors">
                <SelectValue
                  placeholder={
                    activeFilter === "nit"
                      ? "All NIT Numbers"
                      : "All Scheme Names"
                  }
                />
                {isLoading && (
                  <Loader2 className="absolute right-4 md:right-8 h-4 w-4 animate-spin text-orange-600" />
                )}
              </SelectTrigger>
              <SelectContent className="rounded-lg border-2 border-gray-100 shadow-lg max-h-[calc(100vh-200px)]">
                <SelectItem
                  value="all"
                  className="text-sm md:text-base focus:bg-orange-600 focus:text-white data-[state=checked]:bg-orange-100 transition-colors"
                >
                  {activeFilter === "nit"
                    ? "All NIT Numbers"
                    : "All Scheme Names"}
                </SelectItem>
                {activeFilter === "nit"
                  ? nitOptions.map((nit) => (
                      <SelectItem
                        key={nit}
                        value={nit}
                        className="text-sm md:text-base focus:bg-orange-600 focus:text-white data-[state=checked]:bg-orange-100 transition-colors"
                      >
                        {nit.padStart(4, "0")}
                      </SelectItem>
                    ))
                  : schemeNames.map((scheme) => (
                      <SelectItem
                        key={scheme.schemeName}
                        value={scheme.schemeName}
                        className="text-sm md:text-base focus:bg-orange-600 focus:text-white data-[state=checked]:bg-orange-100 transition-colors"
                      >
                        {scheme.schemeName}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          {/* Standalone Fund Type Selector */}
          <div className="relative mt-4 md:mt-6">
            <Label className="text-sm md:text-base font-semibold text-gray-700 mb-2 md:mb-3 block">
              Select Fund Type
            </Label>
            <Select
              value={selectedFundType}
              onValueChange={handleFundTypeChange}
              disabled={isLoading || !selectedYear}
            >
              <SelectTrigger className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg py-4 md:py-5 px-4 hover:border-orange-100 focus:ring-2 focus:ring-orange-500 transition-colors">
                <SelectValue placeholder="All Fund Types" />
                {isLoading && (
                  <Loader2 className="absolute right-4 md:right-8 h-4 w-4 animate-spin text-orange-600" />
                )}
              </SelectTrigger>
              <SelectContent className="rounded-lg border-2 border-gray-100 shadow-lg max-h-[calc(100vh-200px)]">
                <SelectItem
                  value="all"
                  className="text-sm md:text-base focus:bg-orange-600 focus:text-white data-[state=checked]:bg-orange-100 transition-colors"
                >
                  All Fund Types
                </SelectItem>
                {fundTypes.map((fund) => (
                  <SelectItem
                    key={fund.fundType}
                    value={fund.fundType}
                    className="text-sm md:text-base focus:bg-orange-600 focus:text-white data-[state=checked]:bg-orange-100 transition-colors"
                  >
                    {fund.fundType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sorting Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-6 mt-6 border-t border-gray-100">
            <div className="space-y-2 md:space-y-3">
              <Label className="text-sm md:text-base font-semibold text-gray-700 block">
                Sort By
              </Label>
              <Select
                value={selectedSortBy}
                onValueChange={handleSortChange}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg py-4 md:py-5 px-4 hover:border-orange-100 focus:ring-2 focus:ring-orange-500 transition-colors">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-2 border-gray-100 shadow-lg">
                  <SelectItem value="nit" className="focus:bg-orange-600 focus:text-white data-[state=checked]:bg-orange-100 transition-colors">NIT Number</SelectItem>
                  <SelectItem value="activityCode" className="focus:bg-orange-600 focus:text-white data-[state=checked]:bg-orange-100 transition-colors">Activity Code</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:space-y-3">
              <Label className="text-sm md:text-base font-semibold text-gray-700 block">
                Order
              </Label>
              <Select
                value={selectedOrder}
                onValueChange={handleOrderChange}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg py-4 md:py-5 px-4 hover:border-orange-100 focus:ring-2 focus:ring-orange-500 transition-colors">
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-2 border-gray-100 shadow-lg">
                  <SelectItem value="asc" className="focus:bg-orange-600 focus:text-white data-[state=checked]:bg-orange-100 transition-colors">Ascending</SelectItem>
                  <SelectItem value="desc" className="focus:bg-orange-600 focus:text-white data-[state=checked]:bg-orange-100 transition-colors">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
}

