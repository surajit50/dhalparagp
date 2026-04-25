import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

// GET /api/meetings/[id]/minutes - Get meeting minutes
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
    const minutes = await db.meetingMinutes.findUnique({
      where: { meetingId: id },
    });

    if (!minutes) {
      return NextResponse.json({ error: "Minutes not found" }, { status: 404 });
    }

    return NextResponse.json(minutes);
  } catch (error) {
    console.error("Error fetching minutes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/meetings/[id]/minutes - Create meeting minutes
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
      keyDiscussions,
      decisions,
      actionItems,
      nextMeetingDate,
      nextMeetingAgenda,
      attendanceSummary,
      specialObservations,
    } = body;

    // Check if meeting exists
    const { id } = await params;
    const meeting = await db.meeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Check if minutes already exist
    const existingMinutes = await db.meetingMinutes.findUnique({
      where: { meetingId: id },
    });

    if (existingMinutes) {
      return NextResponse.json(
        { error: "Minutes already exist for this meeting" },
        { status: 400 }
      );
    }

    // Create minutes
    const minutes = await db.meetingMinutes.create({
      data: {
        meetingId: id,
        keyDiscussions,
        decisions,
        actionItems,
        nextMeetingDate: nextMeetingDate ? new Date(nextMeetingDate) : null,
        nextMeetingAgenda,
        attendanceSummary,
        specialObservations,
      },
    });

    return NextResponse.json(minutes, { status: 201 });
  } catch (error) {
    console.error("Error creating minutes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/meetings/[id]/minutes - Update meeting minutes
export async function PUT(
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
      keyDiscussions,
      decisions,
      actionItems,
      nextMeetingDate,
      nextMeetingAgenda,
      attendanceSummary,
      specialObservations,
    } = body;

    // Check if minutes exist
    const { id } = await params;
    const existingMinutes = await db.meetingMinutes.findUnique({
      where: { meetingId: id },
    });

    if (!existingMinutes) {
      return NextResponse.json({ error: "Minutes not found" }, { status: 404 });
    }

    // Update minutes
    const minutes = await db.meetingMinutes.update({
      where: { meetingId: id },
      data: {
        keyDiscussions,
        decisions,
        actionItems,
        nextMeetingDate: nextMeetingDate ? new Date(nextMeetingDate) : null,
        nextMeetingAgenda,
        attendanceSummary,
        specialObservations,
      },
    });

    return NextResponse.json(minutes);
  } catch (error) {
    console.error("Error updating minutes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 