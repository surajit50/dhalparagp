import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { BookingStatus, ServiceType } from "@prisma/client"

const MAX_DAILY_CAPACITY = 3

// Type for JSON validation (matching your React Native form)
interface BookingRequestData {
  serviceType: "WATER_TANKER" | "DUSTBIN_VAN"
  name: string
  address: string
  phone: string
  bookingDate: string
  amount: number
  userId: string
  employeeId?: string
  notes?: string
}

// Validation helper for JSON data
function validateJsonData(data: any): BookingRequestData | null {
  const { serviceType, name, address, phone, bookingDate, amount, userId, employeeId, notes } = data

  // Check required fields
  if (!serviceType || !name || !address || !phone || !bookingDate || !amount || !userId) {
    return null
  }

  // Validate service type enum
  if (!["WATER_TANKER", "DUSTBIN_VAN"].includes(serviceType)) {
    return null
  }

  // Validate phone format (basic)
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  if (!phoneRegex.test(phone.replace(/[\s\-()]/g, ""))) {
    return null
  }

  // Validate amount is positive number
  if (typeof amount !== "number" || amount <= 0) {
    return null
  }

  // Validate name length
  if (name.length < 2 || name.length > 100) {
    return null
  }

  // Validate address length
  if (address.length < 10 || address.length > 500) {
    return null
  }

  return {
    serviceType,
    name: name.trim(),
    address: address.trim(),
    phone: phone.replace(/[\s\-()]/g, ""),
    bookingDate,
    amount,
    userId,
    employeeId,
    notes: notes?.trim() || null,
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse JSON data instead of FormData
    const requestData = await request.json()
    const validatedData = validateJsonData(requestData)

    if (!validatedData) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid form data provided. Please check all fields and try again.",
        },
        { status: 400 },
      )
    }

    // Date validation with better error messages
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const bookingDateObj = new Date(validatedData.bookingDate)

    if (isNaN(bookingDateObj.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid date format. Please select a valid date.",
        },
        { status: 400 },
      )
    }

    bookingDateObj.setHours(0, 0, 0, 0)

    if (bookingDateObj < today) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot book for past dates. Please select a future date.",
        },
        { status: 400 },
      )
    }

    // Check if booking is too far in advance (optional business rule)
    const maxAdvanceDays = 90
    const maxDate = new Date(today)
    maxDate.setDate(today.getDate() + maxAdvanceDays)

    if (bookingDateObj > maxDate) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot book more than ${maxAdvanceDays} days in advance. Please select an earlier date.`,
        },
        { status: 400 },
      )
    }

    // Verify user exists
    const userExists = await db.user.findUnique({
      where: { id: validatedData.userId },
      select: { id: true, name: true },
    })

    if (!userExists) {
      return NextResponse.json(
        {
          success: false,
          message: "User account not found. Please log in again.",
        },
        { status: 404 },
      )
    }

    // Verify employee exists if provided
    if (validatedData.employeeId) {
      const employeeExists = await db.user.findUnique({
        where: { id: validatedData.employeeId },
        select: { id: true },
      })

      if (!employeeExists) {
        return NextResponse.json(
          {
            success: false,
            message: "Assigned employee not found.",
          },
          { status: 404 },
        )
      }
    }

   
  

    // Check/create service availability
    const availability = await db.serviceAvailability.upsert({
      where: {
        serviceType_date: {
          serviceType: validatedData.serviceType as ServiceType,
          date: bookingDateObj,
        },
      },
      create: {
        serviceType: validatedData.serviceType as ServiceType,
        date: bookingDateObj,
        capacity: MAX_DAILY_CAPACITY,
        booked: 0,
      },
      update: {},
    })

    if (availability.booked >= availability.capacity) {
      return NextResponse.json(
        {
          success: false,
          message: `No available slots for ${validatedData.serviceType === "WATER_TANKER" ? "water tanker" : "dustbin van"} service on this date. Please choose another date.`,
          availableSlots: 0,
          totalCapacity: availability.capacity,
        },
        { status: 409 },
      )
    }

    // Create booking with transaction
    const [booking] = await db.$transaction([
      db.booking.create({
        data: {
          serviceType: validatedData.serviceType as ServiceType,
          name: validatedData.name,
          address: validatedData.address,
          phone: validatedData.phone,
          bookingDate: bookingDateObj,
          amount: validatedData.amount,
          userId: validatedData.userId,
          status: "PENDING" as BookingStatus,
          employeeId: validatedData.employeeId || null,
          isPaid: false,
          isDeposited: false,
          notes: validatedData.notes,
        },
      }),
      db.serviceAvailability.update({
        where: { id: availability.id },
        data: { booked: { increment: 1 } },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: `Your ${validatedData.serviceType === "WATER_TANKER" ? "water tanker" : "dustbin van"} booking has been confirmed!`,
      booking: {
        id: booking.id,
        serviceType: booking.serviceType,
        bookingDate: bookingDateObj.toISOString(),
        amount: booking.amount,
        status: booking.status,
      },
      availableSlots: availability.capacity - availability.booked - 1,
    })
  } catch (error) {
    console.error("Booking creation error:", error)

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          {
            success: false,
            message: "A booking with these details already exists.",
          },
          { status: 409 },
        )
      }

      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid user or employee reference.",
          },
          { status: 400 },
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create booking. Please try again later.",
      },
      { status: 500 },
    )
  }
}

// GET endpoint to check availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceType = searchParams.get("serviceType")
    const date = searchParams.get("date")

    if (!serviceType || !date) {
      return NextResponse.json(
        {
          success: false,
          message: "Service type and date are required",
        },
        { status: 400 },
      )
    }

    // Validate service type
    if (!["WATER_TANKER", "DUSTBIN_VAN"].includes(serviceType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid service type",
        },
        { status: 400 },
      )
    }

    const bookingDate = new Date(date)
    if (isNaN(bookingDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid date format",
        },
        { status: 400 },
      )
    }

    bookingDate.setHours(0, 0, 0, 0)

    const availability = await db.serviceAvailability.findUnique({
      where: {
        serviceType_date: {
          serviceType: serviceType as ServiceType,
          date: bookingDate,
        },
      },
    })

    const availableSlots = availability ? availability.capacity - availability.booked : MAX_DAILY_CAPACITY

    return NextResponse.json({
      success: true,
      availableSlots,
      totalCapacity: MAX_DAILY_CAPACITY,
      isAvailable: availableSlots > 0,
      serviceType,
      date: bookingDate.toISOString(),
    })
  } catch (error) {
    console.error("Availability check error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check availability",
      },
      { status: 500 },
    )
  }
}

// PUT endpoint to update booking status (for admin/employee use)
export async function PUT(request: NextRequest) {
  try {
    const { bookingId, status, notes } = await request.json()

    if (!bookingId || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID and status are required",
        },
        { status: 400 },
      )
    }

    // Validate status
    const validStatuses = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status",
        },
        { status: 400 },
      )
    }

    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: status as BookingStatus,
        notes: notes || undefined,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Booking status updated successfully",
      booking: updatedBooking,
    })
  } catch (error) {
    console.error("Booking update error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update booking",
      },
      { status: 500 },
    )
  }
}
