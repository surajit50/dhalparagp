
import { db } from "@/lib/db";
import { PondsClient } from "./ponds-client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

async function getData() {
  const ponds = await db.pond.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      leases: {
        where: { status: "ACTIVE" },
      },
    },
  });

  return ponds;
}

export default async function PondsPage() {
  const ponds = await getData();

  return (
    <div className="min-h-screen bg-muted/20 pb-10">
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumb className="mb-4">
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
              <BreadcrumbPage>Ponds Inventory</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <PondsClient data={ponds} />
      </div>
    </div>
  );
}
