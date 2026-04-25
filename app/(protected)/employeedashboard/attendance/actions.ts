"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AttendanceStatus } from "@prisma/client";

export async function createAttendance(formData: FormData) {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const status = formData.get("status") as keyof typeof AttendanceStatus;
  const dateStr = formData.get("date") as string;
  const checkInStr = formData.get("checkIn") as string;
  const checkOutStr = formData.get("checkOut") as string;
  const notes = (formData.get("notes") as string) || undefined;

  const date = new Date(dateStr);
  const checkIn = checkInStr ? new Date(`${dateStr}T${checkInStr}:00`) : undefined;
  const checkOut = checkOutStr ? new Date(`${dateStr}T${checkOutStr}:00`) : undefined;

  await db.attendance.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date,
      },
    },
    update: {
      status: AttendanceStatus[status],
      checkIn,
      checkOut,
      notes,
    },
    create: {
      userId: user.id,
      date,
      status: AttendanceStatus[status],
      checkIn,
      checkOut,
      notes,
    },
  });
}

