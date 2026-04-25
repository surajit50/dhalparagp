import { type NextRequest, NextResponse } from "next/server";
import { generateBill, getBills } from "@/action/tubewell";
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
    const bills = await getBills();
    return NextResponse.json(bills, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch bills" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { workOrderIds } = await request.json();
    const bill = await generateBill(workOrderIds);

    // Revalidate paths to reflect updates instantly
    revalidatePath("/admindashboard/tubewell/bills","page");
  

    return NextResponse.json(bill, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate bill" },
      { status: 400, headers: corsHeaders }
    );
  }
}
