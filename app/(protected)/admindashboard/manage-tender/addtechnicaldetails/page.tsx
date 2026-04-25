import { FileText, AlertCircle, ClipboardList, CalendarDays } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatDateTime } from "@/utils/utils";
import { ShowNitDetails } from "@/components/ShowNitDetails";

const TechnicalEvaluationPage = async () => {
  const nitdetails = await db.nitDetails.findMany({
    include: {
      WorksDetail: {
        where: {
          tenderStatus: "TechnicalEvaluation",
        },
        include: {
          ApprovedActionPlanDetails: true,
        },
      },
    },
    orderBy: {
      memoDate: "desc",
    },
  });

  const totalTenders = nitdetails.reduce(
    (acc, nit) => acc + nit.WorksDetail.length,
    0
  );

  let serial = 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ================= HEADER ================= */}
        <Card className="shadow-sm border">
          <CardHeader className="bg-blue-900 text-white rounded-t-lg py-5">
            <CardTitle className="text-2xl font-semibold text-center tracking-wide">
              Technical Evaluation Dashboard
            </CardTitle>
            <p className="text-center text-sm opacity-80 mt-1">
              Review and manage tenders under Technical Evaluation stage
            </p>
          </CardHeader>
        </Card>

        {/* ================= SUMMARY SECTION ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Card className="border-l-4 border-blue-700 shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-gray-600">
                  Total Active Tenders
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {totalTenders}
                </p>
              </div>
              <ClipboardList className="h-8 w-8 text-blue-700" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-yellow-500 shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-gray-600">
                  Current Stage
                </p>
                <p className="text-lg font-semibold text-yellow-600">
                  Technical Evaluation
                </p>
              </div>
              <CalendarDays className="h-8 w-8 text-yellow-500" />
            </CardContent>
          </Card>

        </div>

        {/* ================= TABLE ================= */}
        <Card className="shadow-sm border bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>

                <TableHeader className="bg-blue-100">
                  <TableRow>
                    <TableHead className="text-center w-[60px] font-semibold">
                      Sl
                    </TableHead>
                    <TableHead className="w-[220px] font-semibold">
                      NIT Details
                    </TableHead>
                    <TableHead className="font-semibold">
                      Work Description
                    </TableHead>
                    <TableHead className="w-[140px] font-semibold">
                      Memo Date
                    </TableHead>
                    <TableHead className="w-[140px] font-semibold">
                      Stage
                    </TableHead>
                    <TableHead className="text-right w-[180px] font-semibold">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {totalTenders > 0 ? (
                    nitdetails.flatMap((nit) =>
                      nit.WorksDetail.map((work) => (
                        <TableRow
                          key={`${nit.id}-${work.id}`}
                          className="hover:bg-slate-50 transition"
                        >
                          <TableCell className="text-center font-medium">
                            {serial++}
                          </TableCell>

                          <TableCell>
                            <ShowNitDetails
                              nitdetails={nit.memoNumber}
                              memoDate={nit.memoDate}
                              workslno={work.workslno}
                            />
                          </TableCell>

                          <TableCell>
                            <div className="text-sm text-gray-800 leading-relaxed">
                              {work.ApprovedActionPlanDetails
                                ?.activityDescription ||
                                "No description available"}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-blue-100 text-blue-800 border-blue-300"
                            >
                              {formatDateTime(nit.memoDate).dateOnly}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Badge className="bg-yellow-500 text-white px-3 py-1">
                              Technical Evaluation
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right">
                            <Link
                              href={`/admindashboard/manage-tender/addtechnicaldetails/${work.id}`}
                            >
                              <Button
                                size="sm"
                                className="bg-blue-700 hover:bg-blue-800 text-white shadow-sm"
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Add Details
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-80 text-center">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <AlertCircle className="h-16 w-16 text-slate-400" />
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                              No Tenders Available
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                              There are currently no tenders in the Technical Evaluation stage.
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>

              </Table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default TechnicalEvaluationPage;
