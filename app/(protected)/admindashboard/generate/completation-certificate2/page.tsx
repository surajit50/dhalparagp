import { db } from "@/lib/db";
import { WorkList } from "./WorkList";
import { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { FinancialYearFilter } from "@/components/FinancialYearFilter";
import { getFinancialYearDateRange } from "@/utils/financialYear";

// Add metadata for better SEO and page information
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
  } catch (error) {
    console.error("Failed to fetch payment details:", error);
    throw new Error("Failed to load work details. Please try again later.");
  }
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-lg font-medium">Loading works...</span>
      </div>
    </div>
  );
}

export default async function CompletionCertificatePage({
  searchParams,
}: CompletionCertificatePageProps) {
  const resolved = await searchParams;
  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">
            Generate Completion Certificates
          </h1>
          <p className="text-muted-foreground">
            Select works and generate completion certificates for finished
            projects
          </p>
        </div>
        <FinancialYearFilter />
      </div>

      <WorkListWrapper searchParams={Promise.resolve(resolved)} />
    </div>
  );
}

// Separate async component to handle data fetching
async function WorkListWrapper({
  searchParams,
}: {
  searchParams: Promise<{ financialYear?: string; search?: string }>;
}) {
  const { financialYear } = await searchParams;
  const paymentDetails = await getPaymentDetails(financialYear);
  return <WorkList works={paymentDetails} />;
}
