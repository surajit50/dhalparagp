"use client";

import { FileText } from "lucide-react";
import LandConversionApplicationForm from "@/components/form/LandConversionApplicationForm";

export default function LandConversionApplicationPage() {
  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <div className="bg-[#1e40af] text-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <FileText className="h-7 w-7" />
          <div>
            <h1 className="text-lg font-semibold">
              Land Conversion Management System
            </h1>
            <p className="text-xs text-blue-100">Government of West Bengal</p>
          </div>
        </div>
      </div>

      <LandConversionApplicationForm />
    </div>
  );
}
