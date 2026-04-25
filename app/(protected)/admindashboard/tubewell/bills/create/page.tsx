// app/(protected)/admindashboard/tubewell/bills/create/page.tsx
import { db } from "@/lib/db";
import BillGenerationForm from "./bill-generation-form";
import { notFound } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function GenerateBillPage({ searchParams }: PageProps) {
  const { orderId: initialOrderId } = await searchParams;

  // Fetch all active mistris
  const mistris = await db.mistri.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  // Fetch all work orders that do not yet have a bill (more robust check)
  const completedWorkOrders = await db.tubewellWorkOrder.findMany({
    where: {
      status: "COMPLETED",
      bill: {
        is: null,
      },
    },
    include: {
      mistri: true,
      materials: {
        include: {
          material: true,
        },
      },
      request: true,
      masterRollEntries: true,
    },
    orderBy: {
      completionDate: "desc",
    },
  });

  // Validate that the provided orderId exists and is eligible
  if (initialOrderId) {
    const orderExists = completedWorkOrders.some(
      (wo) => wo.id === initialOrderId,
    );
    if (!orderExists) {
      return notFound();
    }
  }

  return (
    <BillGenerationForm
      mistris={mistris}
      workOrders={completedWorkOrders}
      initialOrderId={initialOrderId}
    />
  );
}
