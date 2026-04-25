"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      className="flex items-center bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
      onClick={() => router.refresh()}
    >
      <RefreshCw className="mr-2 h-4 w-4" />
      Refresh Data
    </Button>
  );
}
