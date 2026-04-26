import { db } from "@/lib/db";
import { SAMABYATHI_CONFIG } from "@/constants/samabyathi";
import { auth } from "@/auth";
import { applicationSchema } from "@/lib/validation"; // ✅ import Zod schema

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

  // ✅ Validate with Zod – returns detailed field errors
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return Response.json(
      { error: "Validation failed", fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const existing = await db.samabyathiApplication.findFirst({
      where: {
        aadhaarNumber: data.aadhaarNumber,
      },
    });

    if (existing) {
      return Response.json(
        {
          error: "Application already submitted with this Aadhaar",
          fieldErrors: {
            aadhaarNumber: ["This Aadhaar is already registered."],
          },
        },
        { status: 400 }
      );
    }

    const applicationNumber = await generateApplicationNumber();

    const result = await db.$transaction(async (tx) => {
      const totalRemainingData = await tx.allotment.aggregate({
        _sum: { remaining: true },
      });

      const totalRemaining = totalRemainingData._sum.remaining || 0;

      let status: "UNDER_REVIEW" | "PENDING" | "APPROVED" = "UNDER_REVIEW";
      let sanction: number | null = null;

      const isAdmin =
        session?.user?.role === "admin" ||
        session?.user?.role === "superadmin" ||
        session?.user?.role === "staff";

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
            data: { remaining: { decrement: deduct } },
          });
          remainingToDeduct -= deduct;
        }

        status = "APPROVED";
        sanction = sanctionAmount;
      }

      return tx.samabyathiApplication.create({
        data: {
          applicationNumber,
          applicantName: data.applicantName,
          mobileNumber: data.mobileNumber,
          villageName: data.villageName,
          deceasedName: data.deceasedName,
          relation: data.relation,
          dateOfDeath: new Date(data.dateOfDeath),
          voterId: data.voterId,
          aadhaarNumber: data.aadhaarNumber,
          status,
          sanctionAmount: sanction,
          userId: session?.user?.id,
        },
      });
    });

    return Response.json({
      message: "Application created",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "An unexpected server error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const data = await db.samabyathiApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      musterRolls: true,
    },
  });

  return Response.json(data);
}
