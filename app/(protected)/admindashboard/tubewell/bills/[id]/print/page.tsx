import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PrintBillClient } from "./PrintBillClient";

interface PrintBillPageProps {
    params: Promise<{ id: string }>;
}

export default async function PrintBillPage({ params }: PrintBillPageProps) {
    const { id } = await params;
    
    const bill = await db.tubewellBill.findUnique({
        where: { id },
        include: {
            workOrders: {
                include: {
                    mistri: true,
                    request: true,
                    materials: { include: { material: true } },
                    masterRollEntries: { include: { items: true } }
                }
            }
        }
    });

    if (!bill) {
        notFound();
    }

    const gpProfile = await db.gPProfile.findFirst();

    return <PrintBillClient bill={bill} gpProfile={gpProfile} />;
}
