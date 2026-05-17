"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CombinedFilter from "@/components/CombinedFilter";
import { Suspense } from "react";
import FilterSkeleton from "@/components/FilterSkeleton";
import SummaryCard from "@/components/SummaryCard";
import WorksTabs from "@/components/WorksTabs";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import axios from "axios";

export default function FundStatusClient() {
  const searchParams = useSearchParams();
  const nit = searchParams.get("nit") || "";
  const schemeName = searchParams.get("schemeName") || "";
  const fundType = searchParams.get("fundType") || "";
  const year = searchParams.get("year") || "";
  const sortBy = searchParams.get("sortBy") || "nit";
  const order = searchParams.get("order") || "asc";
  const tab = searchParams.get("tab") || "all";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["fundstatus", { nit, schemeName, fundType, year, sortBy, order }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (nit) params.set("nit", nit);
      if (schemeName) params.set("schemeName", schemeName);
      if (fundType) params.set("fundType", fundType);
      if (year) params.set("year", year);
      if (sortBy) params.set("sortBy", sortBy);
      if (order) params.set("order", order);
      
      const { data } = await axios.get(`/api/fundstatus?${params.toString()}`);
      return data;
    },
  });

  if (isError) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>
            {axios.isAxiosError(error) ? error.response?.data?.error || error.message : "Failed to load fund status"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <Suspense fallback={<FilterSkeleton />}>
        {isLoading ? (
          <FilterSkeleton />
        ) : (
          <CombinedFilter
            nitOptions={data?.nitOptions || []}
            financialYears={data?.financialYears || []}
            schemeNames={data?.schemeNames || []}
            fundTypes={data?.fundTypes || []}
            selectedNit={nit}
            selectedSchemeName={schemeName}
            selectedFundType={fundType}
            selectedYear={data?.effectiveYear || year}
            selectedSortBy={sortBy}
            selectedOrder={order as "asc" | "desc"}
          />
        )}
      </Suspense>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <>
          <SummaryCard
            summaryData={data?.summary || {}}
            grandTotalPaid={data?.grandTotalPaid || 0}
            grandTotalPending={data?.grandTotalPending || 0}
            totalWorks={data?.totalWorks || 0}
          />

          <WorksTabs
            works={data?.works || []}
            selectedSchemeName={schemeName}
            selectedFundType={fundType}
            selectedYear={data?.effectiveYear || year}
          />
        </>
      )}
    </div>
  );
}
