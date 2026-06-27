import CoverPagePrint from "@/components/PrintTemplet/CoverPage";
import { ShowWorkOrderDetails } from "@/components/show-work-order-details";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinancialYearFilter } from "@/components/FinancialYearFilter";
import { getFinancialYearDateRange } from "@/utils/financialYear";
import { BookOpen, ChevronRight, FolderOpen, Printer } from "lucide-react";

interface CoverPageProps {
  searchParams: Promise<{ financialYear?: string; search?: string }>;
}

export default async function Cover({ searchParams }: CoverPageProps) {
  const { financialYear } = await searchParams;

  let whereClause: any = {
    workStatus: "billpaid",
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

  const getwork = await db.worksDetail.findMany({
    where: whereClause,
    include: {
      nitDetails: true,
      ApprovedActionPlanDetails: true,
      biddingAgencies: {
        include: {
          agencydetails: true,
          workorderdetails: true,
        },
      },
      AwardofContract: {
        include: {
          workorderdetails: {
            include: {
              Bidagency: {
                include: {
                  AggrementModel: true,
                  agencydetails: true,
                },
              },
            },
          },
        },
      },
      paymentDetails: {
        include: {
          lessIncomeTax: true,
          lessLabourWelfareCess: true,
          lessTdsCgst: true,
          lessTdsSgst: true,
          securityDeposit: true,
        },
      },
      workPhotos: true,
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12 sm:px-12 rounded-b-[40px] shadow-2xl">
        <div className="absolute -top-32 -right-32 h-96 w-96 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 bg-red-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 container mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-rose-400">Cover Page</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-500/20 ring-1 ring-rose-500/40 text-rose-400">
                  <BookOpen className="h-7 w-7" />
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Cover Page
                </h1>
              </div>
              <p className="text-lg text-slate-400 leading-relaxed">
                Print cover pages for bill-paid works. Shows all completed
                works with their NIT, work order, and agency details.
              </p>
            </div>

            <div className="flex flex-col items-end gap-4">
              <Badge
                variant="secondary"
                className="text-base px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-2xl"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                {getwork.length} Work{getwork.length !== 1 ? "s" : ""}
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
              <Printer className="w-5 h-5 text-rose-500" />
              Bill-Paid Work Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {getwork.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto">
                  <FolderOpen className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                  No bill-paid works found.
                </p>
                <p className="text-muted-foreground">
                  Try selecting a different financial year.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="w-[60px] text-center font-semibold">Sl No</TableHead>
                      <TableHead className="w-[160px] font-semibold">NIT No</TableHead>
                      <TableHead className="font-semibold">Work Name</TableHead>
                      <TableHead className="w-[200px] font-semibold">Work Order Details</TableHead>
                      <TableHead className="w-[220px] font-semibold">Agency Name</TableHead>
                      <TableHead className="w-[100px] text-center font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getwork.map((item, i) => (
                      <TableRow
                        key={item.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <TableCell className="text-center font-medium text-slate-600 dark:text-slate-400">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          <ShowNitDetails
                            nitdetails={item.nitDetails.memoNumber}
                            memoDate={item.nitDetails.memoDate}
                            workslno={item.workslno}
                          />
                        </TableCell>
                        <TableCell className="whitespace-normal break-words text-slate-700 dark:text-slate-300">
                          {item.ApprovedActionPlanDetails.activityDescription}
                        </TableCell>
                        <TableCell className="font-medium">
                          <ShowWorkOrderDetails
                            workorderno={
                              item.AwardofContract?.workodermenonumber || "NA"
                            }
                            workorderdate={item.AwardofContract?.workordeermemodate}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                          {item.AwardofContract?.workorderdetails[0]?.Bidagency
                            ?.agencydetails.name || "N/A"}
                        </TableCell>
                        <TableCell className="text-center">
                          <CoverPagePrint workCoverPageType={item} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
