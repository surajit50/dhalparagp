// app/api/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import {db} from "@/lib/db";
import { ServiceType } from "@prisma/client";

// Maximum slots per day for each service
const MAX_SLOTS = {
  WATER_TANKER: 3,
  DUSTBIN_VAN: 4,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceType = searchParams.get("serviceType") as ServiceType;
    const dateParam = searchParams.get("date");

    // Validate parameters
    if (!serviceType || !dateParam) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (!Object.values(ServiceType).includes(serviceType)) {
      return NextResponse.json(
        { error: "Invalid service type" },
        { status: 400 }
      );
    }

    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Set time to UTC to avoid timezone issues
    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);

    // Count existing bookings for this date and service
    const bookedCount = await db.booking.count({
      where: {
        serviceType,
        bookingDate: {
          gte: startDate,
          lte: endDate,
        },
        // Exclude cancelled bookings
        status: {
          not: "CANCELLED",
        },
      },
    });

    // Calculate available slots
    const maxSlots = MAX_SLOTS[serviceType];
    const availableSlots = Math.max(0, maxSlots - bookedCount);

    return NextResponse.json({
      success: true,
      data: availableSlots,
    });
  } catch (error) {
    console.error("[AVAILABILITY_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
