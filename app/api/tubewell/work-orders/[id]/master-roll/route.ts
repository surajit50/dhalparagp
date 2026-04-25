import { type NextRequest, NextResponse } from "next/server";
import { addMasterRollEntry, removeMasterRollEntry, getMasterRollEntries } from "@/action/tubewell";
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workOrderId } = await params;
    const entries = await getMasterRollEntries(workOrderId);
    return NextResponse.json(entries, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch master roll entries" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workOrderId } = await params;
    const body = await request.json();

    // If body contains an id, it's an update, otherwise it's a create.
    // The addMasterRollEntry function is assumed to handle this upsert logic.
    const entry = await addMasterRollEntry(workOrderId, body);

    // Use 200 for update and 201 for create
    const status = body.id ? 200 : 201;

    // Revalidate paths to reflect updates instantly
    revalidatePath(`/admindashboard/tubewell/work-orders/${workOrderId}`);
    revalidatePath("/admindashboard/tubewell/work-orders");

    return NextResponse.json(entry, { status, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add or update master roll entry" },
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
    const entryId = searchParams.get("entryId");
    if (!entryId) throw new Error("Entry ID is required");

    await removeMasterRollEntry(entryId, workOrderId);

    // Revalidate paths to reflect updates instantly
    revalidatePath(`/admindashboard/tubewell/work-orders/${workOrderId}`);
    revalidatePath("/admindashboard/tubewell/work-orders");

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to remove master roll entry" },
      { status: 400, headers: corsHeaders }
    );
  }
}
