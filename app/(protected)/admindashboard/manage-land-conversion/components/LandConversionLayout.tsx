"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface LandConversionLayoutProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function LandConversionLayout({
  title,
  subtitle = "Government of West Bengal",
  description,
  icon: Icon,
  children,
  actions,
}: LandConversionLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <header className="bg-[#1e40af] text-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <Icon className="h-7 w-7" />
          <div>
            <h1 className="text-lg font-semibold">
              Land Conversion Management System
            </h1>
            <p className="text-xs text-blue-100">{subtitle}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white border border-gray-300 shadow-sm overflow-hidden rounded-md">
          <div className="bg-[#e2e8f0] px-4 py-3 border-b flex items-center justify-between">
            <div>
              <h2 className="text-gray-700 font-semibold">{title}</h2>
              {description && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2">{actions}</div>
            )}
          </div>
          <div className="p-4">{children}</div>
        </div>
      </main>
    </div>
  );
}
