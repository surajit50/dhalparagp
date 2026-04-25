import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

type TemplateItem = {
  code?: string;
  description: string;
  unit: string;
  rate: number;
  defaultQty?: number;
  category?: string;
  subItems?: Array<{ id?: string; description: string; quantity: number; unit: string; rate: number; amount: number; nos?: number; length?: number; breadth?: number; depth?: number }>;
  measurements?: Array<{ id?: string; description: string; nos: number; length: number; breadth: number; depth: number; quantity: number }>;
  nos?: number;
  length?: number;
  breadth?: number;
  depth?: number;
};

const DEFAULTS = [
  {
    name: "Road - Basic (Excavation, Sub-base, Base)",
    estimateType: "road",
    items: [
      { code: "EARTH-EXC", description: "Earthwork excavation in ordinary soil", unit: "Cum", rate: 150, defaultQty: 100, category: "Earthwork" },
      { code: "GSB", description: "Granular sub-base laying and compaction", unit: "Cum", rate: 1250, defaultQty: 80, category: "Sub-base" },
      { code: "WBM", description: "WBM base course laying and compaction", unit: "Cum", rate: 2200, defaultQty: 75, category: "Base" }
    ]
  },
  {
    name: "RCC Drain with slab - Typical",
    estimateType: "civil-work",
    items: [
      { code: "EXC-FOUND", description: "Excavation for foundation", unit: "Cum", rate: 145, defaultQty: 50, category: "Earthwork" },
      { code: "SAND-FILL", description: "Sand filling in foundation", unit: "Cum", rate: 480, defaultQty: 10, category: "Backfill" },
      { code: "PCC-1:4:8", description: "PCC 1:4:8 in foundation", unit: "Cum", rate: 4200, defaultQty: 8, category: "Concrete" },
      { code: "RCC-M25", description: "RCC M25 for drain wall/slab", unit: "Cum", rate: 5668, defaultQty: 12, category: "Concrete" },
      { code: "REBAR", description: "Reinforcement steel Fe500", unit: "Kg", rate: 65, defaultQty: 1200, category: "Steel" }
    ]
  },
  {
    name: "Building - Small Unit (Foundation to Roof)",
    estimateType: "building",
    items: [
      { code: "FOUND-EXC", description: "Excavation for foundation", unit: "Cum", rate: 160, defaultQty: 60, category: "Earthwork" },
      { code: "BRICK-MASON", description: "Brick masonry in cement mortar", unit: "Cum", rate: 5200, defaultQty: 30, category: "Masonry" },
      { code: "RCC-SLAB", description: "RCC slab M25", unit: "Cum", rate: 5700, defaultQty: 15, category: "Concrete" },
      { code: "PLASTER", description: "Cement plaster 12mm", unit: "Sqm", rate: 180, defaultQty: 200, category: "Finishes" }
    ]
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const estimateType = (searchParams.get("estimateType") || "").trim();
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    // Raw query to bypass missing Prisma client definition
    // Check count
    const countCmd = await db.$runCommandRaw({
      count: "estimate_templates"
    }) as any;
    
    const count = countCmd.n || 0;

    if (count === 0) {
      // Seed defaults
      const documents = DEFAULTS.map(d => ({
        name: d.name,
        estimateType: d.estimateType,
        items: d.items,
        createdAt: { $date: new Date().toISOString() },
        updatedAt: { $date: new Date().toISOString() }
      }));

      await db.$runCommandRaw({
        insert: "estimate_templates",
        documents: documents
      });
    }

    const filter: any = {};
    if (estimateType) {
      filter.estimateType = estimateType;
    }
    if (q) {
      filter.name = { $regex: q, $options: "i" };
    }

    const findCmd = await db.$runCommandRaw({
      find: "estimate_templates",
      filter: filter,
      sort: { createdAt: -1 }
    }) as any;

    const templates = (findCmd.cursor?.firstBatch || []).map((t: any) => ({
      ...t,
      id: t._id?.$oid || t._id,
      items: t.items // Items are stored as is
    }));

    return NextResponse.json({ items: templates, totalCount: templates.length });
  } catch (e) {
    console.error("GET templates error:", e);
    return NextResponse.json({ error: "Failed to read templates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, estimateType, items } = body as {
      name: string; estimateType: string; items: TemplateItem[];
    };

    if (!name || !estimateType || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "name, estimateType and items are required" }, { status: 400 });
    }

    // Generate ObjectId
    // A simple 24-char hex string
    const timestamp = Math.floor(Date.now() / 1000).toString(16);
    const random = 'x'.repeat(16).replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
    const oid = (timestamp + random).toLowerCase();

    const newDoc = {
      _id: { $oid: oid },
      name,
      estimateType,
      items,
      createdAt: { $date: new Date().toISOString() },
      updatedAt: { $date: new Date().toISOString() }
    };

    await db.$runCommandRaw({
      insert: "estimate_templates",
      documents: [newDoc]
    });

    return NextResponse.json({ ...newDoc, id: oid }, { status: 201 });
  } catch (e) {
    console.error("POST template error:", e);
    return NextResponse.json({ error: "Failed to save template" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const deleteCmd = await db.$runCommandRaw({
      delete: "estimate_templates",
      deletes: [
        { q: { _id: { $oid: id } }, limit: 1 }
      ]
    }) as any;

    if (deleteCmd.n === 0) {
       return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE template error:", e);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, estimateType } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const updateFields: any = {
      updatedAt: { $date: new Date().toISOString() }
    };
    if (name) updateFields.name = name;
    if (estimateType) updateFields.estimateType = estimateType;

    const updateCmd = await db.$runCommandRaw({
      update: "estimate_templates",
      updates: [
        {
          q: { _id: { $oid: id } },
          u: { $set: updateFields }
        }
      ]
    }) as any;

    if (updateCmd.n === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("PUT template error:", e);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}
