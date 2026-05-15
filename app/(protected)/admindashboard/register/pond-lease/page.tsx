import { db } from "@/lib/db";
import { PondLeaseClient } from "./pond-lease-client";
import { getPonds } from "./actions";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Card, CardContent } from "@/components/ui/card";

import { differenceInYears } from "date-fns";

async function getData() {
  const leases = await db.pondLease.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      pond: true,
      payments: {
        orderBy: { paymentDate: "desc" },
      },
    },
  });

  const formatted = leases.map((lease) => {
    const paidAmount = lease.payments.reduce((sum, p) => sum + p.amountPaid, 0);

    const pendingAmount = lease.totalAmount - paidAmount;

    const today = new Date();

    const status =
      lease.status === "ACTIVE" && lease.leaseEndDate < today
        ? "EXPIRED"
        : lease.status;

    const duration = Math.max(
      1,
      differenceInYears(
        new Date(lease.leaseEndDate),
        new Date(lease.leaseStartDate),
      ),
    );

    return {
      ...lease,
      paidAmount,
      pendingAmount,
      status,
      leasePeriod: String(duration),
    };
  });

  return formatted;
}

export default async function PondLeasePage() {
  const leases = await getData();
  const ponds = await getPonds();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* HEADER */}

        <div className="rounded-xl bg-gradient-to-r from-orange-600 via-orange-600 to-purple-600 p-6 text-white shadow-lg">
          <h1 className="text-2xl font-bold tracking-tight">
            Pond Lease Register
          </h1>

          <p className="text-orange-100 text-sm mt-1">
            Manage pond leases, track payments and monitor lease expiry.
          </p>
        </div>

        {/* BREADCRUMB */}

        <Breadcrumb className="text-sm">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admindashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbLink href="/admindashboard/register">
                Registers
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>Pond Lease</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* MAIN CONTENT */}

        <Card className="shadow-sm border">
          <CardContent className="p-6">
            <PondLeaseClient data={leases} ponds={ponds} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
