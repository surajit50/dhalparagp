import { db } from "@/lib/db";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { FileText } from "lucide-react";
import { FinancialYearFilter } from "@/components/FinancialYearFilter";
import DateRangeFilter from "@/components/DateRangeFilter";
import { getFinancialYearDateRange } from "@/utils/financialYear";

interface PaymentCertificatePageProps {
  searchParams: Promise<{ financialYear?: string; search?: string; from?: string; to?: string }>;
}

async function getPaymentDetails(params: { financialYear?: string; from?: string; to?: string }) {
  let whereClause: any = {
    paymentDetails: { some: {} },
  };

  const { financialYear, from, to } = params;

  // Prefer explicit date range when provided; compare against billPaymentDate
  if (from || to) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    // Ensure valid dates before applying
    if (fromDate || toDate) {
      whereClause.paymentDetails = {
        some: {
          billPaymentDate: {
            ...(fromDate ? { gte: fromDate } : {}),
            ...(toDate ? { lte: toDate } : {}),
          },
        },
      };
    }
  } else if (financialYear) {
    // Fallback to financial year filter (based on NIT memoDate as existing code)
    const { financialYearStart, financialYearEnd } = getFinancialYearDateRange(financialYear);
    whereClause.nitDetails = {
      memoDate: {
        gte: financialYearStart,
        lte: financialYearEnd,
      },
    };
  }

  return await db.worksDetail.findMany({
    where: whereClause,
    include: {
      nitDetails: true,
      biddingAgencies: true,
      paymentDetails: {
        include: {
          lessIncomeTax: true,
          lessLabourWelfareCess: true,
          lessTdsCgst: true,
          lessTdsSgst: true,
          securityDeposit: true,
        },
      },
      ApprovedActionPlanDetails: true,
      AwardofContract: {
        include: {
          workorderdetails: {
            include: {
              Bidagency: {
                include: {
                  agencydetails: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      nitDetails: {
        memoNumber: "asc",
      },
    },
  });
}

export default async function PaymentCertificatePage({
  searchParams,
}: PaymentCertificatePageProps) {
  const { financialYear, from, to } = await searchParams;
  const paymentdetails = await getPaymentDetails({ financialYear, from, to });

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-4xl font-bold text-primary">
          Payment Certificate Management
        </h1>
        <div className="flex items-center gap-3">
          <FinancialYearFilter />
          <DateRangeFilter />
        </div>
      </div>
      <Card className="shadow-lg border-t-4 border-primary">
        <CardHeader className="bg-gradient-to-r from-primary to-primary-dark">
          <CardTitle className="text-2xl font-semibold text-white flex items-center">
            <FileText className="mr-2" />
            Payment Certificates - Filtered by Financial Year
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <DataTable columns={columns} data={paymentdetails} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
