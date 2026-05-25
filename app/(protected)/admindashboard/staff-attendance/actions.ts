"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getStaffAttendance(month: number, year: number) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  // Get all users with staff role
  const staffMembers = await db.user.findMany({
    where: {
      role: "staff",
    },
    select: {
      id: true,
      name: true,
      designation: true,
    },
  });

  // Get attendance records for the month
  const attendance = await db.attendance.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  return { staffMembers, attendance };
}

export async function getHolidays() {
  try {
    const holidays = await db.holiday.findMany({
      orderBy: {
        date: "asc",
      },
    });
    
    // Convert to plain objects to ensure serializability
    return holidays.map(h => ({
      id: h.id.toString(),
      name: h.name,
      date: h.date.toISOString(),
      description: h.description,
    }));
  } catch (error) {
    console.error("SERVER ERROR: Failed to fetch holidays:", error);
    return [];
  }
}

export async function addHoliday(name: string, date: Date, description?: string) {
  const holiday = await db.holiday.create({
    data: {
      name,
      date,
      description,
    },
  });
  revalidatePath("/admindashboard/staff-attendance");
  return {
    id: holiday.id.toString(),
    name: holiday.name,
    date: holiday.date,
    description: holiday.description,
  };
}

export async function deleteHoliday(id: string) {
  await db.holiday.delete({
    where: { id },
  });
  revalidatePath("/admindashboard/staff-attendance");
}
