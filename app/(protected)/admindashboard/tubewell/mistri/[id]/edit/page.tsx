import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { EditMistriForm } from "./edit-mistri-form";

interface EditMistriPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditMistriPage({ params }: EditMistriPageProps) {
    const { id } = await params;
    
    const mistri = await db.mistri.findUnique({
        where: { id }
    });

    if (!mistri) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-muted/40 p-4 md:p-10">
            <EditMistriForm mistri={mistri} />
        </div>
    );
}
