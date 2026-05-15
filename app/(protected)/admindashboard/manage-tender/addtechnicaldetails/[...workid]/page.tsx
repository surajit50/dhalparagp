// app/admindashboard/manage-tender/addtechnicaldetails/[workid]/page.tsx

import Link from "next/link";
import { db } from "@/lib/db";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Users,
  ClipboardCheck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sentforfinanicalbidadd } from "@/action/bookNitNuber";
import { ShowWorkDetails } from "@/components/Work-details";
import { TechnicalDetailsDialog } from "@/components/TechnicalDetailsDialog";
import { SubmitButton } from "@/components/submit-button";
import AddTechnicalDetailsButton from "./AddTechnicalDetailsButton";
import { Badge } from "@/components/ui/badge";

const Page = async ({ params }: { params: Promise<{ workid: string[] }> }) => {
  const { workid: workidArr } = await params;
  const [workid] = workidArr || [];

  const technical = await db.bidagency.findMany({
    where: { worksDetailId: workid },
    include: {
      agencydetails: true,
      technicalEvelution: true,
      WorksDetail: {
        include: {
          nitDetails: true,
        },
      },
    },
  });

  const workDetail = technical[0]?.WorksDetail;

  const qualifiedCount = technical.filter(
    (item) => item.technicalEvelution?.qualify
  ).length;

  const disqualifiedCount = technical.filter(
    (item) =>
      item.technicalEvelution &&
      !item.technicalEvelution?.qualify
  ).length;

  const pendingCount = technical.filter(
    (item) => !item.technicalEvelution
  ).length;

  const allEvaluationsSubmitted = technical.every(
    (item) => item.technicalEvelutiondocumentId !== null
  );

  const showFinancialButtons =
    allEvaluationsSubmitted && qualifiedCount >= 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ================= OFFICIAL HEADER ================= */}
        <Card className="border shadow-sm">
          <CardHeader className="bg-orange-900 text-white py-4 rounded-t-lg">
            <CardTitle className="flex justify-between items-center text-lg font-semibold tracking-wide">
              <span>Technical Evaluation Panel</span>
              <Badge className="bg-white text-orange-900 px-3 py-1">
                Total Bidders: {technical.length}
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* ================= SUMMARY DASHBOARD ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <Card className="border-l-4 border-green-600 shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-gray-600">Qualified</p>
                <p className="text-2xl font-bold text-green-700">
                  {qualifiedCount}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-red-600 shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-gray-600">Disqualified</p>
                <p className="text-2xl font-bold text-red-700">
                  {disqualifiedCount}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-yellow-500 shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingCount}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </CardContent>
          </Card>
        </div>

        {/* ================= WORK DETAILS ================= */}
        <Card className="shadow-sm">
          <CardHeader className="bg-slate-100">
            <CardTitle className="text-sm font-semibold">
              Work Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ShowWorkDetails worksDetailId={workid} />
          </CardContent>
        </Card>

        {/* ================= BIDDER TABLE ================= */}
        <Card className="shadow-sm">
          <CardHeader className="bg-slate-100">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Bidders Evaluation List
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-orange-100">
                  <TableRow>
                    <TableHead className="text-center w-16">
                      Sl
                    </TableHead>
                    <TableHead>Bidder Name</TableHead>
                    <TableHead className="text-center w-40">
                      Status
                    </TableHead>
                    <TableHead className="text-right w-40">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {technical.map((item, index) => {
                    let statusText = "Pending";
                    let statusColor =
                      "bg-gray-100 text-gray-600";

                    if (item.technicalEvelution) {
                      const qualified =
                        item.technicalEvelution.qualify;

                      statusText = qualified
                        ? "Qualified"
                        : "Disqualified";

                      statusColor = qualified
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700";
                    }

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="text-center font-medium">
                          {index + 1}
                        </TableCell>

                        <TableCell>
                          <div className="font-medium">
                            {item.agencydetails.name}
                          </div>

                          {item.agencydetails.agencyType === "FARM" && (
                            <div className="text-xs text-muted-foreground">
                              Proprietor:{" "}
                              {item.agencydetails.proprietorName}
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
                          >
                            {statusText}
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          {item.technicalEvelutiondocumentId ? (
                            <TechnicalDetailsDialog
                              bidderId={item.id}
                              bidderName={item.agencydetails.name}
                              bidderType={
                                item.agencydetails.agencyType
                              }
                              bidderProprietorName={
                                item.agencydetails.proprietorName
                              }
                            />
                          ) : (
                            <AddTechnicalDetailsButton
                              agencyId={item.id}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          {/* ================= FOOTER ================= */}
          <CardFooter className="flex justify-between items-center bg-slate-50 border-t p-4">
            <Button variant="outline" asChild>
              <Link href="/admindashboard/manage-tender/addtechnicaldetails/">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>

            {showFinancialButtons ? (
              <form action={sentforfinanicalbidadd}>
                <input
                  type="hidden"
                  name="workid"
                  value={workDetail?.id}
                />
                <SubmitButton className="bg-green-700 hover:bg-green-800 text-white shadow">
                  <FileCheck2 className="mr-2 h-4 w-4" />
                  Forward to Financial Bid
                </SubmitButton>
              </form>
            ) : allEvaluationsSubmitted ? (
              <div className="text-sm text-yellow-700 bg-yellow-50 px-4 py-2 rounded border border-yellow-200">
                Minimum 3 qualified bidders required.
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Waiting for all evaluations.
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Page;
