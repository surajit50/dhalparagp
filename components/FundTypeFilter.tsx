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
  const currentSchemeName = searchParams.get("schemeName");
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

  const handleSchemeNameChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("schemeName");
    } else {
      params.set("schemeName", value);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <Select
      defaultValue={currentSchemeName || "all"}
      onValueChange={handleSchemeNameChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={isLoading ? "Loading..." : "Select Scheme Name"}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Scheme Names</SelectItem>
        {fundTypes.map((type) => (
          <SelectItem key={type.schemeName} value={type.schemeName}>
            {type.schemeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
