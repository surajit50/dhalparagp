import { type NextRequest, NextResponse } from "next/server";
import { 
    updateTubewellLaborRate, 
    deleteTubewellLaborRate 
} from "@/action/tubewell-labor-rate";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

const corsHeaders = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token, X-Requested-With",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Ensure effectiveFrom is a Date object if provided
        if (body.effectiveFrom) {
            body.effectiveFrom = new Date(body.effectiveFrom);
        }

        const updated = await updateTubewellLaborRate(id, body);

        // Revalidate paths to reflect updates instantly
        revalidatePath("/admindashboard/tubewell/labor-rate");
        revalidateTag("tubewell-labor-rates","max");

        return NextResponse.json(updated, { headers: corsHeaders });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to update labor rate" },
            { status: 400, headers: corsHeaders }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const deleted = await deleteTubewellLaborRate(id);

        // Revalidate paths to reflect updates instantly
        revalidatePath("/admindashboard/tubewell/labor-rate");
        revalidateTag("tubewell-labor-rates","max");

        return NextResponse.json(deleted, { headers: corsHeaders });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to delete labor rate" },
            { status: 400, headers: corsHeaders }
        );
    }
}
