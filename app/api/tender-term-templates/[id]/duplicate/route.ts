import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const template = await db.tenderTermTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { message: "Tender term template not found" },
        { status: 404 },
      );
    }

    const baseName = template.name.trim() || "Tender Template";
    let nextName = `${baseName} (Copy)`;
    let counter = 1;

    while (true) {
      const existing = await db.tenderTermTemplate.findFirst({
        where: { name: nextName },
      });
      if (!existing) break;
      counter += 1;
      nextName = `${baseName} (Copy ${counter})`;
    }

    const normalizedContent =
      ((template.content as Prisma.JsonValue | null) ??
        {
          eligible: [],
          qualificationCriteria: [],
          termsConditions: [],
        }) as Prisma.JsonObject;

    const duplicate = await db.tenderTermTemplate.create({
      data: {
        name: nextName,
        description: template.description,
        content: normalizedContent,
        isActive: template.isActive,
      },
    });

    return NextResponse.json(duplicate, { status: 201 });
  } catch (error) {
    console.error("Error duplicating tender term template:", error);
    return NextResponse.json(
      { message: "Failed to duplicate tender term template" },
      { status: 500 },
    );
  }
}

