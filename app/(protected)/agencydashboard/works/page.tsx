import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getAcceptedNitsForPayment } from "@/lib/agencydata";
import { formatCurrency, formatDate } from "@/utils/utils";

export default async function AssignedWorksPage() {
  const works = await getAcceptedNitsForPayment();

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-600">Assigned Works</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Manage and view your currently active work assignments.</p>
        </div>
      </div>
      <Card className="shadow-lg border-slate-200/60 overflow-hidden bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl rounded-xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500" />
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-xl font-bold text-slate-800">Assigned Works Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-slate-700">NIT Details</TableHead>
                <TableHead className="font-bold text-slate-700">Activity Code</TableHead>
                <TableHead className="font-bold text-slate-700">Work Name</TableHead>
                <TableHead className="font-bold text-slate-700">Estimate (₹)</TableHead>
                <TableHead className="font-bold text-slate-700">Work Status</TableHead>
                <TableHead className="font-bold text-slate-700">Commencement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500 font-medium">
                    No assigned works found.
                  </TableCell>
                </TableRow>
              ) : (
                works.map((work) => (
                  <TableRow key={work.id} className="hover:bg-indigo-50/30 transition-colors border-slate-100 group">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-indigo-700 group-hover:text-indigo-800 transition-colors">
                          {work.nitDetails?.memoNumber}
                        </span>
                        <span className="text-xs font-medium text-slate-400 mt-0.5">
                          {work.nitDetails?.memoDate
                            ? formatDate(work.nitDetails.memoDate)
                            : "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-700">
                      {work.ApprovedActionPlanDetails?.activityCode}
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium max-w-[250px] truncate" title={work.ApprovedActionPlanDetails?.activityDescription}>
                      {work.ApprovedActionPlanDetails?.activityDescription}
                    </TableCell>
                    <TableCell className="font-bold text-slate-800">
                      {formatCurrency(work.finalEstimateAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-200 shadow-sm font-semibold">
                        {work.workStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">
                      {work.workCommencementDate
                        ? formatDate(work.workCommencementDate)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
