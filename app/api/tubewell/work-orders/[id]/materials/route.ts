import { type NextRequest, NextResponse } from "next/server";
import { addMaterialToWorkOrder, removeMaterialFromWorkOrder } from "@/action/tubewell";
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
    const { materialId, quantity } = await request.json();
    const result = await addMaterialToWorkOrder(workOrderId, materialId, quantity);

    // Revalidate paths to reflect updates instantly
    revalidatePath(`/admindashboard/tubewell/work-orders/${workOrderId}`,"page");
    revalidatePath("/admindashboard/tubewell/work-orders","page");
    revalidateTag("work-orders","max");
    revalidateTag("materials","max");

    return NextResponse.json(result, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add material to work order" },
      { status: 400, headers: corsHeaders }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workOrderId } = await params;
    const { searchParams } = new URL(request.url);
    const orderMaterialId = searchParams.get("orderMaterialId");
    if (!orderMaterialId) throw new Error("Order Material ID is required");
    
    await removeMaterialFromWorkOrder(orderMaterialId);

    // Revalidate paths to reflect updates instantly
    revalidatePath(`/admindashboard/tubewell/work-orders/${workOrderId}`,"page");
    revalidatePath("/admindashboard/tubewell/work-orders","page");
    revalidateTag("work-orders","max");
    revalidateTag("materials","max");

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to remove material from work order" },
      { status: 400, headers: corsHeaders }
    );
  }
}
