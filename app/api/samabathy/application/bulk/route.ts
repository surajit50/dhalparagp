import { db } from "@/lib/db";
import { SAMABYATHI_CONFIG } from "@/constants/samabyathi";
import { auth } from "@/auth";
import { applicationSchema } from "@/lib/validation";

async function generateApplicationNumber(tx: any) {
  const year = new Date().getFullYear().toString();

  const counter = await tx.samabyathiCounter.upsert({
    where: { year },
    update: { lastNumber: { increment: 1 } },
    create: { year, lastNumber: 1 },
  });

  const sequence = counter.lastNumber.toString().padStart(4, "0");
  return `SAM/${year}/${sequence}`;
}

export async function POST(req: Request) {
  const session = await auth();
  const isAdmin =
    session?.user?.role === "admin" ||
    session?.user?.role === "superadmin" ||
    session?.user?.role === "staff";

  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { applications } = await req.json();

    if (!Array.isArray(applications) || applications.length === 0) {
      return Response.json({ error: "No applications provided" }, { status: 400 });
    }

    const sanctionAmount = SAMABYATHI_CONFIG.AMOUNT_PER_APP;
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Process each application
    for (const appData of applications) {
      try {
        // Basic data cleaning from Excel
        const cleanedData = {
          ...appData,
          mobileNumber: String(appData.mobileNumber || "").trim(),
          aadhaarNumber: String(appData.aadhaarNumber || "").trim(),
          voterId: String(appData.voterId || "").trim(),
          // Convert date if it's a serial number from Excel
          dateOfDeath: appData.dateOfDeath 
            ? (typeof appData.dateOfDeath === "number" 
               ? new Date((appData.dateOfDeath - 25569) * 86400 * 1000).toISOString().split('T')[0]
               : String(appData.dateOfDeath))
            : undefined
        };

        const parsed = applicationSchema.safeParse(cleanedData);
        if (!parsed.success) {
          const fieldErrors = parsed.error.flatten().fieldErrors;
          const errorMsg = `Row for ${appData.applicantName || 'Unknown'}: ${Object.entries(fieldErrors).map(([field, msgs]) => `${field}: ${msgs.join(', ')}`).join('; ')}`;
          errors.push(errorMsg);
          failedCount++;
          continue;
        }

        const data = parsed.data;

        // Check for existing Aadhaar
        const existing = await db.samabyathiApplication.findFirst({
          where: {
            aadhaarNumber: data.aadhaarNumber,
            status: { not: "REJECTED" },
          },
        });

        if (existing) {
          errors.push(`Row for ${data.applicantName}: Aadhaar ${data.aadhaarNumber} already registered.`);
          failedCount++;
          continue;
        }

        // Create application in a transaction to ensure allotment deduction is safe
        await db.$transaction(async (tx) => {
          const applicationNumber = await generateApplicationNumber(tx);
          
          const totalRemainingData = await tx.allotment.aggregate({
            _sum: { remaining: true },
          });

          const totalRemaining = totalRemainingData._sum.remaining || 0;
          let status: "UNDER_REVIEW" | "PENDING" | "APPROVED" = "UNDER_REVIEW";
          let sanction: number | null = null;

          if (totalRemaining >= sanctionAmount) {
            let remainingToDeduct = sanctionAmount;
            const allotments = await tx.allotment.findMany({
              where: { remaining: { gt: 0 } },
              orderBy: { createdAt: "asc" },
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

          await tx.samabyathiApplication.create({
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

        successCount++;
      } catch (err: any) {
        console.error("Error processing row:", err);
        errors.push(`Row for ${appData.applicantName || 'Unknown'}: Internal error - ${err.message}`);
        failedCount++;
      }
    }

    return Response.json({
      successCount,
      failedCount,
      errors,
    });

  } catch (error: any) {
    console.error("BULK UPLOAD ERROR:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
