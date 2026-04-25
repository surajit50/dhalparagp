"use server";

import { db } from "@/lib/db";
import {  ServiceType, Booking } from "@prisma/client";
import { currentUser } from "@/lib/auth";

import type {
  BookingStatusUpdateParams,
  BookingActionResponse,
} from "@/types/bookings";
import { revalidatePath } from "next/cache";

// Update the generateReceipt function to use the correct response type
export async function generateReceipt(bookingId: string) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { user: true },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // Prepare receipt data
    const receiptData = {
      receiptNumber: booking.receiptNumber || `RC-${Date.now()}`,
      date: new Date().toISOString(),
      customerName: booking.name,
      serviceType: booking.serviceType,
      amount: booking.amount,
      paymentStatus: booking.isPaid ? "Paid" : "Pending",
      address: booking.address,
    };

    // Update receipt number if not exists
    if (!booking.receiptNumber) {
      await db.booking.update({
        where: { id: bookingId },
        data: { receiptNumber: receiptData.receiptNumber },
      });
    }

    return {
      success: true,
      message: "Receipt generated successfully",
      receipt: {
        receiptNumber: receiptData.receiptNumber,
        date: receiptData.date,
        customerName: receiptData.customerName,
        serviceType: receiptData.serviceType,
        amount: receiptData.amount,
        paymentStatus: receiptData.paymentStatus,
        address: receiptData.address,
      },
    };
  } catch (error) {
    console.error("Receipt generation error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate receipt",
    };
  }
}
export async function updateBookingStatus({
  bookingId,
  status,
  userId,
}: BookingStatusUpdateParams): Promise<BookingActionResponse> {
  try {
    const user = await currentUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }
    if (!user?.id) {
      return { success: false, error: "Authentication required" };
    }
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { user: true },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // Enhanced authorization check
    const isAdmin = user.role === "admin";
    const isOwner = booking.userId === user.id;
    const allowedStatusChanges = {
      admin: ["CONFIRMED", "REJECTED", "COMPLETED", "CANCELLED"],
      user: ["CANCELLED"],
    };

    if (!isAdmin && !isOwner) {
      return { success: false, error: "Unauthorized access" };
    }

    if (!allowedStatusChanges[isAdmin ? "admin" : "user"].includes(status)) {
      return { success: false, error: "Invalid status transition" };
    }

    const updateData: Partial<Booking> = {
      status,
      confirmedAt: status === "CONFIRMED" ? new Date() : undefined,
      confirmedBy: status === "CONFIRMED" ? userId : undefined,
      cancelledAt: status === "CANCELLED" ? new Date() : undefined,
      completedAt: status === "COMPLETED" ? new Date() : undefined,
    };

    // if status is confirmed 

    const isConfirmed = status === "CONFIRMED";
if (isConfirmed) {
await generateReceipt(booking.id);
}
      // If booking is confirmed, ensure payment is made


     
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: updateData,
    });


    

    // Add audit log
    await db.auditLog.create({
      data: {
        action: `STATUS_UPDATE_${status}`,
        entityId: bookingId,
        entityType: "BOOKING",
        userId: user.id,
        details: JSON.stringify({
          from: booking.status,
          to: status,
        }),
      },
    });

    revalidatePath("/admindashboard/water-tanker/schedule", 'page');

    return {
      success: true,
      message: `Booking ${status.toLowerCase()} successfully`,
      booking: updatedBooking,
    };
  } catch (error) {
    console.error("Booking status update error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update booking status",
    };
  }
}

const MAX_DAILY_CAPACITY = 3;

export async function createBooking(data: {
  serviceType: ServiceType;
  name: string;
  address: string;
  phone: string;
  bookingDate: Date;
  amount: number;
}) {
  try {
    // Validate and trim input data
    const trimmedName = data.name?.trim() || "";
    const trimmedAddress = data.address?.trim() || "";
    const trimmedPhone = data.phone?.trim().replace(/\D/g, "") || "";

    if (!trimmedName || trimmedName.length === 0) {
      return { success: false, error: "Customer name is required" };
    }

    if (!trimmedAddress || trimmedAddress.length === 0) {
      return { success: false, error: "Delivery address is required" };
    }

    if (!trimmedPhone || trimmedPhone.length !== 10) {
      return { success: false, error: "Valid 10-digit phone number is required" };
    }

    if (!data.amount || data.amount <= 0) {
      return { success: false, error: "Service fee must be greater than 0" };
    }

    // Validate and normalize date
    const bookingDate = new Date(data.bookingDate);
    if (isNaN(bookingDate.getTime())) {
      return { success: false, error: "Invalid booking date" };
    }

    // Set time to start of day for consistent comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return { success: false, error: "Cannot book for past dates" };
    }

    const user = await currentUser();
    if (!user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // Check/create service availability
    const availability = await db.serviceAvailability.upsert({
      where: {
        serviceType_date: {
          serviceType: data.serviceType,
          date: bookingDate,
        },
      },
      create: {
        serviceType: data.serviceType,
        date: bookingDate,
        capacity: MAX_DAILY_CAPACITY,
        booked: 0,
      },
      update: {},
    });

    if (availability.booked >= availability.capacity) {
      return { success: false, error: "No available slots for this date" };
    }

    // Create transaction
    const [booking] = await db.$transaction([
      db.booking.create({
        data: {
          serviceType: data.serviceType,
          name: trimmedName,
          address: trimmedAddress,
          phone: trimmedPhone,
          bookingDate: bookingDate,
          amount: data.amount,
          userId: user.id,
          status: "PENDING",
          employeeId: user.id,
          isPaid: false,
          isDeposited: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      db.serviceAvailability.update({
        where: { id: availability.id },
        data: { booked: { increment: 1 } },
      }),
    ]);

    revalidatePath("/admindashboard/water-tanker/schedule", 'page');
    revalidatePath("/admindashboard/water-tanker", 'page');

    return { 
      success: true, 
      bookingId: booking.id,
      message: `Booking created successfully for ${trimmedName}`,
    };
  } catch (error) {
    console.error("Booking creation error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create booking" 
    };
  }
}

export async function updateFee(prevState: any, formData: FormData) {
  const amount = parseFloat(formData.get("amount") as string);
  
  // Add validation
  if (isNaN(amount) || amount <= 0) {
    return { success: false, message: "Invalid amount" };
  }
  
  const serviceTypeId = formData.get("serviceType") as string;
  const cuser = await currentUser();

  if (!cuser?.id) {
    return { success: false, message: "User not authenticated" };
  }

  try {
    if (formData.get("feeId")) {
      await db.serviceFee.update({
        where: {
          id: formData.get("feeId") as string,
        },
        data: {
          amount,
          updatedBy: cuser.id, // Now we know this is definitely a string
        },
      });
    } else {
      await db.serviceFee.create({
        data: {
          serviceType: serviceTypeId as ServiceType,
          amount,
          updatedBy: cuser.id, // Now we know this is definitely a string
        },
      });
    }

    revalidatePath("/admindashboard/water-tanker/fees", 'page');
    return { success: true, message: "Fee updated successfully" };
  } catch (error) {
    console.error("Fee update error:", error);
    return { success: false, message: "Failed to update fee" };
  }
}
