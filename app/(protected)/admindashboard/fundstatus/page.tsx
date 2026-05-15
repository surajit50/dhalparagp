import { Suspense } from "react";
import FilterSkeleton from "@/components/FilterSkeleton";
import FundStatusClient from "./FundStatusClient";

export default function FundstatusPage() {
  return (
    <Suspense fallback={<FilterSkeleton />}>
      <FundStatusClient />
    </Suspense>
  );
}
