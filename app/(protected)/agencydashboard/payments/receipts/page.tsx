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
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">Receipts</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Download and manage verified payment receipts.</p>
        </div>
      </div>
      <Card className="shadow-lg border-slate-200/60 overflow-hidden bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl rounded-xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500" />
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-xl font-bold text-slate-800">Payment Receipts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-slate-700">Voucher No</TableHead>
                <TableHead className="font-bold text-slate-700">Work Name</TableHead>
                <TableHead className="font-bold text-slate-700">Net Amount</TableHead>
                <TableHead className="font-bold text-slate-700">Payment Date</TableHead>
                <TableHead className="font-bold text-slate-700 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500 font-medium">
                    No receipts found.
                  </TableCell>
                </TableRow>
              ) : (
                receipts.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-teal-50/30 transition-colors border-slate-100 group">
                    <TableCell className="font-semibold text-slate-600">{payment.eGramVoucher}</TableCell>
                    <TableCell className="font-medium text-slate-700 max-w-[250px] truncate" title={payment.WorksDetail?.ApprovedActionPlanDetails?.activityDescription}>
                      {
                        payment.WorksDetail?.ApprovedActionPlanDetails
                          ?.activityDescription
                      }
                    </TableCell>
                    <TableCell className="font-bold text-slate-800 text-lg">{formatCurrency(payment.netAmt)}</TableCell>
                    <TableCell className="text-slate-600 font-medium">{formatDate(payment.billPaymentDate)}</TableCell>
                    <TableCell className="text-right pr-4">
                      <Button variant="outline" size="sm" className="gap-2 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 shadow-sm transition-all">
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
