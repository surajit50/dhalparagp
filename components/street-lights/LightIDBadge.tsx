"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LightIDBadgeProps {
  lightId: string;
  className?: string;
  showCopy?: boolean;
}

export function LightIDBadge({
  lightId,
  className,
  showCopy = true,
}: LightIDBadgeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(lightId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse ID parts: GP-SL-DHP-LAL-0001
  const parts = lightId.split("-");
  const serial = parts[parts.length - 1];
  const prefix = parts.slice(0, parts.length - 1).join("-");

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1",
        className
      )}
    >
      <span className="font-mono text-xs font-semibold text-orange-700">
        <span className="text-orange-400">{prefix}-</span>
        <span className="text-orange-700">{serial}</span>
      </span>

      {showCopy && (
        <button
          onClick={handleCopy}
          className="ml-1 text-orange-400 hover:text-orange-600 transition-colors"
          title="Copy Light ID"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </div>
  );
}
