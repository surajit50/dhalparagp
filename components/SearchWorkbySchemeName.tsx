"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export function SearchWorkbyNameForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [workName, setWorkName] = useState(searchParams.get("workName") || "");
  const [isFetching, setIsFetching] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (workName.trim() && !isFetching) {
      setIsFetching(true);
      const params = new URLSearchParams(searchParams.toString());
      params.set("workName", workName.trim());
      // we could keep or clear other params, let's keep them for combined filtering
      router.push(`?${params.toString()}`);
      setIsFetching(false);
    }
  };

  const handleClear = () => {
    setWorkName("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("workName");
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-6 text-gray-700 dark:text-gray-200">
        Search by Work Name
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            placeholder="Enter Work Name..."
            value={workName}
            onChange={(e) => setWorkName(e.target.value)}
            className="w-full sm:w-[320px] rounded-lg h-11"
          />
          <Button
            type="submit"
            disabled={!workName.trim() || isFetching}
            className="w-full sm:w-auto px-8 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
          >
            {isFetching ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </span>
            ) : (
              "Search"
            )}
          </Button>
          {searchParams.get("workName") && (
             <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="w-full sm:w-auto px-8 py-2 rounded-lg h-11"
              >
                Clear
              </Button>
          )}
        </div>
      </form>
    </div>
  );
}
