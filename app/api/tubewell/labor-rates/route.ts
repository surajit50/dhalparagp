import { type NextRequest, NextResponse } from "next/server";
import { 
    createTubewellLaborRate, 
    getTubewellLaborRates, 
    getActiveTubewellLaborRates 
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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const active = searchParams.get("active") === "true";

        let data;
        if (active) {
            data = await getActiveTubewellLaborRates();
        } else {
            data = await getTubewellLaborRates();
        }

        return NextResponse.json(data, { headers: corsHeaders });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to fetch labor rates" },
            { status: 500, headers: corsHeaders }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Ensure effectiveFrom is a Date object if provided
        if (body.effectiveFrom) {
            body.effectiveFrom = new Date(body.effectiveFrom);
        }

        const rate = await createTubewellLaborRate(body);

        // Revalidate paths to reflect updates instantly
        revalidatePath("/admindashboard/tubewell/labor-rate","page");
        revalidateTag("tubewell-labor-rates","max");
       

        return NextResponse.json(rate, { status: 201, headers: corsHeaders });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to create labor rate" },
            { status: 400, headers: corsHeaders }
        );
    }
}
