"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/lib/db";
import { useEffect, useState } from "react";
import { getFundType } from "@/lib/actions";

export default function FundTypeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFundType = searchParams.get("fundType");
  const [fundTypes, setFundTypes] = useState<Array<{ schemeName: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getFundTypes = async () => {
      try {
        setIsLoading(true);
        const types = await getFundType();
        setFundTypes(types);
      } catch (error) {
        console.error("Error fetching fund types:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getFundTypes();
  }, []);

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
      disabled={isLoading}
    >
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={isLoading ? "Loading..." : "Select Fund Type"}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Funds</SelectItem>
        {fundTypes.map((type) => (
          <SelectItem key={type.schemeName} value={type.schemeName}>
            {type.schemeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
