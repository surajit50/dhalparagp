import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PrintWorkOrderClient } from "./PrintWorkOrderClient";

interface PrintWorkOrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrintWorkOrderPage({
  params,
}: PrintWorkOrderPageProps) {
  const { id } = await params;

  const order = await db.tubewellWorkOrder.findUnique({
    where: { id },
    include: {
      mistri: true,
      request: true,
      materials: { include: { material: true } },
      masterRollEntries: true,
    },
  });

  if (!order) {
    notFound();
  }

  const gpProfile = await db.gPProfile.findFirst();
  const allMaterials = await db.tubewellMaterial.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <PrintWorkOrderClient
      order={order}
      gpProfile={gpProfile}
      allMaterials={allMaterials}
    />
  );
}
