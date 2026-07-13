
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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/80 via-slate-50 to-slate-100/50 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full bg-cyan-400/10 blur-[100px]" />
      </div>

      <div className="container mx-auto py-6 space-y-6 relative z-10">
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
              <BreadcrumbPage>Ponds Inventory</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <PondsClient data={ponds} />
      </div>
    </div>
  );
}
