import { DataTable } from "@/components/data-table";
import React from "react";
import { columns } from "./columns";
import { db } from "@/lib/db";

const Page = async () => {
  const data = await db.aOC.findMany({
    include: {
      WorksDetail: {
        include: {
          ApprovedActionPlanDetails: true,
          nitDetails: true,
        },
      },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Award of Contract (AOC) Records
      </h1>
      <p className="mb-6 text-gray-600">
        Below are the records of awarded contracts for various works.
      </p>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default Page;
