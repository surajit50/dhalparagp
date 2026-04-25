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
import { getPaymentDetails } from "@/lib/agencydata";
import { formatCurrency, formatDate } from "@/utils/utils";

export default async function PendingPaymentsPage() {
  const data = await getPaymentDetails();
  const pendingPayments = data.filter((p) => !p.isVerified);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pending Payments</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Unpaid Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voucher No</TableHead>
                <TableHead>Work Name</TableHead>
                <TableHead>Bill Type</TableHead>
                <TableHead>Gross Amount</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No pending payments found.
                  </TableCell>
                </TableRow>
              ) : (
                pendingPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.eGramVoucher}</TableCell>
                    <TableCell>
                      {
                        payment.WorksDetail?.ApprovedActionPlanDetails
                          ?.activityDescription
                      }
                    </TableCell>
                    <TableCell>{payment.billType}</TableCell>
                    <TableCell>
                      {formatCurrency(payment.grossBillAmount)}
                    </TableCell>
                    <TableCell>{formatCurrency(payment.netAmt)}</TableCell>
                    <TableCell>
                      {formatDate(payment.eGramVoucherDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Pending</Badge>
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
