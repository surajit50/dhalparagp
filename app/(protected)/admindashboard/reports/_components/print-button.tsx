"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintButtonProps {
  label?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
}

export function PrintButton({
  label = "Print",
  variant = "outline",
  className = "",
}: PrintButtonProps) {
  return (
    <Button
      variant={variant}
      onClick={() => window.print()}
      className={`print:hidden ${className}`}
    >
      <Printer className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
