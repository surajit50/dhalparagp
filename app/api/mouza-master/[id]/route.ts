import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MouzaMasterSchema } from "@/schema/street-light";

// GET /api/mouza-master/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mouza = await db.mouzaMaster.findUnique({
      where: { id },
      include: {
        _count: { select: { streetLights: true } },
      },
    });
    if (!mouza)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mouza);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch mouza" }, { status: 500 });
  }
}

// PUT /api/mouza-master/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = MouzaMasterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const mouza = await db.mouzaMaster.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(mouza);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update mouza" }, { status: 500 });
  }
}

// DELETE /api/mouza-master/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.mouzaMaster.delete({ where: { id } });
    return NextResponse.json({ message: "Mouza deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete mouza" }, { status: 500 });
  }
}
