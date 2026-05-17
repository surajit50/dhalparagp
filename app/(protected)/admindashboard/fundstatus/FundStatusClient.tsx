"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CombinedFilter from "@/components/CombinedFilter";
import SummaryCard from "@/components/SummaryCard";
import WorksTabs from "@/components/WorksTabs";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import FullPageLoader from "@/components/FullPageLoader";
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

  // Simulated progress state (0 to 100)
  const [simulatedProgress, setSimulatedProgress] = useState(0);

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

  // Simulate progress while loading
  useEffect(() => {
    if (isLoading) {
      setSimulatedProgress(0);
      const interval = setInterval(() => {
        setSimulatedProgress((prev) => {
          if (prev >= 95) return prev; // stop at 95% until actual load finishes
          return prev + Math.random() * 15;
        });
      }, 300);
      return () => clearInterval(interval);
    } else {
      // When loading finishes, jump to 100%
      setSimulatedProgress(100);
      // Reset after a short delay (optional)
      const timeout = setTimeout(() => setSimulatedProgress(0), 500);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  // Show error alert if fetch fails
  if (isError) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>
            {axios.isAxiosError(error) 
              ? error.response?.data?.error || error.message 
              : "Failed to load fund status"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show full-page loader with progress props
  if (isLoading) {
    return (
      <FullPageLoader
        isLoading={true}
        progress={Math.min(simulatedProgress, 99)} // cap at 99% until real finish
        title="Fetching Fund Status"
        description="Please wait while we load financial data for your filters"
      />
    );
  }

  // Data loaded – render main content
  return (
    <div className="p-4 space-y-6">
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
    </div>
  );
}
