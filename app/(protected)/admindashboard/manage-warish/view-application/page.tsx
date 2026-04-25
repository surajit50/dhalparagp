import { DataTable } from "@/components/data-table";
import React, { Suspense } from "react";
import { warishapplicationColref } from "./columns";
import { db } from "@/lib/db";

const page = async () => {
  const application = await db.warishApplication.findMany({
    orderBy: { acknowlegment: "desc" },
  });
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Warish Application Details</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <DataTable data={application} columns={warishapplicationColref} />
      </Suspense>
    </div>
  );
};

export default page;
