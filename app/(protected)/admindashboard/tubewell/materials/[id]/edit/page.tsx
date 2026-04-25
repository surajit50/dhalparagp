import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { EditMaterialForm } from "./edit-material-form";

interface EditMaterialPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditMaterialPage({ params }: EditMaterialPageProps) {
    const { id } = await params;
    
    const material = await db.tubewellMaterial.findUnique({
        where: { id }
    });

    if (!material) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-muted/40 p-4 md:p-10">
            <EditMaterialForm material={material} />
        </div>
    );
}
