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
  const { id, action } = body;

  if (!id || !action) {
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
      const result = await db.$transaction(async (tx) => {
        // 🔹 Check existing application
        const existing = await tx.samabyathiApplication.findUnique({
          where: { id },
        });

        if (!existing) {
          throw new Error("Application not found");
        }

        if (existing.status === "APPROVED") {
          throw new Error("Already approved");
        }

        // 🔹 Get total remaining fund
        const totalRemainingData = await tx.allotment.aggregate({
          _sum: { remaining: true },
        });

        const totalRemaining = totalRemainingData._sum.remaining || 0;

        let status: "PENDING" | "APPROVED" = "PENDING";
        let sanction: number | null = null;

        // =========================
        // ✅ If fund available → APPROVE
        // =========================
        if (totalRemaining >= SANCTION_AMOUNT) {
          let remainingToDeduct = SANCTION_AMOUNT;

          const allotments = await tx.allotment.findMany({
            where: { remaining: { gt: 0 } },
            orderBy: { createdAt: "asc" }, // FIFO
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

        // 🔹 Update application
        const updated = await tx.samabyathiApplication.update({
          where: { id },
          data: {
            status,
            sanctionAmount: sanction,
          },
        });

        return updated;
      });

      return Response.json({
        message:
          result.status === "APPROVED"
            ? "Application approved"
            : "Application verified (waiting for fund)",
        data: result,
      });
    }

    // =========================
    // ❌ REJECT
    // =========================
    if (action === "REJECT") {
      const updated = await db.samabyathiApplication.update({
        where: { id },
        data: { status: "REJECTED" },
      });

      return Response.json({
        message: "Application rejected",
        data: updated,
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
