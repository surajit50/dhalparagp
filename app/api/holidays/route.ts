import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const holidays = await db.holiday.findMany({
      orderBy: {
        date: "asc",
      },
    });

    // Convert to plain objects to ensure serializability
    const formattedHolidays = holidays.map((h) => ({
      id: h.id.toString(),
      name: h.name,
      date: h.date.toISOString(),
      description: h.description,
    }));

    return NextResponse.json(formattedHolidays);
  } catch (error) {
    console.error("API ERROR: Failed to fetch holidays:", error);
    return NextResponse.json(
      { error: "Failed to fetch holidays" },
      { status: 500 }
    );
  }
}
