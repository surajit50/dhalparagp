import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type RequestPayload = {
  name?: string;
  description?: string;
  includeInactive?: boolean;
};

const normalizeName = (rawName?: string) => {
  if (typeof rawName !== "string") return "Template 1";
  const trimmed = rawName.trim();
  return trimmed.length ? trimmed : "Template 1";
};

export async function POST(request: NextRequest) {
  try {
    const body: RequestPayload = await request.json().catch(() => ({}));
    const includeInactive = Boolean(body?.includeInactive);
    const requestedName = normalizeName(body?.name);
    const description =
      typeof body?.description === "string" && body.description.trim().length
        ? body.description.trim()
        : undefined;

    const terms = await db.tenderTerms.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [{ category: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    });

    if (!terms.length) {
      return NextResponse.json(
        { message: "No tender terms available to convert into a template" },
        { status: 400 },
      );
    }

    const content = {
      eligible: [] as string[],
      qualificationCriteria: [] as string[],
      termsConditions: [] as string[],
    };

    for (const term of terms) {
      switch (term.category) {
        case "ELIGIBLE":
          content.eligible.push(term.content);
          break;
        case "QUALIFICATION_CRITERIA":
          content.qualificationCriteria.push(term.content);
          break;
        case "TERMS_CONDITIONS":
          content.termsConditions.push(term.content);
          break;
        default:
          break;
      }
    }

    if (
      content.eligible.length === 0 &&
      content.qualificationCriteria.length === 0 &&
      content.termsConditions.length === 0
    ) {
      return NextResponse.json(
        { message: "Tender terms do not contain any usable content" },
        { status: 400 },
      );
    }

    let finalName = requestedName;
    if (requestedName) {
      let suffix = 1;
      // Ensure uniqueness of name
      while (
        await db.tenderTermTemplate.findFirst({
          where: { name: finalName },
        })
      ) {
        suffix += 1;
        finalName = `${requestedName} (${suffix})`;
      }
    }

    const template = await db.tenderTermTemplate.create({
      data: {
        name: finalName,
        description,
        content,
        isActive: true,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating template from current tender terms:", error);
    return NextResponse.json(
      { message: "Failed to create template from current tender terms" },
      { status: 500 },
    );
  }
}

