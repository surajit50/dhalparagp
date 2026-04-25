import { type NextRequest, NextResponse } from "next/server";
import { updateRepairRequestStatus } from "@/action/tubewell";
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { status } = await request.json();
    const updated = await updateRepairRequestStatus(id, status);

    // Revalidate paths to reflect updates instantly
    revalidatePath("/admindashboard/tubewell/requests","page");
    revalidateTag("repair-requests","max");

    return NextResponse.json(updated, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update status" },
      { status: 400, headers: corsHeaders }
    );
  }
}
