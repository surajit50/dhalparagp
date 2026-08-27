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
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">Payment History</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">View all your received payments and receipts.</p>
        </div>
      </div>

      <Card className="shadow-lg border-slate-200/60 overflow-hidden bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl rounded-xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-xl font-bold text-slate-800">Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-slate-700 w-[60px]">Sl No</TableHead>
                <TableHead className="font-bold text-slate-700">NIT Details</TableHead>
                <TableHead className="font-bold text-slate-700">Work Name</TableHead>
                <TableHead className="font-bold text-slate-700">Payment Amount</TableHead>
                <TableHead className="font-bold text-slate-700">Payment Date</TableHead>
                <TableHead className="font-bold text-slate-700 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((payment, index) => (
                <TableRow key={payment.id} className="hover:bg-emerald-50/30 transition-colors border-slate-100 group">
                  <TableCell className="font-semibold text-slate-500">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-emerald-700 group-hover:text-emerald-800 transition-colors">
                        {payment.WorksDetail?.nitDetails?.memoNumber}
                      </span>
                      <span className="text-xs font-medium text-slate-400 mt-0.5">
                        {payment.WorksDetail?.nitDetails?.memoDate
                          ? formatDate(payment.WorksDetail.nitDetails.memoDate)
                          : "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700 max-w-[250px] truncate" title={payment.WorksDetail?.ApprovedActionPlanDetails?.activityDescription}>
                    {
                      payment.WorksDetail?.ApprovedActionPlanDetails
                        ?.activityDescription
                    }
                  </TableCell>
                  <TableCell className="font-bold text-slate-800 text-lg">{formatCurrency(payment.netAmt)}</TableCell>
                  <TableCell className="text-slate-600 font-medium">{formatDate(payment.billPaymentDate)}</TableCell>
                  <TableCell className="text-right pr-4">
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
