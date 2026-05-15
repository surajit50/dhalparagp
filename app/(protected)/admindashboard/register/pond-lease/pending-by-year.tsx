"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, CalendarClock, History } from "lucide-react";

interface PendingByYearProps {
  leases: any[];
}

export function PendingByYear({ leases }: PendingByYearProps) {
  const currentYear = new Date().getFullYear();

  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  const totalPending = leases.reduce(
    (sum, lease) => sum + (lease.pendingAmount || 0),
    0,
  );

  const currentYearPending = leases
    .filter(
      (lease) =>
        new Date(lease.leaseStartDate).getFullYear() === currentYear &&
        lease.pendingAmount > 0,
    )
    .reduce((sum, lease) => sum + lease.pendingAmount, 0);

  const previousYearPending = leases
    .filter(
      (lease) =>
        new Date(lease.leaseStartDate).getFullYear() < currentYear &&
        lease.pendingAmount > 0,
    )
    .reduce((sum, lease) => sum + lease.pendingAmount, 0);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* TOTAL PENDING */}

      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Total Pending
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-3">
            <IndianRupee className="h-6 w-6 text-red-600" />

            <span className="text-2xl font-bold text-red-600">
              {currency.format(totalPending)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* CURRENT YEAR */}

      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Current Year Pending
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-3">
            <CalendarClock className="h-6 w-6 text-orange-500" />

            <span className="text-2xl font-bold text-orange-600">
              {currency.format(currentYearPending)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground mt-1">
            Financial year {currentYear}
          </p>
        </CardContent>
      </Card>

      {/* PREVIOUS YEAR */}

      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Previous Year Pending
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-orange-600" />

            <span className="text-2xl font-bold text-orange-600">
              {currency.format(previousYearPending)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground mt-1">
            Before {currentYear}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}