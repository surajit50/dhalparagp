import { DataTable } from "@/components/data-table";
import React, { Suspense } from "react";
import { warishapplicationColref } from "./columns";
import { db } from "@/lib/db";
import PrintRegisterButton from "./PrintRegisterButton";

const page = async () => {
  const application = await db.warishApplication.findMany({
    orderBy: { acknowlegment: "desc" },
    include: { WarishDocument: true },
  });
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5 print:hidden">
        <h1 className="text-2xl font-bold">Warish Application Details</h1>
        <PrintRegisterButton applications={application} />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="print:hidden">
          <DataTable data={application} columns={warishapplicationColref} />
        </div>
      </Suspense>
    </div>
  );
};

export default page;
