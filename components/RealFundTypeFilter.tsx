"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RealFundTypeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFundType = searchParams.get("fundType");

  const handleFundTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("fundType");
    } else {
      params.set("fundType", value);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <Select
      defaultValue={currentFundType || "all"}
      onValueChange={handleFundTypeChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Fund Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Fund Types</SelectItem>
        <SelectItem value="Tied">Tied</SelectItem>
        <SelectItem value="Untied">Untied</SelectItem>
      </SelectContent>
    </Select>
  );
}
