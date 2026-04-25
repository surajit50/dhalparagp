import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

// GET /api/meetings/[id]/documents - Get meeting documents
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const documents = await db.meetingDocument.findMany({
      where: { meetingId: id },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/meetings/[id]/documents - Upload meeting document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      documentType,
      title,
      fileName,
      fileUrl,
      fileKey,
      fileSize,
    } = body;

    // Check if meeting exists
    const { id } = await params;
    const meeting = await db.meeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Validate required fields
    if (!documentType || !title || !fileName || !fileUrl || !fileKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if(!session.user.id){
return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }
    // Create document
    const document = await db.meetingDocument.create({
      data: {
        meetingId: id,
        documentType,
        title,
        fileName,
        fileUrl,
        fileKey,
        fileSize: fileSize || null,
        uploadedBy: session.user.id
      },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 