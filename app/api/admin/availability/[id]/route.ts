import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cuser = await currentUser()
    const { id } = await params;

    if (!cuser?.id || cuser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    const { serviceType, date, available, capacity, maintenance, notes } =
      await request.json();

    const availability = await db.serviceAvailability.update({
      where: { id },
      data: {
        serviceType,
        date: new Date(date),
        available,
        capacity,
        maintenance,
        notes,
        // You might want to add updatedBy from session
      },
    });

    // Log the action
    await db.auditLog.create({
      data: {
        action: "UPDATE_AVAILABILITY",
        entityId: availability.id,
        entityType: "ServiceAvailability",
        details: `Updated availability for ${serviceType} on ${date}`,
        userId: cuser.id, // Replace with actual user ID from session
      },
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cuser = await currentUser()
    const { id } = await params;

    if (!cuser?.id || cuser?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    await db.serviceAvailability.delete({
      where: { id },
    });

    // Log the action
    await db.auditLog.create({
      data: {
        action: "DELETE_AVAILABILITY",
        entityId: id,
        entityType: "ServiceAvailability",
        details: `Deleted availability entry`,
        userId: cuser.id, // Replace with actual user ID from session
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting availability:", error);
    return NextResponse.json(
      { error: "Failed to delete availability" },
      { status: 500 }
    );
  }
}
