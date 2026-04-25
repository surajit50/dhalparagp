import { type NextRequest, NextResponse } from "next/server";
import { updateWorkOrderStatus } from "@/action/tubewell";
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

async function handleComplete(
  request: NextRequest,
  id: string
) {
  try {
    const body = await request.json();
    const { masterRollData } = body;

    const updated = await updateWorkOrderStatus(id, "COMPLETED", masterRollData);

    // Revalidate paths to reflect updates instantly
    revalidatePath("/admindashboard/tubewell/work-orders","page");
    revalidatePath(`/admindashboard/tubewell/work-orders/${id}`,"page");
    revalidateTag("work-orders","max");

    return NextResponse.json(updated, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to complete work order" },
      { status: 400, headers: corsHeaders }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleComplete(request, id);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleComplete(request, id);
}
