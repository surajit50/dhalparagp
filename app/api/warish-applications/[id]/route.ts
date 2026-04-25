import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { WarishApplicationProps } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Invalid application ID" },
        { status: 400 }
      );
    }

    // Fetch the warish application with details
    const application = (await db.warishApplication.findUnique({
      where: { id },
      include: {
        warishDetails: true,
      },
    })) as WarishApplicationProps | null;

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Error fetching warish application:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch application data",
      },
      { status: 500 }
    );
  }
}
