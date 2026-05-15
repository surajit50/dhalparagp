import { Suspense } from "react";
import FundDetailsClient from "./FundDetailsClient";
import FilterSkeleton from "@/components/FilterSkeleton";

export const metadata = {
  title: "Fund Details | Admin Dashboard",
  description: "Manage scheme-wise fund availability and allocations.",
};

export default function FundDetailsPage() {
  return (
    <Suspense fallback={<FilterSkeleton />}>
      <FundDetailsClient />
    </Suspense>
  );
}
