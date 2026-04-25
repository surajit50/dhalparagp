import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AddStockForm } from "./add-stock-form";

interface AddStockPageProps {
    params: Promise<{ id: string }>;
}

export default async function AddStockPage({ params }: AddStockPageProps) {
    const { id } = await params;
    
    const material = await db.tubewellMaterial.findUnique({
        where: { id }
    });

    if (!material) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-muted/40 p-4 md:p-10">
            <AddStockForm material={material} />
        </div>
    );
}
