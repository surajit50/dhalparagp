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
import { getPaymentDetails } from "@/lib/agencydata";
import { formatCurrency, formatDate } from "@/utils/utils";
import { Download } from "lucide-react";

export default async function ReceiptsPage() {
  const data = await getPaymentDetails();
  const receipts = data.filter((p) => p.isVerified);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Receipts</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Payment Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voucher No</TableHead>
                <TableHead>Work Name</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No receipts found.
                  </TableCell>
                </TableRow>
              ) : (
                receipts.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.eGramVoucher}</TableCell>
                    <TableCell>
                      {
                        payment.WorksDetail?.ApprovedActionPlanDetails
                          ?.activityDescription
                      }
                    </TableCell>
                    <TableCell>{formatCurrency(payment.netAmt)}</TableCell>
                    <TableCell>{formatDate(payment.billPaymentDate)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download Receipt
                      </Button>
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
