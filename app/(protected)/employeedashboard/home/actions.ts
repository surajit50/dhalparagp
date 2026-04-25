"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleAttendance() {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const existingAttendance = await db.attendance.findFirst({
    where: {
      userId: user.id,
      date: {
        gte: todayStart,
        lt: todayEnd,
      },
    },
  });

  const now = new Date();

  if (!existingAttendance) {
    // Check-in
    await db.attendance.create({
      data: {
        userId: user.id,
        date: todayStart,
        checkIn: now,
        status: "PRESENT",
      },
    });
  } else if (!existingAttendance.checkOut) {
    // Check-out
    await db.attendance.update({
      where: { id: existingAttendance.id },
      data: {
        checkOut: now,
      },
    });
  } else {
    // Already checked out, do nothing or throw error
    return { error: "Already checked out for today" };
  }

  revalidatePath("/employeedashboard/home");
  return { success: true };
}
