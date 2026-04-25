import { type NextRequest, NextResponse } from "next/server";
import { createTubewellMaterial, getTubewellMaterials } from "@/action/tubewell";
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
    const materials = await getTubewellMaterials();
    return NextResponse.json(materials, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch materials" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const material = await createTubewellMaterial(body);

    // Revalidate paths to reflect updates instantly
    revalidatePath("/admindashboard/tubewell/materials","page");
    revalidateTag("materials","max");

    return NextResponse.json(material, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create material" },
      { status: 400, headers: corsHeaders }
    );
  }
}
