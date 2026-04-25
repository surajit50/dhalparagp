import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { unknown } from "zod";


export async function POST(req: NextRequest) {
  try {
    const { villages } = await req.json();
    if (!Array.isArray(villages)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Validate and map data
    const data = villages
      .map((v: any) => ({
        name: v.name?.toString() || "",
        lgdcode: Number(v.lgdcode),
        jlno: Number(v.jlno), // <-- convert to number
      }))
      .filter(v => !isNaN(v.lgdcode) && !isNaN(v.jlno));

   

    // Bulk create
    const created = await db.villageInfo.createMany({
      data,
    });

    return NextResponse.json({ success: true, count: created.count });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
