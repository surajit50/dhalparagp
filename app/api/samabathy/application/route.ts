import { db } from "@/lib/db";
import { SAMABYATHI_CONFIG } from "@/constants/samabyathi";

export async function POST(req: Request) {
  const body = await req.json();
  const sanctionAmount = SAMABYATHI_CONFIG.AMOUNT_PER_APP;

  if (
    !body.applicantName ||
    !body.mobileNumber ||
    !body.deceasedName ||
    !body.dateOfDeath
  ) {
    return Response.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // ✅ Get total remaining fund (ALL allotments)
      const totalRemainingData = await tx.allotment.aggregate({
        _sum: { remaining: true },
      });

      const totalRemaining = totalRemainingData._sum.remaining || 0;

      let status: "PENDING" | "APPROVED" = "PENDING";
      let sanction: number | null = null;

      // ✅ Instant sanction logic
      if (totalRemaining >= sanctionAmount) {
        let remainingToDeduct = sanctionAmount;

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
        sanction = sanctionAmount;
      }

      // ✅ Create application ONLY
      const app = await tx.samabyathiApplication.create({
        data: {
          applicantName: body.applicantName,
          mobileNumber: body.mobileNumber,
          villageName: body.villageName,
          deceasedName: body.deceasedName,
          relation: body.relation,
          dateOfDeath: new Date(body.dateOfDeath),
          status,
          sanctionAmount: sanction,
        },
      });

      return app;
    });

    return Response.json({
      message: "Application created",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// 👉 GET
export async function GET() {
  const data = await db.samabyathiApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      musterRolls: true, // will be empty until separate generation
    },
  });

  return Response.json(data);
}
