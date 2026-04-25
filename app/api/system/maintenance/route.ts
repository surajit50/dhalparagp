import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { status } = await req.json();

  await db.systemConfig.upsert({
    where: { key: "maintenance_mode" },
    update: { value: status },
    create: { key: "maintenance_mode", value: status },
  });

  return NextResponse.json({ success: true });
}
