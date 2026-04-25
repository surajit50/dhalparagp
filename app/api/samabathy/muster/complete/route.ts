import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { musterRollNo } = await req.json();

    if (!musterRollNo) {
      return Response.json(
        { error: "MusterRollNo required" },
        { status: 400 }
      );
    }

    await db.musterRoll.updateMany({
      where: {
        musterRollNo,
      },
      data: {
        paymentStatus: "COMPLETED",
      },
    });

    return Response.json({
      message: "Muster completed successfully",
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
