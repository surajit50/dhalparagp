import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const value = searchParams.get('value');

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
    console.log("Searching for:", { type, decodedValue });

    // First, let's check if any applications exist
    const allApplications = await db.warishApplication.findMany({
      select: {
        acknowlegment: true,
      },
      take: 5,
    });
    console.log("Sample applications in DB:", allApplications);

    // Try exact match first
    let application = await db.warishApplication.findFirst({
      where: {
        ...(type === "acknowlegment" 
          ? { acknowlegment: decodedValue }
          : { warishRefNo: decodedValue }
        ),
      },
      include: {
        warishDetails: true,
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If exact match fails, try case-insensitive search
    if (!application) {
      application = await db.warishApplication.findFirst({
        where: {
          ...(type === "acknowlegment" 
            ? { acknowlegment: { equals: decodedValue, mode: "insensitive" } }
            : { warishRefNo: { equals: decodedValue, mode: "insensitive" } }
          ),
        },
        include: {
          warishDetails: true,
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }

    console.log("Search result:", application ? "Found" : "Not found");
    if (application) {
      console.log("Found application:", {
        id: application.id,
        acknowlegment: application.acknowlegment,
        status: application.warishApplicationStatus
      });
    }

    if (!application) {
      // Try to find any application with a similar pattern
      const similarApplications = await db.warishApplication.findMany({
        where: {
          acknowlegment: {
            startsWith: "ACK/LH/",
          },
        },
        select: {
          acknowlegment: true,
        },
        take: 5,
      });

      return NextResponse.json(
        { 
          error: `No application found with ${type} number: ${decodedValue}`,
          searchedValue: decodedValue,
          sampleApplications: allApplications,
          similarApplications: similarApplications
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Error searching warish application:", error);
    return NextResponse.json(
      { error: "Failed to search application" },
      { status: 500 }
    );
  }
} 