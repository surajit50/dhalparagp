"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CopyEstimateButtonProps {
  estimateAmount: number;
}

export function CopyEstimateButton({ estimateAmount }: CopyEstimateButtonProps) {
  const handleCopy = () => {
    const formatted = `₹${estimateAmount.toLocaleString()}`;
    navigator.clipboard.writeText(formatted);
    toast.success("Estimate amount copied to clipboard");
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="flex items-center gap-1">
      <Copy className="w-3 h-3" />
      Copy Estimate
    </Button>
  );
}
