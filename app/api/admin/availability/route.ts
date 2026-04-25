import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { currentUser } from "@/lib/auth";
export async function GET() {
  try {
    const availabilities = await db.serviceAvailability.findMany({
      orderBy: [{ date: "asc" }, { serviceType: "asc" }],
    })

    return NextResponse.json(availabilities)
  } catch (error) {
    console.error("Error fetching availabilities:", error)
    return NextResponse.json({ error: "Failed to fetch availabilities" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cuser = await currentUser()
    
        if (!cuser?.id || cuser.role !== "admin") {
          return NextResponse.json(
            { error: "Unauthorized" },
            { status: 403 }
          );
        }
    const { serviceType, date, available, capacity, maintenance, notes } = await request.json()

    // Check if availability already exists for this date and service
    const existing = await db.serviceAvailability.findUnique({
      where: {
        serviceType_date: {
          serviceType,
          date: new Date(date),
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "Availability already exists for this date and service" }, { status: 400 })
    }

    const availability = await db.serviceAvailability.create({
      data: {
        serviceType,
        date: new Date(date),
        available,
        capacity,
        maintenance,
        notes,
        // You might want to add createdBy from session
      },
    })

    // Log the action
    await db.auditLog.create({
      data: {
        action: "CREATE_AVAILABILITY",
        entityId: availability.id,
        entityType: "ServiceAvailability",
        details: `Created availability for ${serviceType} on ${date}`,
        userId: cuser.id, // Replace with actual user ID from session
      },
    })

    return NextResponse.json(availability)
  } catch (error) {
    console.error("Error creating availability:", error)
    return NextResponse.json({ error: "Failed to create availability" }, { status: 500 })
  }
}
