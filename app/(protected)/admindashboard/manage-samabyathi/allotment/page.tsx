"use client";

import AllotmentForm from "@/components/samabathy/AllotmentForm";
import { BanknotesIcon } from "@heroicons/react/24/outline";

export default function AllotmentPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BanknotesIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Manage Allotments</h1>
      </div>
      
      <AllotmentForm />
    </div>
  );
}
