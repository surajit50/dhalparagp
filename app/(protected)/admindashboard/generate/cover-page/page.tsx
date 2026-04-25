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
import { FinancialYearFilter } from "@/components/FinancialYearFilter";
import { getFinancialYearDateRange } from "@/utils/financialYear";

interface CoverPageProps {
  searchParams: Promise<{ financialYear?: string; search?: string }>;
}

export default async function Cover({ searchParams }: CoverPageProps) {
  const { financialYear } = await searchParams;

  let whereClause: any = {
    workStatus: "billpaid",
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
    <div className="p-6 bg-background min-h-screen">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Work Details</CardTitle>
            <FinancialYearFilter />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] text-center">Sl no</TableHead>
                  <TableHead className="w-[150px]">Nit No</TableHead>
                  <TableHead className="w-[400px]">Work Name</TableHead>
                  <TableHead className="w-[200px]">
                    Work order Details
                  </TableHead>
                  <TableHead className="w-[250px]">Agency Name</TableHead>
                  <TableHead className="w-[120px] text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getwork.map((item, i) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center font-medium">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      <ShowNitDetails
                        nitdetails={item.nitDetails.memoNumber}
                        memoDate={item.nitDetails.memoDate}
                        workslno={item.workslno}
                      />
                    </TableCell>
                    <TableCell className="whitespace-normal break-words">
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
                    <TableCell className="font-medium">
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
        </CardContent>
      </Card>
    </div>
  );
}
