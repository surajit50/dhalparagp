import { type NextRequest, NextResponse } from "next/server";
import { adjustWorkOrderStock } from "@/action/tubewell";
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workOrderId } = await params;
    const { adjustments } = await request.json();
    await adjustWorkOrderStock(workOrderId, adjustments);

    // Revalidate paths to reflect updates instantly
    revalidatePath(`/admindashboard/tubewell/work-orders/${workOrderId}`);
    revalidatePath("/admindashboard/tubewell/work-orders","page");
    revalidateTag("work-orders","max");
    revalidateTag("materials","max");

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to adjust stock" },
      { status: 400, headers: corsHeaders }
    );
  }
}
