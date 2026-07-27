import { db } from "@/lib/db";

import { getPonds, getPublicPonds } from "./actions";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { differenceInYears } from "date-fns";
import { PondLeaseClient } from "./pond-lease-client";

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

async function getAllPonds() {
  return db.pond.findMany({
    orderBy: { name: "asc" },
    include: {
      publicPayments: true,
    },
  });
}

export default async function PondLeasePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const leases = await getData();
  const ponds = await getPonds();
  const allPonds = await getAllPonds();
  const publicPonds = await getPublicPonds();

  const tab =
    typeof searchParams.tab === "string" ? searchParams.tab : "dashboard";

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-50/80 via-slate-50 to-slate-100/50 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-teal-400/10 blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumb>
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

        <PondLeaseClient
          data={leases}
          ponds={ponds}
          allPonds={allPonds}
          publicPonds={publicPonds}
          initialTab={tab}
          initialSearch={
            typeof searchParams.search === "string" ? searchParams.search : ""
          }
        />
      </div>
    </div>
  );
}
