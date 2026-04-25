"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

export function SearchForm({ initialSearch }: { initialSearch: string }) {
  const [search, setSearch] = useState(initialSearch);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search || isNaN(Number(search))) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid NIT number.",
        variant: "destructive",
      });
      return;
    }
    router.push(
      `/admindashboard/generate/completation-certificate?search=${search}`
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="space-y-2">
        <Label
          htmlFor="nit-search"
          className="text-sm font-medium text-gray-700"
        >
          Search by NIT Number
        </Label>
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="nit-search"
              type="number"
              placeholder="Enter NIT No"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              aria-label="Search by NIT Number"
            />
          </div>
          <Button type="submit" variant="default" className="whitespace-nowrap">
            Search
          </Button>
        </div>
      </div>
    </form>
  );
}
