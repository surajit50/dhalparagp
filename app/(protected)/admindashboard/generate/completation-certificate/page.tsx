import { db } from "@/lib/db";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { FinancialYearFilter } from "@/components/FinancialYearFilter";
import { getFinancialYearDateRange } from "@/utils/financialYear";

interface CompletionCertificatePageProps {
  searchParams: Promise<{ financialYear?: string; search?: string }>;
}

async function getPaymentDetails(financialYear?: string) {
  let whereClause: any = {
    paymentDetails: { some: {} },
  };

  // Add financial year filter if provided
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
}

export default async function CompletionCertificatePage({
  searchParams,
}: CompletionCertificatePageProps) {
  const { financialYear } = await searchParams;
  const paymentDetails = await getPaymentDetails(financialYear);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Completion Certificates</h1>
        <FinancialYearFilter />
      </div>
      <DataTable data={paymentDetails} columns={columns} />
    </div>
  );
}
