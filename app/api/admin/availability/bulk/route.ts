import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { startOfDay, addDays } from "date-fns"
import { currentUser } from "@/lib/auth";


export async function POST(request: NextRequest) {
  try {
    
    const cuser = await currentUser()
      
          if (!cuser?.id || cuser.role !== "admin") {
            return NextResponse.json(
              { error: "Unauthorized" },
              { status: 403 }
            );
          }

    const { days = 30 } = await request.json()

    const serviceTypes = ["WATER_TANKER", "DUSTBIN_VAN"]
    const today = startOfDay(new Date())

    const availabilities = []

    for (let i = 0; i < days; i++) {
      const date = addDays(today, i)

      for (const serviceType of serviceTypes) {
        // Check if availability already exists
        const existing = await db.serviceAvailability.findUnique({
          where: {
            serviceType_date: {
              serviceType: serviceType as any,
              date,
            },
          },
        })

        if (!existing) {
          availabilities.push({
            serviceType: serviceType as any,
            date,
            available: true,
            capacity: 3,
            booked: 0,
            maintenance: false,
          })
        }
      }
    }

    if (availabilities.length > 0) {
      await db.serviceAvailability.createMany({
        data: availabilities,
      })

      // Log the action
      await db.auditLog.create({
        data: {
          action: "BULK_CREATE_AVAILABILITY",
          entityId: "bulk",
          entityType: "ServiceAvailability",
          details: `Created ${availabilities.length} availability entries for ${days} days`,
          userId: cuser.id, // Replace with actual user ID from session
        },
      })
    }

    return NextResponse.json({
      created: availabilities.length,
      message: `Created ${availabilities.length} new availability entries`,
    })
  } catch (error) {
    console.error("Error creating bulk availability:", error)
    return NextResponse.json({ error: "Failed to create bulk availability" }, { status: 500 })
  }
}
