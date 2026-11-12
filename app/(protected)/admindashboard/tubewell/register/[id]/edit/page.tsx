import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTubewellById } from "@/action/tubewell";
import { TubewellRegisterForm } from "@/components/tubewells/TubewellRegisterForm";
import type { TubewellRegisterInput } from "@/schema/tubewell";

export const dynamic = "force-dynamic";

interface EditTubewellPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTubewellPage({ params }: EditTubewellPageProps) {
  const { id } = await params;
  const tubewell = await getTubewellById(id);

  if (!tubewell) {
    notFound();
  }

  const defaultValues: Partial<TubewellRegisterInput> = {
    tubewellNo: tubewell.tubewellNo,
    tubewellType: tubewell.tubewellType as TubewellRegisterInput["tubewellType"],
    condition: tubewell.condition as TubewellRegisterInput["condition"],
    mouza: tubewell.mouza,
    mouzaId: tubewell.mouzaId ?? "",
    sansad: tubewell.sansad ?? "",
    ward: tubewell.ward ?? "",
    landmark: tubewell.landmark,
    latitude: tubewell.latitude,
    longitude: tubewell.longitude,
    installYear: tubewell.installYear ?? undefined,
    remarks: tubewell.remarks ?? "",
  };

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admindashboard/tubewell/register">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Edit Tubewell</h1>
            <p className="text-sm text-muted-foreground">
              Update details for{" "}
              <span className="font-mono font-semibold">{tubewell.tubewellNo}</span>
            </p>
          </div>
        </div>

        <TubewellRegisterForm
          mode="edit"
          tubewellId={tubewell.id}
          defaultValues={defaultValues}
          initialImage={
            tubewell.imageUrl
              ? { url: tubewell.imageUrl, publicId: tubewell.imagePublicId ?? "" }
              : null
          }
        />
      </div>
    </div>
  );
}
