import { db } from "@/lib/db";
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { FinancialYearFilter } from "@/components/FinancialYearFilter";
import { getFinancialYearDateRange } from "@/utils/financialYear";

interface SupplyOrderPageProps {
  searchParams: Promise<{ financialYear?: string; search?: string }>;
}

const SupplyOrderPage = async ({ searchParams }: SupplyOrderPageProps) => {
  const { financialYear } = await searchParams;

  let whereClause: any = {
    Bidagency: {
      WorksDetail: {
        nitDetails: {
          isSupply: true,
        },
      },
    },
  };

  // Add financial year filter if provided
  if (financialYear) {
    const { financialYearStart, financialYearEnd } =
      getFinancialYearDateRange(financialYear);
    whereClause.Bidagency = {
      ...whereClause.Bidagency,
      WorksDetail: {
        ...whereClause.Bidagency.WorksDetail,
        nitDetails: {
          ...whereClause.Bidagency.WorksDetail.nitDetails,
          memoDate: {
            gte: financialYearStart,
            lte: financialYearEnd,
          },
        },
      },
    };
  }

  const workOrders = await db.workorderdetails.findMany({
    where: whereClause,
    include: {
      awardofcontractdetails: true,
      Bidagency: {
        include: {
          agencydetails: true,
          WorksDetail: {
            include: {
              ApprovedActionPlanDetails: true,
              nitDetails: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Supply Orders</h1>
        <FinancialYearFilter />
      </div>
      <DataTable columns={columns} data={workOrders} />
    </div>
  );
};

export default SupplyOrderPage;
