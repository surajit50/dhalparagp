"use client";

import { verifyAllDocuments } from "@/action";
import { Button } from "@/components/ui/button";
import { FileCheck } from "lucide-react";
import { useTransition } from "react";

interface VerifyAllButtonProps {
  warishId: string;
}

export function VerifyAllButton({ warishId }: VerifyAllButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await verifyAllDocuments(warishId);
        });
      }}
    >
      <FileCheck className="h-4 w-4" />
      {isPending ? "Verifying..." : "Verify All Documents"}
    </Button>
  );
}
