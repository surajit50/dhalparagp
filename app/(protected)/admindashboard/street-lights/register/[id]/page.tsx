import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { StreetLightDetailCard } from "@/components/street-lights/StreetLightDetailCard";
import { ComplaintTable } from "@/components/street-lights/ComplaintTable";

export default async function StreetLightDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const light = await db.streetLight.findUnique({
    where: { id },
    include: { mouza: true },
  });
  if (!light) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/admindashboard/street-lights/register" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Street Light Details</h1>
          <p className="text-sm text-muted-foreground">{light.lightId}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 shadow-sm bg-card p-6">
        <StreetLightDetailCard
          light={{
            ...light,
            lastInspection: light.lastInspection?.toISOString() ?? null,
          }}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Complaint History</h2>
        <ComplaintTable streetLightId={light.id} />
      </div>
    </div>
  );
}
