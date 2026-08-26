import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { StreetLightForm } from "@/components/street-lights/StreetLightForm";
import { mapStreetLightToFormInput } from "@/lib/utils/street-light";

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
        defaultValues={mapStreetLightToFormInput(light)}
      />
    </div>
  );
}
