import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getAcceptedNitsForPayment } from "@/lib/agencydata";
import { formatDate } from "@/utils/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function WorkProgressUpdatePage() {
  const works = await getAcceptedNitsForPayment();

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">Work Progress</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Monitor and update the ongoing progress of assigned works.</p>
        </div>
      </div>
      <Card className="shadow-lg border-slate-200/60 overflow-hidden bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl rounded-xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500" />
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-xl font-bold text-slate-800">Track Progress of Your Works</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-slate-700">Work Name</TableHead>
                <TableHead className="font-bold text-slate-700">AOC Date</TableHead>
                <TableHead className="font-bold text-slate-700">Progress</TableHead>
                <TableHead className="font-bold text-slate-700">Status</TableHead>
                <TableHead className="font-bold text-slate-700 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500 font-medium">
                    No active works found for progress tracking.
                  </TableCell>
                </TableRow>
              ) : (
                works.map((work) => {
                  // Assuming progress can be calculated from work details if needed
                  // For now using a placeholder or 0
                  const progress = 0;
                  return (
                    <TableRow key={work.id} className="hover:bg-blue-50/30 transition-colors border-slate-100 group">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700 max-w-[250px] truncate" title={work.ApprovedActionPlanDetails?.activityDescription}>
                            {
                              work.ApprovedActionPlanDetails
                                ?.activityDescription
                            }
                          </span>
                          <span className="text-xs font-medium text-slate-400 mt-0.5">
                            NIT: <span className="text-indigo-600 font-semibold">{work.nitDetails?.memoNumber}</span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">
                        {work.AwardofContract?.workordeermemodate
                          ? formatDate(work.AwardofContract.workordeermemodate)
                          : "—"}
                      </TableCell>
                      <TableCell className="w-[200px]">
                        <div className="flex flex-col gap-1.5">
                          <Progress value={progress} className="h-2.5 bg-blue-100" indicatorClassName="bg-blue-600" />
                          <span className="text-xs text-right font-bold text-slate-600">
                            {progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 shadow-sm font-semibold">
                          {work.workStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <Button asChild variant="outline" size="sm" className="bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 shadow-sm transition-all">
                          <Link
                            href={`/agencydashboard/works/progress/${work.id}`}
                          >
                            Update Progress
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
