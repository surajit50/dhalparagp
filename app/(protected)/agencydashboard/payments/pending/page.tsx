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
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500">Pending Payments</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Track invoices and bills awaiting clearing.</p>
        </div>
      </div>
      <Card className="shadow-lg border-slate-200/60 overflow-hidden bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl rounded-xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-xl font-bold text-slate-800">Unpaid Bills</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-slate-700">Voucher No</TableHead>
                <TableHead className="font-bold text-slate-700">Work Name</TableHead>
                <TableHead className="font-bold text-slate-700">Bill Type</TableHead>
                <TableHead className="font-bold text-slate-700">Gross Amount</TableHead>
                <TableHead className="font-bold text-slate-700">Net Amount</TableHead>
                <TableHead className="font-bold text-slate-700">Date</TableHead>
                <TableHead className="font-bold text-slate-700 text-right pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500 font-medium">
                    No pending payments found.
                  </TableCell>
                </TableRow>
              ) : (
                pendingPayments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-amber-50/30 transition-colors border-slate-100 group">
                    <TableCell className="font-semibold text-slate-600">{payment.eGramVoucher}</TableCell>
                    <TableCell className="font-medium text-slate-700 max-w-[250px] truncate" title={payment.WorksDetail?.ApprovedActionPlanDetails?.activityDescription}>
                      {
                        payment.WorksDetail?.ApprovedActionPlanDetails
                          ?.activityDescription
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-slate-600 border-slate-200">{payment.billType}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 font-medium">
                      {formatCurrency(payment.grossBillAmount)}
                    </TableCell>
                    <TableCell className="font-bold text-slate-800 text-lg">{formatCurrency(payment.netAmt)}</TableCell>
                    <TableCell className="text-slate-600 font-medium">
                      {formatDate(payment.eGramVoucherDate)}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 shadow-sm font-semibold">Pending</Badge>
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
