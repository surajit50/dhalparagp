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
import { PaymentDetailsDialog } from "@/components/payment/PaymentDetailsDialog";

export default async function PaymentHistoryPage() {
  const data = await getPaymentDetails();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sl No</TableHead>
                <TableHead>NIT Details</TableHead>
                <TableHead>Work Name</TableHead>
                <TableHead>Payment Amount</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((payment, index) => (
                <TableRow key={payment.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-primary">
                        {payment.WorksDetail?.nitDetails?.memoNumber}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {payment.WorksDetail?.nitDetails?.memoDate
                          ? formatDate(payment.WorksDetail.nitDetails.memoDate)
                          : "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {
                      payment.WorksDetail?.ApprovedActionPlanDetails
                        ?.activityDescription
                    }
                  </TableCell>
                  <TableCell>{formatCurrency(payment.netAmt)}</TableCell>
                  <TableCell>{formatDate(payment.billPaymentDate)}</TableCell>
                  <TableCell>
                    <PaymentDetailsDialog payment={payment} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
