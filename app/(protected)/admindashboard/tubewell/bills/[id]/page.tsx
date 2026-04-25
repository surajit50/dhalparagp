import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Receipt,
  User,
  Calendar,
  CreditCard,
  Wrench,
  Package,
  FileText,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BillDetailsPageProps {
  params: Promise<{ id: string }>;
}

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "GENERATED":
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Generated
        </Badge>
      );
    case "PAID":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Paid
        </Badge>
      );
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

export default async function BillDetailsPage({
  params,
}: BillDetailsPageProps) {
  const { id } = await params;

  const bill = await db.tubewellBill.findUnique({
    where: { id },
    include: {
      workOrders: {
        include: {
          mistri: true,
          request: true,
          materials: { include: { material: true } },
        },
      },
    },
  });

  if (!bill) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admindashboard/tubewell/bills">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <Receipt className="h-6 w-6 text-primary" />
                Bill Details
              </h1>
              <p className="text-sm text-muted-foreground">
                Bill No: {bill.billNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={bill.status} />
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href={`/admindashboard/tubewell/bills/${bill.id}/print`}>
                <Printer className="h-4 w-4" /> Print MUSTOR
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Materials & Work Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(
                    bill.workOrders
                      .flatMap((wo) => wo.materials)
                      .reduce((acc: any, curr: any) => {
                        const key = curr.materialId || curr.material?.id;
                        if (!acc[key]) {
                          acc[key] = { ...curr };
                        } else {
                          acc[key].quantity += curr.quantity;
                        }
                        return acc;
                      }, {}),
                  ).map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">
                        {m.material.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {m.quantity} {m.material.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{m.rate.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{(m.quantity * m.rate).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={3}>Material Total Cost</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(bill.totalMaterialCost)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-slate-700">
                    Labor Charge (Musti)
                  </span>
                </div>
                <span className="font-bold text-slate-900">
                  {formatCurrency(bill.totalLaborCost)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-center space-y-1">
                <p className="text-xs text-primary font-bold uppercase tracking-widest">
                  Net Payable
                </p>
                <p className="text-3xl font-black text-primary">
                  {formatCurrency(bill.netAmount)}
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Payee (Mistri)
                    </p>
                    <p className="text-sm font-medium">
                      {bill.workOrders[0]?.mistri.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Bill Date
                    </p>
                    <p className="text-sm font-medium">
                      {format(new Date(bill.billDate), "PPP")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Work Order Ref
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {bill.workOrders.map((wo) => (
                        <Link
                          key={wo.id}
                          href={`/admindashboard/tubewell/work-orders`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          #{wo.orderNumber}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                {bill.paymentDate && (
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">
                        Paid Date
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        {format(new Date(bill.paymentDate), "PPP")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
