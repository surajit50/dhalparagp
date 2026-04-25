import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { title, details, status } = body;

  try {
    const newComplaint = await db.complaint.create({
      data: {
        title,
        details,
        status,
      },
    });

    return NextResponse.json(newComplaint, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create complaint" },
      { status: 500 }
    );
  }
}
