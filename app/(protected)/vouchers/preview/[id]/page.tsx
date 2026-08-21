import { getVoucherById } from "@/action/voucher-actions";
import { VoucherPreview } from "@/components/vouchers/VoucherPreview";
import { notFound } from "next/navigation";

export default async function VoucherPreviewPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const result = await getVoucherById(resolvedParams.id);
    
    if (result.error || !result.data) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <VoucherPreview voucher={result.data} />
        </div>
    );
}
