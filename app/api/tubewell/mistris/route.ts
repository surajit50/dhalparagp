import { type NextRequest, NextResponse } from "next/server";
import { createMistri, getMistris } from "@/action/tubewell";
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
    const mistris = await getMistris();
    return NextResponse.json(mistris, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch mistris" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newMistri = await createMistri(body);

    // Revalidate paths to reflect updates instantly
    revalidatePath("/admindashboard/tubewell/mistri","page");
    revalidateTag("mistris","max");

    return NextResponse.json(newMistri, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create mistri" },
      { status: 400, headers: corsHeaders }
    );
  }
}
