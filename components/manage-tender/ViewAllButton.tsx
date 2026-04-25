"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ViewAllButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() =>
        router.push("/admindashboard/manage-tender/view")
      }
    >
      View All Tenders
      <ChevronRight className="ml-2 h-4 w-4" />
    </Button>
  );
}
