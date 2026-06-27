import { db } from "@/lib/db";
import { WorkList } from "./WorkList";
import { Metadata } from "next";
import { Suspense } from "react";
import { Loader2, ChevronRight, FileCheck, ClipboardCheck } from "lucide-react";
import { FinancialYearFilter } from "@/components/FinancialYearFilter";
import { getFinancialYearDateRange } from "@/utils/financialYear";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Generate Completion Certificates",
  description: "Generate completion certificates for completed works",
};

interface CompletionCertificatePageProps {
  searchParams: Promise<{ financialYear?: string; search?: string }>;
}

async function getPaymentDetails(financialYear?: string) {
  try {
    let whereClause: any = {
      paymentDetails: { some: {} },
    };

    if (financialYear) {
      const { financialYearStart, financialYearEnd } =
        getFinancialYearDateRange(financialYear);
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
  } catch (error) {
    console.error("Failed to fetch payment details:", error);
    throw new Error("Failed to load work details. Please try again later.");
  }
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4 bg-white dark:bg-slate-900 px-8 py-10 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          Loading works...
        </p>
      </div>
    </div>
  );
}

export default async function CompletionCertificatePage({
  searchParams,
}: CompletionCertificatePageProps) {
  const resolved = await searchParams;
  const { financialYear } = resolved;
  const paymentDetails = await getPaymentDetails(financialYear);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12 sm:px-12 rounded-b-[40px] shadow-2xl">
        <div className="absolute -top-32 -right-32 h-96 w-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 bg-green-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 container mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-emerald-400">Completion Certificates</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500/20 ring-1 ring-emerald-500/40 text-emerald-400">
                  <ClipboardCheck className="h-7 w-7" />
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Generate Completion Certificates
                </h1>
              </div>
              <p className="text-lg text-slate-400 leading-relaxed">
                Select works and generate completion certificates for finished
                projects. Filter by financial year to locate specific records.
              </p>
            </div>

            <div className="flex flex-col items-end gap-4">
              <Badge
                variant="secondary"
                className="text-base px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-2xl"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                {paymentDetails.length} Work{paymentDetails.length !== 1 ? "s" : ""}
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
              <ClipboardCheck className="w-5 h-5 text-emerald-500" />
              Works with Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Suspense fallback={<LoadingState />}>
              <WorkList works={paymentDetails} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
