import { db } from "@/lib/db";
import { SAMABYATHI_CONFIG } from "@/constants/samabyathi";
import { auth } from "@/auth";

async function generateApplicationNumber() {
  const year = new Date().getFullYear().toString();
  
  const counter = await db.samabyathiCounter.upsert({
    where: { year },
    update: { lastNumber: { increment: 1 } },
    create: { year, lastNumber: 1 },
  });
  
  const sequence = counter.lastNumber.toString().padStart(4, "0");
  return `SAM/${year}/${sequence}`;
}

export async function POST(req: Request) {
  const session = await auth();
  const body = await req.json();
  const sanctionAmount = SAMABYATHI_CONFIG.AMOUNT_PER_APP;

  if (
      !body.applicantName ||
      !body.mobileNumber ||
      !body.deceasedName ||
      !body.dateOfDeath ||
      !body.voterId ||
      !body.aadhaarNumber
    ) {
    return Response.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {

    const existing = await db.samabyathiApplication.findFirst({
    where: {
      aadhaarNumber: body.aadhaarNumber,
    },
  });

  if (existing) {
    return Response.json(
      { error: "Application already submitted with this Aadhaar" },
      { status: 400 }
    );
  }
    
    const applicationNumber = await generateApplicationNumber();

    const result = await db.$transaction(async (tx) => {
      // ✅ Get total remaining fund (ALL allotments)
      const totalRemainingData = await tx.allotment.aggregate({
        _sum: { remaining: true },
      });

      const totalRemaining = totalRemainingData._sum.remaining || 0;

      let status: "UNDER_REVIEW" | "PENDING" | "APPROVED" = "UNDER_REVIEW";
      let sanction: number | null = null;

      // Only auto-approve if user is admin/staff and fund is available
      const isAdmin = session?.user?.role === "admin" || session?.user?.role === "superadmin" || session?.user?.role === "staff";

      // ✅ Instant sanction logic (only for admin/staff)
      if (isAdmin && totalRemaining >= sanctionAmount) {
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

      // ✅ Create application
      const app = await tx.samabyathiApplication.create({
        data: {
          applicationNumber,
          applicantName: body.applicantName,
          mobileNumber: body.mobileNumber,
          villageName: body.villageName,
          deceasedName: body.deceasedName,
          relation: body.relation,
          dateOfDeath: new Date(body.dateOfDeath),
          voterId: body.voterId,
          aadhaarNumber: body.aadhaarNumber,
          status,
          sanctionAmount: sanction,
          userId: session?.user?.id,
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
