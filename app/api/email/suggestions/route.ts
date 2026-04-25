import { db } from "@/lib/db";

export async function GET() {
  try {
    const emails = await db.email.findMany({
      select: {
        to: true,
        cc: true,
        bcc: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // Extract and deduplicate email addresses
    const uniqueEmails = new Set<string>();

    emails.forEach((email) => {
      // Handle to array
      if (Array.isArray(email.to)) {
        email.to.forEach((addr) => addr && uniqueEmails.add(addr));
      }

      // Handle cc array
      if (Array.isArray(email.cc)) {
        email.cc.forEach((addr) => addr && uniqueEmails.add(addr));
      }

      // Handle bcc array
      if (Array.isArray(email.bcc)) {
        email.bcc.forEach((addr) => addr && uniqueEmails.add(addr));
      }
    });

    return Response.json(Array.from(uniqueEmails));
  } catch (error) {
    console.error("Email suggestions error:", error);
    return Response.json(
      { error: "Failed to fetch email suggestions" },
      { status: 500 }
    );
  }
}
