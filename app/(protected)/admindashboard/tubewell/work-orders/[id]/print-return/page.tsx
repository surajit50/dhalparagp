import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PrintReturnClient } from "./PrintReturnClient";

interface PrintReturnPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrintReturnPage({
  params,
}: PrintReturnPageProps) {
  const { id } = await params;

  const order = await db.tubewellWorkOrder.findUnique({
    where: { id },
    include: {
      mistri: true,
      request: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Fetch returned items for this work order
  const returnedItems = await db.tubewellStockLog.findMany({
    where: {
      referenceId: id,
      transactionType: "IN",
    },
    include: {
      material: true,
    },
  });

  const gpProfile = await db.gPProfile.findFirst();

  return (
    <PrintReturnClient
      order={order}
      gpProfile={gpProfile}
      returnedItems={returnedItems}
    />
  );
}
