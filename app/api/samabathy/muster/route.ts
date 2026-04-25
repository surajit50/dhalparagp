import { db } from "@/lib/db";

export async function GET() {
  const data = await db.musterRoll.findMany({
    include: { application: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(data);
}