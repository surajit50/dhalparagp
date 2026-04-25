// app/api/tender-terms/last-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TermCategory } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!category || !Object.values(TermCategory).includes(category as TermCategory)) {
      return NextResponse.json(
        { message: "Valid category is required" },
        { status: 400 }
      );
    }

    const lastTerm = await db.tenderTerms.findFirst({
      where: { category: category as TermCategory },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    return NextResponse.json({ lastOrder: lastTerm?.order ?? 0 });
  } catch (error) {
    console.error("Error fetching last order:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
