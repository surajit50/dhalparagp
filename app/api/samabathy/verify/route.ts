import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superadmin" && session.user.role !== "staff")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, action } = body;

  if (!id || !action) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    if (action === "VERIFY") {
      const updated = await db.samabyathiApplication.update({
        where: { id },
        data: { status: "PENDING" },
      });
      return Response.json({ message: "Application verified", data: updated });
    } else if (action === "REJECT") {
      const updated = await db.samabyathiApplication.update({
        where: { id },
        data: { status: "REJECTED" },
      });
      return Response.json({ message: "Application rejected", data: updated });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Verification error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
