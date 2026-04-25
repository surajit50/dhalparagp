import { type NextRequest, NextResponse } from "next/server";
import { updateTubewellMaterial } from "@/action/tubewell";
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
    const updatedMaterial = await updateTubewellMaterial(id, body);

    // Revalidate paths to reflect updates instantly
    revalidatePath("/admindashboard/tubewell/materials","page");
    revalidateTag("materials","max");

    return NextResponse.json(updatedMaterial, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update material" },
      { status: 400, headers: corsHeaders }
    );
  }
}
