import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type TemplateContent = {
  eligible: string[];
  qualificationCriteria: string[];
  termsConditions: string[];
};

const normalizeContent = (raw: unknown): TemplateContent => {
  const fallback: TemplateContent = {
    eligible: [],
    qualificationCriteria: [],
    termsConditions: [],
  };

  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return fallback;
  }

  const data = raw as Record<string, unknown>;

  const toStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  };

  return {
    eligible: toStringArray(data.eligible),
    qualificationCriteria: toStringArray(data.qualificationCriteria),
    termsConditions: toStringArray(data.termsConditions),
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");
    const isActiveParam = searchParams.get("isActive");

    const where: Record<string, unknown> = {};

    if (idsParam) {
      const ids = idsParam
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
      if (ids.length) {
        where.id = { in: ids };
      }
    }

    if (isActiveParam !== null) {
      where.isActive = isActiveParam === "true";
    }

    const templates = await db.tenderTermTemplate.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching tender term templates:", error);
    return NextResponse.json(
      { message: "Failed to fetch tender term templates" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, content, isActive = true } = body ?? {};

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { message: "Template name is required" },
        { status: 400 },
      );
    }

    const normalizedContent = normalizeContent(content);

    const template = await db.tenderTermTemplate.create({
      data: {
        name: name.trim(),
        description: typeof description === "string" ? description.trim() : undefined,
        content: normalizedContent,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating tender term template:", error);
    return NextResponse.json(
      { message: "Failed to create tender term template" },
      { status: 500 },
    );
  }
}

