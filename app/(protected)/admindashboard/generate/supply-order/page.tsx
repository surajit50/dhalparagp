import { db } from "@/lib/db";
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { FinancialYearFilter } from "@/components/FinancialYearFilter";
import { getFinancialYearDateRange } from "@/utils/financialYear";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronRight, ShoppingCart } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12 sm:px-12 rounded-b-[40px] shadow-2xl">
        <div className="absolute -top-32 -right-32 h-96 w-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 container mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-orange-400">Supply Orders</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-orange-500/20 ring-1 ring-orange-500/40 text-orange-400">
                  <ShoppingCart className="h-7 w-7" />
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Supply Orders
                </h1>
              </div>
              <p className="text-lg text-slate-400 leading-relaxed">
                View and print supply order certificates for procurement works.
                Filter by financial year to find the relevant records.
              </p>
            </div>

            <div className="flex flex-col items-end gap-4">
              <Badge
                variant="secondary"
                className="text-base px-4 py-2 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-2xl"
              >
                <Package className="w-4 h-4 mr-2" />
                {workOrders.length} Order{workOrders.length !== 1 ? "s" : ""}
              </Badge>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-xl">
                <FinancialYearFilter />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-8 py-10">
        <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-5 px-6">
            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-orange-500" />
              Supply Order Records
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable columns={columns} data={workOrders} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplyOrderPage;
