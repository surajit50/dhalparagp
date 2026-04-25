import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

// GET /api/meetings - Get all meetings with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const financialYear = searchParams.get("financialYear");
    const month = searchParams.get("month");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};
    
    if (type) filter.meetingType = type;
    if (status) filter.status = status;
    if (financialYear) filter.financialYear = financialYear;
    if (month) filter.month = month;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } },
        { agenda: { $regex: search, $options: "i" } },
      ];
    }

    // Get meetings with pagination
    const meetings = await db.meeting.findMany({
      where: filter,
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attendees: true,
        resolutions: true,
        minutes: true,
        documents: true,
      },
      orderBy: {
        meetingDate: "desc",
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await db.meeting.count({ where: filter });

    return NextResponse.json({
      meetings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/meetings - Create new meeting
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      meetingType,
      upasamitySubtype,
      meetingDate,
      startTime,
      endTime,
      venue,
      agenda,
      description,
      financialYear,
      month,
      attendees,
      resolutions,
    } = body;

    // Validate required fields
    if (!title || !meetingType || (meetingType === "UPASAMITY" && !upasamitySubtype) || !meetingDate || !startTime || !endTime || !venue || !agenda) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

      if(!session.user.id){
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

    // Create meeting
    const meeting = await db.meeting.create({
      data: {
        title,
        meetingType,
        upasamitySubtype: meetingType === "UPASAMITY" ? upasamitySubtype : undefined,
        meetingDate: new Date(meetingDate),
        startTime,
        endTime,
        venue,
        agenda,
        description,
        financialYear,
        month,
        createdBy: session.user.id,
        attendees: {
          create: attendees?.map((attendee: any) => ({
            name: attendee.name,
            designation: attendee.designation,
            village: attendee.village,
            phone: attendee.phone,
            email: attendee.email,
          })) || [],
        },
        resolutions: {
          create: resolutions?.map((resolution: any) => ({
            resolutionNumber: resolution.resolutionNumber,
            subject: resolution.subject,
            description: resolution.description,
            decision: resolution.decision,
            budgetAmount: resolution.budgetAmount ? parseFloat(resolution.budgetAmount) : null,
            implementationTimeline: resolution.implementationTimeline,
            responsiblePerson: resolution.responsiblePerson,
          })) || [],
        },
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attendees: true,
        resolutions: true,
      },
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 