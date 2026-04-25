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

export default async function MeasurementBookPage() {
  const works = await getAcceptedNitsForPayment();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Measurement Book</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Work Measurements (MB)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIT Details</TableHead>
                <TableHead>Work Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Latest MB Date</TableHead>
                <TableHead>MB Records</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No works found for measurement.
                  </TableCell>
                </TableRow>
              ) : (
                works.map((work) => (
                  <TableRow key={work.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-primary">
                          {work.nitDetails?.memoNumber}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {work.nitDetails?.memoDate
                            ? formatDate(work.nitDetails.memoDate)
                            : "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {work.ApprovedActionPlanDetails?.activityDescription}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{work.workStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      {/* Placeholder for latest MB date if available in schema */}
                      —
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {work.tenderStatus} Records
                      </Badge>
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
