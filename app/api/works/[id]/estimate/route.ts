import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return new NextResponse("Work ID is required", { status: 400 });
    }

    const body = await req.json();
    const { estimateDocument } = body;

    if (!estimateDocument) {
      return new NextResponse("Estimate document URL is required", { status: 400 });
    }

    // Check if work exists
    const work = await db.worksDetail.findUnique({
      where: { id },
    });

    if (!work) {
      return new NextResponse("Work details not found", { status: 404 });
    }

    // Update the work with the document URL
    const updatedWork = await db.worksDetail.update({
      where: { id },
      data: {
        estimateDocument,
      },
    });

    return NextResponse.json(updatedWork);
  } catch (error: any) {
    console.error("[WORK_ESTIMATE_PATCH]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
