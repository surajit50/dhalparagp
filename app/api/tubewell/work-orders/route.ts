import { type NextRequest, NextResponse } from "next/server";
import { createWorkOrder, getWorkOrders } from "@/action/tubewell";
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

export async function GET() {
  try {
    const orders = await getWorkOrders();
    return NextResponse.json(orders, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch work orders" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const order = await createWorkOrder(body);

    // Revalidate paths to reflect updates instantly
    revalidatePath("/admindashboard/tubewell/work-orders");
    revalidateTag("work-orders","max");
    revalidateTag("materials","max");
    revalidateTag("repair-requests","max");

    return NextResponse.json(order, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create work order" },
      { status: 400, headers: corsHeaders }
    );
  }
}
