"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CopyNameButtonProps {
  workName: string;
}

export function CopyNameButton({ workName }: CopyNameButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(workName);
    toast.success("Work name copied to clipboard");
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="flex items-center gap-1">
      <Copy className="w-3 h-3" />
      Copy Name
    </Button>
  );
}
