import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { StreetLightForm } from "@/components/street-lights/StreetLightForm";

export default async function EditStreetLightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const light = await db.streetLight.findUnique({ where: { id } });
  if (!light) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/admindashboard/street-lights/register/${id}`} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Street Light</h1>
          <p className="text-sm font-mono text-orange-700">{light.lightId}</p>
        </div>
      </div>
      <StreetLightForm
        lightDbId={id}
        existingLightId={light.lightId}
        defaultValues={{
          mouzaId: light.mouzaId,
          sansad: light.sansad ?? undefined,
          ward: light.ward ?? undefined,
          landmark: light.landmark ?? undefined,
          roadName: light.roadName ?? undefined,
          poleNo: light.poleNo ?? undefined,
          installYear: light.installYear ?? undefined,
          ownership: light.ownership as "GP" | "ELECTRICITY_DEPARTMENT" | "OTHER" | undefined,
          latitude: light.latitude ?? undefined,
          longitude: light.longitude ?? undefined,
          gpsAccuracy: light.gpsAccuracy ?? undefined,
          lightType: light.lightType as "LED" | "SODIUM" | "CFL" | "HALOGEN" | "OTHER" | undefined,
          wattage: light.wattage ?? undefined,
          poleType: light.poleType as "ELECTRIC_POLE" | "RCC" | "MS" | "WOODEN" | "OTHER" | undefined,
          lightCondition: light.lightCondition as "GOOD" | "REPAIR_REQUIRED" | "DEFECTIVE" | "MISSING",
          workingStatus: light.workingStatus as "WORKING" | "NOT_WORKING",
          lastInspection: light.lastInspection?.toISOString().split("T")[0] ?? undefined,
          remarks: light.remarks ?? undefined,
          lightImageUrl: light.lightImageUrl ?? undefined,
          lightImagePublicId: light.lightImagePublicId ?? undefined,
          poleImageUrl: light.poleImageUrl ?? undefined,
          poleImagePublicId: light.poleImagePublicId ?? undefined,
        }}
      />
    </div>
  );
}
