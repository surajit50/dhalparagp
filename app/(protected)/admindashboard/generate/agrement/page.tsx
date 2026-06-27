import { Suspense } from "react";
import { db } from "@/lib/db";
import { Agreement } from "@/types/agreement";
import { FileText, ChevronRight, Handshake } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { FinancialYearFilter } from "@/components/FinancialYearFilter";
import { getFinancialYearDateRange } from "@/utils/financialYear";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AgreementCertificatePageProps {
  searchParams: Promise<{ financialYear?: string; search?: string }>;
}

async function getAgreements(financialYear?: string): Promise<Agreement[]> {
  let whereClause: any = {};

  if (financialYear) {
    const { financialYearStart, financialYearEnd } = getFinancialYearDateRange(financialYear);
    whereClause = {
      acceptagency: {
        WorksDetail: {
          nitDetails: {
            memoDate: {
              gte: financialYearStart,
              lte: financialYearEnd,
            },
          },
        },
      },
    };
  }

  try {
    return await db.aggrementModel.findMany({
      where: whereClause,
      select: {
        id: true,
        aggrementno: true,
        aggrementdate: true,
        workdetails: {
          select: {
            activityDescription: true,
          },
        },
        acceptagency: {
          select: {
            agencydetails: {
              select: {
                name: true,
                contactDetails: true,
              },
            },
            WorksDetail: {
              select: {
                workslno: true,
                nitDetails: {
                  select: {
                    memoNumber: true,
                    memoDate: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch agreements:", error);
    return [];
  }
}

export default async function AgreementCertificateTable({
  searchParams,
}: AgreementCertificatePageProps) {
  const { financialYear } = await searchParams;
  const agreements = await getAgreements(financialYear);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12 sm:px-12 rounded-b-[40px] shadow-2xl">
        <div className="absolute -top-32 -right-32 h-96 w-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 container mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-teal-400">Agreement Certificates</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-teal-500/20 ring-1 ring-teal-500/40 text-teal-400">
                  <Handshake className="h-7 w-7" />
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Agreement Certificates
                </h1>
              </div>
              <p className="text-lg text-slate-400 leading-relaxed">
                View and generate agreement certificates for contracted works.
                Filter by financial year to manage records efficiently.
              </p>
            </div>

            <div className="flex flex-col items-end gap-4">
              <Badge
                variant="secondary"
                className="text-base px-4 py-2 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-2xl"
              >
                <FileText className="w-4 h-4 mr-2" />
                {agreements.length} Agreement{agreements.length !== 1 ? "s" : ""}
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
              <Handshake className="w-5 h-5 text-teal-500" />
              Agreement Records
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Suspense fallback={<TableSkeleton />}>
              <DataTable data={agreements} columns={columns} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="w-full space-y-4 p-6">
      <div className="flex gap-4 py-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 flex-1 bg-muted rounded-md animate-pulse" />
        ))}
      </div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 py-4">
            {[...Array(6)].map((_, j) => (
              <div key={j} className="h-4 flex-1 bg-muted rounded-md animate-pulse" />
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />
        <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />
      </div>
    </div>
  );
}
