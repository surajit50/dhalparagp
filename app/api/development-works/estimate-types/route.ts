import { db } from "@/lib/db";

import { auth } from "@/auth";

function json(body: any, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

// GET: Fetch estimate types
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const estimateTypes = await db.estimateType.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: {
            scheduleRates: true,
            projects: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return json(estimateTypes);
  } catch (error) {
    console.error("Error fetching estimate types:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create new estimate type
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["admin", "superadmin"].includes(session.user.role)) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, code, description, icon, color, dimensionFields, isActive } = body as {
      name: string;
      code: string;
      description?: string;
      icon?: string;
      color?: string;
      dimensionFields?: { required: string[]; optional: string[]; units: string[] };
      isActive?: boolean;
    };

    if (!name || !code) {
      return json({ error: "Name and code are required" }, { status: 400 });
    }

    const existing = await db.estimateType.findFirst({ where: { code } });
    if (existing) {
      return json({ error: "Estimate type code already exists" }, { status: 409 });
    }

    const created = await db.estimateType.create({
      data: {
        name,
        code,
        description: description || null,
        icon: icon || null,
        color: color || null,
        dimensionFields: dimensionFields || null,
        isActive: isActive !== undefined ? !!isActive : true,
      },
    });

    return json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating estimate type:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update estimate type
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !["admin", "superadmin"].includes(session.user.role)) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, code, description, icon, color, dimensionFields, isActive } = body as {
      id: string;
      name?: string;
      code?: string;
      description?: string;
      icon?: string;
      color?: string;
      dimensionFields?: { required: string[]; optional: string[]; units: string[] } | null;
      isActive?: boolean;
    };

    if (!id) {
      return json({ error: "ID is required" }, { status: 400 });
    }

    if (code) {
      const conflict = await db.estimateType.findFirst({ where: { code, id: { not: id } } });
      if (conflict) {
        return json({ error: "Estimate type code already exists" }, { status: 409 });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (dimensionFields !== undefined) updateData.dimensionFields = dimensionFields;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await db.estimateType.update({ where: { id }, data: updateData });
    return json(updated);
  } catch (error) {
    console.error("Error updating estimate type:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}

