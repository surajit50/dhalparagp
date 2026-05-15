import { db } from "@/lib/db";
import { WorkList } from "./WorkList";
import { Metadata } from "next";
import { Suspense, cache } from "react";
import {
  Loader2,
  FileText,
  ChevronRight,
} from "lucide-react";
import { FinancialYearFilter } from "@/components/FinancialYearFilter";
import { getFinancialYearDateRange } from "@/utils/financialYear";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Workorderdetails } from "@/types/tender-manage";
import { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Generate Work Order Certificates",
  description: "Generate work order certificates for completed works",
};

interface WorkOrderCertificatePageProps {
  searchParams: Promise<{ financialYear?: string; search?: string }>;
}

/* ========================= DATA FETCH ========================= */

const getWorkOrderDetails = cache(
  async (financialYear?: string): Promise<Workorderdetails[]> => {
    try {
      const whereClause: Prisma.workorderdetailsWhereInput = {};

      if (financialYear) {
        const { financialYearStart, financialYearEnd } =
          getFinancialYearDateRange(financialYear);

        whereClause.awardofcontractdetails = {
          workordeermemodate: {
            gte: financialYearStart,
            lte: financialYearEnd,
          },
        };
      }

      const works = await db.workorderdetails.findMany({
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

        orderBy: {
          awardofcontractdetails: {
            workordeermemodate: "desc",
          },
        },
      });

      return works;
    } catch (error) {
      console.error("WorkOrder Fetch Error:", error);
      throw new Error("Failed to load work order details.");
    }
  }
);

/* ========================= LOADING ========================= */

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4 bg-white dark:bg-slate-900 px-8 py-10 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          Loading Work Orders...
        </p>
      </div>
    </div>
  );
}

/* ========================= PAGE ========================= */

export default async function WorkOrderCertificatePage({
  searchParams,
}: WorkOrderCertificatePageProps) {
  const resolved = await searchParams;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-14 sm:px-12 rounded-b-[40px] shadow-2xl">

        <div className="absolute -top-32 -right-32 h-96 w-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 container mx-auto space-y-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-emerald-400">
              Bulk Work Order Certificates
            </span>
          </div>

          {/* Header Content */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">

            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500/20 ring-1 ring-emerald-500/40 text-emerald-400">
                  <FileText className="h-7 w-7" />
                </div>

                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Bulk Work Order Generation
                </h1>
              </div>

              <p className="text-lg text-slate-400 leading-relaxed">
                Generate multiple work order certificates efficiently.
                Filter by financial year and manage contracts seamlessly.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10 shadow-xl">
              <FinancialYearFilter />
            </div>

          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-4 sm:px-8 py-10 space-y-8">

        <Suspense fallback={<LoadingState />}>
          <ErrorBoundary
            fallback={
              <div className="text-center text-red-500 font-medium">
                Failed to load work details.
              </div>
            }
          >
            <WorkListWrapper searchParams={resolved} />
          </ErrorBoundary>
        </Suspense>

      </div>
    </div>
  );
}

/* ========================= WRAPPER ========================= */

async function WorkListWrapper({
  searchParams,
}: {
  searchParams: { financialYear?: string; search?: string };
}) {
  try {
    const { financialYear } = searchParams;

    const workOrderDetails = await getWorkOrderDetails(financialYear);

    return <WorkList works={workOrderDetails} />;
  } catch {
    return (
      <div className="text-center text-red-500 py-20">
        Failed to load work details.
      </div>
    );
  }
}
