import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { getAcceptedNitsForPayment } from "@/lib/agencydata";
import { formatCurrency, formatDate } from "@/utils/utils";

export default async function AOCDetailsPage() {
  const works = await getAcceptedNitsForPayment();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">AOC Details</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Award of Contract</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order No</TableHead>
                <TableHead>Work Order Date</TableHead>
                <TableHead>NIT Details</TableHead>
                <TableHead>Work Name</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No AOCs found.
                  </TableCell>
                </TableRow>
              ) : (
                works.map((work) => (
                  <TableRow key={work.id}>
                    <TableCell>
                      {work.AwardofContract?.workodermenonumber || "—"}
                    </TableCell>
                    <TableCell>
                      {work.AwardofContract?.workordeermemodate
                        ? formatDate(work.AwardofContract.workordeermemodate)
                        : "—"}
                    </TableCell>
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
                      {work.AwardofContract?.deliveryDate
                        ? formatDate(work.AwardofContract.deliveryDate)
                        : "—"}
                    </TableCell>
                    <TableCell>{work.workStatus}</TableCell>
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
