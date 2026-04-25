import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TermCategory } from "@prisma/client";

// GET - Fetch a specific tender term
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const term = await db.tenderTerms.findUnique({
      where: { id },
    });

    if (!term) {
      return NextResponse.json(
        { message: "Term not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(term);
  } catch (error) {
    console.error("Error fetching tender term:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update a tender term
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { category, title, content, order, isActive } = body;

    // Check if term exists
    const { id } = await params;
    const existingTerm = await db.tenderTerms.findUnique({
      where: { id },
    });

    if (!existingTerm) {
      return NextResponse.json(
        { message: "Term not found" },
        { status: 404 }
      );
    }

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

    // Update the term
    const updatedTerm = await db.tenderTerms.update({
      where: { id },
      data: {
        category: category as TermCategory,
        title,
        content,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : existingTerm.isActive,
      },
    });

    return NextResponse.json(updatedTerm);
  } catch (error) {
    console.error("Error updating tender term:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Partially update a tender term (for status changes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();

    // Check if term exists
    const { id } = await params;
    const existingTerm = await db.tenderTerms.findUnique({
      where: { id },
    });

    if (!existingTerm) {
      return NextResponse.json(
        { message: "Term not found" },
        { status: 404 }
      );
    }

    // Update the term with provided fields
    const updatedTerm = await db.tenderTerms.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updatedTerm);
  } catch (error) {
    console.error("Error updating tender term:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a tender term
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if term exists
    const { id } = await params;
    const existingTerm = await db.tenderTerms.findUnique({
      where: { id },
    });

    if (!existingTerm) {
      return NextResponse.json(
        { message: "Term not found" },
        { status: 404 }
      );
    }

    // Delete the term
    await db.tenderTerms.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Term deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting tender term:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
