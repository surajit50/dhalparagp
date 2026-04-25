import React from "react";
import { db } from "@/lib/db";

import { DataTable } from "@/components/data-table";
import { warishColumns } from "./warish-up-colf";

const Page = async () => {
  const warishapp = await db.warishApplication.findMany({
    where: {
      warishdocumentverified: false
      
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-2">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
          Pending Upload Warish Warish Document Applications
        </h2>
        <div className="overflow-x-auto rounded-lg">
          <DataTable data={warishapp} columns={warishColumns} />
        </div>
      </div>
    </div>
  );
};

export default Page;
