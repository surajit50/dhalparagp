import { db } from "@/lib/db";
import { auth } from "@/auth";

function json(body: any, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

// DELETE: Soft-delete (deactivate) estimate type by id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Add Promise wrapper
) {
  try {
    const session = await auth();
    if (!session?.user || !["admin", "superadmin"].includes(session.user.role)) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // Await the params
    if (!id) {
      return json({ error: "ID is required" }, { status: 400 });
    }

    const updated = await db.estimateType.update({
      where: { id },
      data: { isActive: false },
    });

    return json(updated);
  } catch (error) {
    console.error("Error deleting estimate type:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
