import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { EditStockForm } from "./edit-stock-form";

interface EditStockPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditStockPage({ params }: EditStockPageProps) {
  const { id } = await params;
  
  const stock = await db.tubewellStock.findUnique({
    where: { id }
  });

  if (!stock) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-10">
      <EditStockForm stock={stock} />
    </div>
  );
}
