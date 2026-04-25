import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const emails = await db.email.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        attachments: true,
      },
    });

    return NextResponse.json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
