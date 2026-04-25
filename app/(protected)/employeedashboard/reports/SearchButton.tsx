"use client";

import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

type SearchButtonProps = {
  onSearch: () => void;
  isLoading: boolean;
};

export default function SearchButton({
  onSearch,
  isLoading,
}: SearchButtonProps) {
  return (
    <Button onClick={onSearch} className="w-full" disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Search className="w-4 h-4 mr-2" />
      )}
      {isLoading ? "Searching..." : "Search"}
    </Button>
  );
}
