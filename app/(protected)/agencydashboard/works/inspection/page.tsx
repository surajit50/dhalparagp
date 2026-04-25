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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Inspection Reports
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Inspection Reports Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Name</TableHead>
                <TableHead>NIT Details</TableHead>
                <TableHead>Inspection Status</TableHead>
                <TableHead>Latest Inspection</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No active works found for inspection reporting.
                  </TableCell>
                </TableRow>
              ) : (
                works.map((work) => (
                  <TableRow key={work.id}>
                    <TableCell className="font-medium">
                      {work.ApprovedActionPlanDetails?.activityDescription}
                    </TableCell>
                    <TableCell>{work.nitDetails?.memoNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Verified</Badge>
                    </TableCell>
                    <TableCell>—</TableCell>
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
