import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const application = await db.warishApplication.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        acknowlegment: true,
        applicantName: true,
        nameOfDeceased: true,
        dateOfDeath: true,
        reportingDate: true,
        warishApplicationStatus: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
} 