import { type NextRequest, NextResponse } from "next/server";
import { submitRepairRequest, getRepairRequests } from "@/action/tubewell";
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
    const requests = await getRepairRequests();
    return NextResponse.json(requests, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch repair requests" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requestData = await submitRepairRequest(body);

    // Revalidate paths to reflect updates instantly
    revalidatePath("/admindashboard/tubewell/requests","page");
    revalidateTag("repair-requests","max");

    return NextResponse.json(requestData, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to submit repair request" },
      { status: 400, headers: corsHeaders }
    );
  }
}
