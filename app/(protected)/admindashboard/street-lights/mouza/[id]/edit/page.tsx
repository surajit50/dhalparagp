import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MouzaForm } from "@/components/street-lights/MouzaForm";

export default async function EditMouzaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mouza = await db.mouzaMaster.findUnique({ where: { id } });
  if (!mouza) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admindashboard/street-lights/mouza" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Mouza — {mouza.mouzaName}</h1>
          <p className="text-sm text-muted-foreground">Update Mouza master record</p>
        </div>
      </div>
      <MouzaForm
        mouzaId={id}
        existing={mouza}
      />
    </div>
  );
}
