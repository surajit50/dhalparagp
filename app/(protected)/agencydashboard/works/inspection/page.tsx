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
import { formatDate } from "@/utils/utils";
import { ClipboardCheck } from "lucide-react";

export default async function SiteInspectionReportsPage() {
  const works = await getAcceptedNitsForPayment();

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
            Inspection Reports
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">View and manage site inspection statuses.</p>
        </div>
      </div>
      <Card className="shadow-lg border-slate-200/60 overflow-hidden bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl rounded-xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            Inspection Reports Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-slate-700">Work Name</TableHead>
                <TableHead className="font-bold text-slate-700">NIT Details</TableHead>
                <TableHead className="font-bold text-slate-700">Inspection Status</TableHead>
                <TableHead className="font-bold text-slate-700">Latest Inspection</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-slate-500 font-medium">
                    No active works found for inspection reporting.
                  </TableCell>
                </TableRow>
              ) : (
                works.map((work) => (
                  <TableRow key={work.id} className="hover:bg-emerald-50/30 transition-colors border-slate-100 group">
                    <TableCell className="font-semibold text-slate-700 max-w-[250px] truncate" title={work.ApprovedActionPlanDetails?.activityDescription}>
                      {work.ApprovedActionPlanDetails?.activityDescription}
                    </TableCell>
                    <TableCell className="font-medium text-emerald-700">{work.nitDetails?.memoNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm font-semibold">Verified</Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 font-medium">—</TableCell>
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
