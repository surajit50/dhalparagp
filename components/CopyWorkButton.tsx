"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CopyWorkButtonProps {
  workName: string;
  estimateAmount: number;
}

export function CopyWorkButton({ workName, estimateAmount }: CopyWorkButtonProps) {
  const handleCopy = () => {
    const text = `Work: ${workName}, Estimate: ₹${estimateAmount.toLocaleString()}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="flex items-center gap-1">
      <Copy className="w-3 h-3" />
      Copy Name & Estimate
    </Button>
  );
}
