import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const term = await db.tenderTerms.findUnique({ where: { id } });

    if (!term) {
      return NextResponse.json({ message: "Term not found" }, { status: 404 });
    }

    const baseName = term.title.trim() || "Tender Term";
    let nextTitle = `${baseName} (Copy)`;
    let counter = 1;

    while (true) {
      const existing = await db.tenderTerms.findFirst({
        where: {
          title: nextTitle,
        },
      });
      if (!existing) break;
      counter += 1;
      nextTitle = `${baseName} (Copy ${counter})`;
    }

    const duplicate = await db.tenderTerms.create({
      data: {
        category: term.category,
        title: nextTitle,
        content: term.content,
        order: term.order,
        isActive: term.isActive,
      },
    });

    return NextResponse.json(duplicate, { status: 201 });
  } catch (error) {
    console.error("Error duplicating tender term:", error);
    return NextResponse.json(
      { message: "Failed to duplicate tender term" },
      { status: 500 },
    );
  }
}

