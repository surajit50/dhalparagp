import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const ack = req.nextUrl.searchParams.get("ack");
  if (!ack) return NextResponse.json({ app: null });

  const app = await db.warishApplication.findUnique({
    where: { acknowlegment: ack },
    include:{ warishDetails: true },
    
  });

  return NextResponse.json({ app });
}
