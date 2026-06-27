import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, ChevronRight, ScanSearch, ClipboardList } from "lucide-react";
import { scrutneesheettype } from "@/types/worksdetails";
import { Suspense } from "react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { FinancialYearFilter } from "@/components/FinancialYearFilter";
import { getFinancialYearDateRange } from "@/utils/financialYear";

interface PrintScrutinySheetPageProps {
  searchParams: Promise<{ financialYear?: string; search?: string }>;
}

async function getWorkDetails(
  financialYear?: string
): Promise<scrutneesheettype[]> {
  try {
    let whereClause: any = {};

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

    const workdetails = await db.worksDetail.findMany({
      where: whereClause,
      include: {
        nitDetails: true,
        ApprovedActionPlanDetails: true,
        biddingAgencies: {
          include: {
            agencydetails: true,
            technicalEvelution: {
              include: {
                credencial: true,
                validityofdocument: true,
              },
            },
          },
        },
      },
    });
    return workdetails;
  } catch (error) {
    console.error("Failed to fetch work details:", error);
    throw new Error("Failed to fetch work details. Please try again later.");
  }
}

export default async function WorkList({
  searchParams,
}: PrintScrutinySheetPageProps) {
  const { financialYear } = await searchParams;
  let works: scrutneesheettype[] = [];
  let error = null;

  try {
    works = await getWorkDetails(financialYear);
  } catch (err) {
    error = err instanceof Error ? err.message : "An unknown error occurred.";
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12 sm:px-12 rounded-b-[40px] shadow-2xl">
        <div className="absolute -top-32 -right-32 h-96 w-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 container mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-sky-400">Print Scrutiny Sheet</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-500/20 ring-1 ring-sky-500/40 text-sky-400">
                  <ScanSearch className="h-7 w-7" />
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Print Scrutiny Sheet
                </h1>
              </div>
              <p className="text-lg text-slate-400 leading-relaxed">
                Generate and print technical scrutiny sheets for tender
                evaluation. Filter by financial year to locate specific records.
              </p>
            </div>

            <div className="flex flex-col items-end gap-4">
              <Badge
                variant="secondary"
                className="text-base px-4 py-2 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-2xl"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                {works.length} Work{works.length !== 1 ? "s" : ""}
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
              <ScanSearch className="w-5 h-5 text-sky-500" />
              Scrutiny Sheet Records
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {error ? (
              <div className="text-center py-16 space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30 mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                  Something went wrong.
                </p>
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : (
              <Suspense fallback={<LoadingState />}>
                <WorkListContent works={works} />
              </Suspense>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        <p className="text-sm text-muted-foreground">Loading works...</p>
      </div>
    </div>
  );
}

function WorkListContent({ works }: { works: scrutneesheettype[] }) {
  return (
    <>
      {works.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-50 dark:bg-yellow-950/30 mx-auto">
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">No works found.</p>
          <p className="text-muted-foreground">
            There are currently no works available in the system for the
            selected financial year.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <DataTable data={works} columns={columns} />
        </div>
      )}
    </>
  );
}
