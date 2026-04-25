import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string; value: string }> }
) {
  try {
    const { type, value } = await params;
    console.log("Received params:", { type, value });

    if (!type || !value) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Validate search type
    if (type !== "acknowlegment" && type !== "certificate") {
      console.log("Invalid search type:", type);
      return NextResponse.json(
        { error: "Invalid search type. Must be either 'acknowlegment' or 'certificate'" },
        { status: 400 }
      );
    }

    // Decode the value and replace encoded forward slashes
    const decodedValue = decodeURIComponent(value).replace(/%2F/g, '/');
    // If exact match fails, try case-insensitive search
 
      const application = await db.warishApplication.findFirst({
        where: {
          ...(type === "acknowlegment" 
            ? { acknowlegment: { equals: decodedValue, mode: "insensitive" } }
            : { warishRefNo: { equals: decodedValue, mode: "insensitive" } }
          ),
        },
        include: {
          warishDetails: true,
          WarishDocument: true,
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
  


   

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.warishdocumentverified) {
      return NextResponse.json({
        success: false,
        message: "Document already uploaded and verified.",
        application,
      });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Error searching warish application:", error);
    return NextResponse.json(
      { error: "Failed to search application" },
      { status: 500 }
    );
  }
} 