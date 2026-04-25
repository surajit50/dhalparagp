import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust path to your Prisma client

export async function GET() {
  const years = await db.yeardatas.findMany({ orderBy: { yeardata: "asc" } });
  return NextResponse.json(years);
}
export async function POST(req: Request) {
  try {
    const { year } = await req.json();
    const newYear = await db.yeardatas.create({
      data: { yeardata: year }
    });
    return NextResponse.json(newYear, { status: 201 });
  } catch (error) {
    console.error("Create error:", error);
    return NextResponse.json(
      { error: "Failed to create year" },
      { status: 500 }
    );
  }
}
