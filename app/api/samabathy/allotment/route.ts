import { db } from "@/lib/db";
import { SAMABYATHI_CONFIG } from "@/constants/samabyathi";

const CHUNK_SIZE = SAMABYATHI_CONFIG.CHUNK_SIZE;
const SANCTION_AMOUNT = SAMABYATHI_CONFIG.AMOUNT_PER_APP;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");

    if (mode === "list") {
      const allotments = await db.allotment.findMany({
        orderBy: { receivedDate: "desc" },
      });
      return Response.json(allotments);
    }

    const summary = await db.allotment.aggregate({
      _sum: {
        amount: true,
        remaining: true,
      },
    });

    const recentAllotments = await db.allotment.findMany({
      orderBy: { receivedDate: "desc" },
      take: 5,
    });

    return Response.json({
      totalAmount: summary._sum.amount || 0,
      totalRemaining: summary._sum.remaining || 0,
      recentAllotments,
    });
  } catch (error) {
    return Response.json({ error: "Failed to fetch allotment summary" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.amount || body.amount <= 0) {
    return Response.json({ error: "Invalid amount" }, { status: 400 });
  }

  try {
    // ✅ 1. Create allotment
    const newAllotment = await db.allotment.create({
      data: {
        amount: Number(body.amount),
        remaining: Number(body.amount),
        receivedDate: new Date(body.receivedDate),
      },
    });

    // ✅ 2. Get all active allotments
    const allotments = await db.allotment.findMany({
      where: { remaining: { gt: 0 } },
      orderBy: { createdAt: "asc" },
    });

    // ✅ 3. Get pending applications (limit for safety)
    const pendingApps = await db.samabyathiApplication.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 200, // can increase gradually
    });

    let totalRemaining = allotments.reduce(
      (sum, a) => sum + a.remaining,
      0
    );

    const allotmentUpdates: {
      id: string;
      decrement: number;
    }[] = [];

    const approvedAppIds: string[] = [];

    // ✅ 4. PURE LOGIC (NO DB)
    for (const app of pendingApps) {
      if (totalRemaining < SANCTION_AMOUNT) break;

      let remainingToDeduct = SANCTION_AMOUNT;

      for (const a of allotments) {
        if (remainingToDeduct <= 0) break;
        if (a.remaining <= 0) continue;

        const deduct = Math.min(a.remaining, remainingToDeduct);

        a.remaining -= deduct;
        remainingToDeduct -= deduct;

        allotmentUpdates.push({
          id: a.id,
          decrement: deduct,
        });
      }

      approvedAppIds.push(app.id);
      totalRemaining -= SANCTION_AMOUNT;
    }

    // ✅ 5. UPDATE ALLOTMENTS (chunked)
    for (let i = 0; i < allotmentUpdates.length; i += CHUNK_SIZE) {
      const chunk = allotmentUpdates.slice(i, i + CHUNK_SIZE);

      await db.$transaction(
        chunk.map((update) =>
          db.allotment.update({
            where: { id: update.id },
            data: {
              remaining: {
                decrement: update.decrement,
              },
            },
          })
        )
      );
    }

    // ✅ 6. UPDATE APPLICATIONS (FAST bulk)
    if (approvedAppIds.length > 0) {
      await db.samabyathiApplication.updateMany({
        where: {
          id: { in: approvedAppIds },
        },
        data: {
          status: "APPROVED",
          sanctionAmount: SANCTION_AMOUNT,
        },
      });
    }

    return Response.json({
      message: "Allotment processed successfully",
      processed: approvedAppIds.length,
      remaining: totalRemaining,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
