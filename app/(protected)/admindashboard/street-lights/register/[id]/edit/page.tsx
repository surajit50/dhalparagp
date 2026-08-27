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
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background to-muted/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div className="flex items-center gap-4">
          <Link
            href={`/admindashboard/street-lights/register/${id}`}
            className="w-10 h-10 bg-card rounded-xl flex items-center justify-center border border-border/40 shadow-sm hover:bg-muted transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Edit Street Light
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              {light.lightId}
            </p>
          </div>
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
