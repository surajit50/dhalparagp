import { Suspense } from "react";
import { db } from "@/lib/db";
import { Agreement } from "@/types/agreement";
import { FileText } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { FinancialYearFilter } from "@/components/FinancialYearFilter";
import { getFinancialYearDateRange } from "@/utils/financialYear";

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
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-4">
          <FileText className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">
            Agreement Certificates
          </h2>
        </div>
        <FinancialYearFilter />
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <DataTable data={agreements} columns={columns} />
      </Suspense>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center space-x-4 pb-4">
        <div className="h-6 w-6 bg-muted rounded-md animate-pulse" />
        <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
      </div>

      {/* Header skeleton */}
      <div className="flex gap-4 px-6 py-3 bg-muted/50 rounded-t-lg">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-4 flex-1 bg-muted rounded-md animate-pulse"
          />
        ))}
      </div>

      {/* Rows skeleton */}
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 px-6 py-4">
            {[...Array(6)].map((_, j) => (
              <div
                key={j}
                className="h-4 flex-1 bg-muted rounded-md animate-pulse"
              />
            ))}
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-end gap-2 pt-4">
        <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />
        <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />
      </div>
    </div>
  );
}
