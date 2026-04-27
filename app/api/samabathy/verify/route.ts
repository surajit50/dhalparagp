import { db } from "@/lib/db";
import { auth } from "@/auth";

const SANCTION_AMOUNT = 2000;

export async function POST(req: Request) {
  const session = await auth();

  // 🔐 Authorization
  if (
    !session?.user ||
    !["admin", "superadmin", "staff"].includes(session.user.role)
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ids, action } = body;

  // ✅ Normalize input
  const targetIds: string[] = ids || (id ? [id] : []);

  if (!targetIds.length || !action) {
    return Response.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    // =========================
    // ✅ VERIFY + AUTO APPROVE
    // =========================
    if (action === "VERIFY") {
      const results = [];

      for (const appId of targetIds) {
        const result = await db.$transaction(async (tx) => {
          const existing = await tx.samabyathiApplication.findUnique({
            where: { id: appId },
          });

          if (!existing) throw new Error("Application not found");

          if (existing.status === "APPROVED") {
            return existing; // skip already approved
          }

          const totalRemainingData = await tx.allotment.aggregate({
            _sum: { remaining: true },
          });

          const totalRemaining = totalRemainingData._sum.remaining || 0;

          let status: "PENDING" | "APPROVED" = "PENDING";
          let sanction: number | null = null;

          if (totalRemaining >= SANCTION_AMOUNT) {
            let remainingToDeduct = SANCTION_AMOUNT;

            const allotments = await tx.allotment.findMany({
              where: { remaining: { gt: 0 } },
              orderBy: { createdAt: "asc" },
            });

            for (const a of allotments) {
              if (remainingToDeduct <= 0) break;

              const deduct = Math.min(a.remaining, remainingToDeduct);

              await tx.allotment.update({
                where: { id: a.id },
                data: {
                  remaining: { decrement: deduct },
                },
              });

              remainingToDeduct -= deduct;
            }

            status = "APPROVED";
            sanction = SANCTION_AMOUNT;
          }

          const updated = await tx.samabyathiApplication.update({
            where: { id: appId },
            data: {
              status,
              sanctionAmount: sanction,
            },
          });

          return updated;
        });

        results.push(result);
      }

      return Response.json({
        message: `${results.length} processed`,
        data: results,
      });
    }

    // =========================
    // ❌ REJECT (BULK)
    // =========================
    if (action === "REJECT") {
      const updated = await db.samabyathiApplication.updateMany({
        where: { id: { in: targetIds } },
        data: { status: "REJECTED" },
      });

      return Response.json({
        message: `${updated.count} rejected`,
      });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Verification error:", error);

    return Response.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
