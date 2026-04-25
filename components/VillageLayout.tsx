"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface VillageLayoutProps {
  title: string;
  subtitle?: string;
  filters?: ReactNode;
  children: ReactNode;
}

export function VillageLayout({ title, subtitle, filters, children }: VillageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f2f6fb]">
      {/* Top information bar */}
      <div className="w-full bg-[#003366] text-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-xs md:text-sm text-blue-100 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filters row */}
      {filters && (
        <div className="border-b bg-white/80">
          <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {filters}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-4">
        <Card className="border-gray-200 shadow-sm p-4 md:p-6 bg-white">
          {children}
        </Card>
      </div>
    </div>
  );
}

