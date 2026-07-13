"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users } from "lucide-react";
import { formatDate } from "@/utils/utils";
import {
  formatPondAreaAcre,
  formatPondLocationDisplay,
  parsePondAreaDecimal,
} from "@/lib/utils/pond-lease";
import { AddPublicPaymentDialog } from "./add-public-payment-dialog";

interface PublicPondSectionProps {
  publicPonds: any[];
}

export function PublicPondSection({ publicPonds }: PublicPondSectionProps) {
  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  if (publicPonds.length === 0) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="border-b bg-sky-50/50 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-sky-900">
            <Users className="h-5 w-5 text-sky-600" />
            Public Pond Collections
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center text-muted-foreground max-w-md mx-auto">
            <div className="h-16 w-16 bg-sky-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-sky-500 opacity-80" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Public Ponds Found</h3>
            <p className="text-sm">
              No public ponds registered yet. Mark a pond as{" "}
              <strong className="text-foreground">Public Pond (Not for Tender)</strong> in Pond Inventory when
              public also uses the pond and GP collects yearly amount as per
              resolution.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-lg overflow-hidden">
      <CardHeader className="border-b bg-sky-50/50">
        <CardTitle className="text-xl flex items-center gap-2">
          <Users className="h-5 w-5 text-sky-600" />
          Public Pond Collections
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ponds not tendered to private parties — yearly collection from public
          as per GP resolution.
        </p>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Pond</TableHead>
                <TableHead>Resolution</TableHead>
                <TableHead>Yearly Amount</TableHead>
                <TableHead>Collected</TableHead>
                <TableHead>Recent Payments</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publicPonds.map((pond, index) => {
                const yearlyAmount = Number(pond.publicYearlyAmount) || 0;
                const totalCollected = Number(pond.totalCollected) || 0;
                const recentPayments = pond.publicPayments?.slice(0, 2) || [];

                return (
                  <TableRow key={pond.id} className="group hover:bg-muted/40 transition-colors duration-150">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="font-semibold">{pond.name}</div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {formatPondLocationDisplay(pond)}
                      </div>
                      {pond.area && (
                        <div className="text-xs text-blue-700 mt-1">
                          {formatPondAreaAcre(parsePondAreaDecimal(pond.area))}
                        </div>
                      )}
                      <Badge className="mt-2 bg-sky-500/10 text-sky-700 border-sky-200">
                        Public Use
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{pond.resolutionNo || "-"}</div>
                      {pond.resolutionDate && (
                        <div className="text-xs text-muted-foreground">
                          {formatDate(new Date(pond.resolutionDate))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {yearlyAmount > 0 ? currency.format(yearlyAmount) : "-"}
                    </TableCell>
                    <TableCell className="font-medium text-green-700">
                      {currency.format(totalCollected)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {recentPayments.length === 0 ? (
                        <span className="text-muted-foreground">No payments</span>
                      ) : (
                        <div className="space-y-1">
                          {recentPayments.map((payment: any) => (
                            <div key={payment.id} className="text-xs">
                              {formatDate(new Date(payment.paymentDate))} — ₹
                              {Number(payment.amountPaid).toLocaleString("en-IN")}
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <AddPublicPaymentDialog pond={pond} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
