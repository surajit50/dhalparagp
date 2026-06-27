import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { FileText, ChevronRight, IndianRupee } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12 sm:px-12 rounded-b-[40px] shadow-2xl">
        <div className="absolute -top-32 -right-32 h-96 w-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 container mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-blue-400">Payment Certificates</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-500/20 ring-1 ring-blue-500/40 text-blue-400">
                  <IndianRupee className="h-7 w-7" />
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Payment Certificates
                </h1>
              </div>
              <p className="text-lg text-slate-400 leading-relaxed">
                Generate and manage payment certificates for completed works.
                Filter by financial year or a custom date range.
              </p>
            </div>

            <div className="flex flex-col items-end gap-4">
              <Badge
                variant="secondary"
                className="text-base px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-2xl"
              >
                <FileText className="w-4 h-4 mr-2" />
                {paymentdetails.length} Record{paymentdetails.length !== 1 ? "s" : ""}
              </Badge>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-xl flex items-center gap-3">
                <FinancialYearFilter />
                <DateRangeFilter />
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
              <IndianRupee className="w-5 h-5 text-blue-500" />
              Payment Certificate Records
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <DataTable columns={columns} data={paymentdetails} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
