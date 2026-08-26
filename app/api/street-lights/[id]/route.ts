import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { StreetLightSchema } from "@/schema/street-light";

// GET /api/street-lights/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const light = await db.streetLight.findUnique({
      where: { id },
      include: {
        mouza: true,
        complaints: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!light)
      return NextResponse.json({ error: "Street light not found" }, { status: 404 });
    return NextResponse.json(light);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch street light" }, { status: 500 });
  }
}

// PUT /api/street-lights/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = StreetLightSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { lastInspection, ...rest } = parsed.data;

    const light = await db.streetLight.update({
      where: { id },
      data: {
        ...rest,
        ...(lastInspection ? { lastInspection: new Date(lastInspection) } : {}),
      },
      include: { mouza: { select: { mouzaName: true } } },
    });
    return NextResponse.json(light);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update street light" }, { status: 500 });
  }
}

// DELETE /api/street-lights/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.streetLight.delete({ where: { id } });
    return NextResponse.json({ message: "Street light deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete street light" }, { status: 500 });
  }
}
