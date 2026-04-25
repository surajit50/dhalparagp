import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Briefcase, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PDFGeneratorComponent from "@/components/PrintTemplet/ScrutnisheetTemplete";
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-none shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary to-primary-dark text-primary-foreground">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-3xl font-bold flex items-center">
                <Briefcase className="w-8 h-8 mr-3" />
                Work List
              </CardTitle>
              <FinancialYearFilter className="text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-700">
                  Something went wrong.
                </p>
                <p className="text-muted-foreground mt-2">{error}</p>
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
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function WorkListContent({ works }: { works: scrutneesheettype[] }) {
  return (
    <>
      {works.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700">No works found.</p>
          <p className="text-muted-foreground mt-2">
            There are currently no works available in the system for the
            selected financial year.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <DataTable data={works} columns={columns} />
        </div>
      )}
    </>
  );
}
