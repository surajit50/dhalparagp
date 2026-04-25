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

export async function GET(
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

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching tender term template:", error);
    return NextResponse.json(
      { message: "Failed to fetch tender term template" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, content, isActive } = body ?? {};

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { message: "Template name is required" },
        { status: 400 },
      );
    }

    const existing = await db.tenderTermTemplate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { message: "Tender term template not found" },
        { status: 404 },
      );
    }

    const normalizedContent = normalizeContent(content);

    // Handle description: convert empty string to null, trim if string, keep undefined if not provided
    const descriptionValue =
      description === null || description === ""
        ? null
        : typeof description === "string"
        ? description.trim() || null
        : undefined;

    const updateData: {
      name: string;
      description?: string | null;
      content: TemplateContent;
      isActive: boolean;
    } = {
      name: name.trim(),
      content: normalizedContent,
      isActive: typeof isActive === "boolean" ? isActive : existing.isActive,
    };

    // Only include description in update if it was provided
    if (descriptionValue !== undefined) {
      updateData.description = descriptionValue;
    }

    const updatedTemplate = await db.tenderTermTemplate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Error updating tender term template:", error);
    return NextResponse.json(
      { message: "Failed to update tender term template" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.tenderTermTemplate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { message: "Tender term template not found" },
        { status: 404 },
      );
    }

    const data: Record<string, unknown> = {};

    if (typeof body.name === "string" && body.name.trim().length > 0) {
      data.name = body.name.trim();
    }

    if (body.description === null) {
      data.description = null;
    } else if (typeof body.description === "string") {
      data.description = body.description.trim();
    }

    if (body.content !== undefined) {
      data.content = normalizeContent(body.content);
    }

    if (typeof body.isActive === "boolean") {
      data.isActive = body.isActive;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(existing);
    }

    const updatedTemplate = await db.tenderTermTemplate.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Error partially updating tender term template:", error);
    return NextResponse.json(
      { message: "Failed to update tender term template" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const existing = await db.tenderTermTemplate.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { message: "Tender term template not found" },
        { status: 404 },
      );
    }

    await db.tenderTermTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Tender term template deleted" });
  } catch (error) {
    console.error("Error deleting tender term template:", error);
    return NextResponse.json(
      { message: "Failed to delete tender term template" },
      { status: 500 },
    );
  }
}

