import { type NextRequest, NextResponse } from "next/server";
import { deleteWorkOrder, updateWorkOrderStatus } from "@/action/tubewell";
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    await deleteWorkOrder(id);

    // Revalidate paths to reflect updates instantly
    revalidatePath("/admindashboard/tubewell/work-orders","page");
    revalidateTag("work-orders","max");

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete work order" },
      { status: 400, headers: corsHeaders }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, masterRollData } = await request.json();
    const updated = await updateWorkOrderStatus(id, status, masterRollData);

    // Revalidate paths to reflect updates instantly
    revalidatePath("/admindashboard/tubewell/work-orders","page");
    revalidateTag("work-orders","max");

    return NextResponse.json(updated, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update work order status" },
      { status: 400, headers: corsHeaders }
    );
  }
}
