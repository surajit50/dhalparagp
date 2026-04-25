import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TermCategory } from "@prisma/client";

// GET - Fetch all tender terms
export async function GET() {
  try {
    const terms = await db.tenderTerms.findMany({
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" }
      ],
    });

    return NextResponse.json(terms);
  } catch (error) {
    console.error("Error fetching tender terms:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new tender term
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, title, content, order } = body;

    // Validate required fields
    if (!category || !title || !content) {
      return NextResponse.json(
        { message: "Category, title, and content are required" },
        { status: 400 }
      );
    }

    // Validate category
    if (!Object.values(TermCategory).includes(category)) {
      return NextResponse.json(
        { message: "Invalid category" },
        { status: 400 }
      );
    }

    // Determine the order value
    let finalOrder = order;
    
    // If order is not provided, find the last order number for this category and increment it
    if (finalOrder === undefined || finalOrder === null) {
      const lastTermInCategory = await db.tenderTerms.findFirst({
        where: { category: category as TermCategory },
        orderBy: { order: "desc" },
        select: { order: true }
      });

      finalOrder = lastTermInCategory ? lastTermInCategory.order + 1 : 0;
    }

    // Create the term
    const term = await db.tenderTerms.create({
      data: {
        category: category as TermCategory,
        title,
        content,
        order: finalOrder,
        isActive: true,
      },
    });

    return NextResponse.json(term, { status: 201 });
  } catch (error) {
    console.error("Error creating tender term:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
