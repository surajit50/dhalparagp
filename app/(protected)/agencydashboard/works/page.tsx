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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Assigned Works</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Assigned Works Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIT Details</TableHead>
                <TableHead>Activity Code</TableHead>
                <TableHead>Work Name</TableHead>
                <TableHead>Estimate (₹)</TableHead>
                <TableHead>Work Status</TableHead>
                <TableHead>Commencement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No assigned works found.
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
                      {work.ApprovedActionPlanDetails?.activityCode}
                    </TableCell>
                    <TableCell>
                      {work.ApprovedActionPlanDetails?.activityDescription}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(work.finalEstimateAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{work.workStatus}</Badge>
                    </TableCell>
                    <TableCell>
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
