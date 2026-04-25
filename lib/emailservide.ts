"use server";
import { db } from "./db";

export async function emailServiceStatus(): Promise<boolean> {
  try {
    // Find the most recent email service status record
    const statusRecord = await db.emailService.findFirst({
      orderBy: { createdAt: "desc" },
      select: { emailservicestatus: true },
    });

    // Return the status if record exists, otherwise false
    return statusRecord?.emailservicestatus ?? false;
  } catch (error) {
    console.error("Error checking email service status: ", error);
    return false;
  }
}

export async function updateEmailServiceStatus(
  newStatus: boolean
): Promise<boolean> {
  try {
    await db.emailService.create({
      data: {
        emailservicestatus: newStatus,
      },
    });
    return true;
  } catch (error) {
    console.error("Error updating email service status: ", error);
    return false;
  }
}

export async function getEmailServiceHistory() {
  try {
    const history = await db.emailService.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        emailservicestatus: true,
        createdAt: true,
      },
      take: 5, // Get last 5 status changes
    });
    return history;
  } catch (error) {
    console.error("Error fetching email service history:", error);
    return [];
  }
}
