import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const applicationNumber = searchParams.get("applicationNumber");

  if (!applicationNumber) {
    return Response.json({ error: "Application number is required" }, { status: 400 });
  }

  try {
    const application = await db.samabyathiApplication.findUnique({
      where: { applicationNumber },
      select: {
                applicationNumber: true,
                applicantName: true,
                deceasedName: true,
                voterId: true,
                aadhaarNumber: true,
                status: true,
                createdAt: true,
                sanctionAmount: true,
              },
    });

    if (!application) {
      return Response.json({ error: "Application not found" }, { status: 404 });
    }

    return Response.json(application);
  } catch (error) {
    console.error("Status check error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
