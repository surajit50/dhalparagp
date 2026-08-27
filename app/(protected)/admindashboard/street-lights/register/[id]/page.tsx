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
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background to-muted/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div className="flex items-center gap-4">
          <Link
            href="/admindashboard/street-lights/register"
            className="w-10 h-10 bg-card rounded-xl flex items-center justify-center border border-border/40 shadow-sm hover:bg-muted transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Street Light Details
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              {light.lightId}
            </p>
          </div>
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
