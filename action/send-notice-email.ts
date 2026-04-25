"use server";

import {
  sentAwardedNotification,
  sentWorkOrderConfirmation,
  sentStartWorkNoticeEmail,
} from "@/lib/mail";
import { db } from "@/lib/db";

export async function sendNoticeEmail(
  noticeId: string,
  type: "award" | "confirmation" | "startWork",
  data: any
) {
  try {
    const notice = await db.notice.findUnique({
      where: { id: noticeId },
      include: { agency: true },
    });

    if (!notice) {
      return { success: false, error: "Notice not found" };
    }

    if (!notice.agency?.email) {
      return { success: false, error: "Agency email not found" };
    }

    const email = notice.agency.email;

    switch (type) {
      case "award":
        await sentAwardedNotification(
          email,
          data.nitNumber,
          new Date(data.nitDate),
          data.workslno,
          notice.agency.name
        );
        break;
      case "confirmation":
        await sentWorkOrderConfirmation(
          email,
          notice.agency.name,
          data.workOrderNumber,
          data.workOrderDate,
          data.nitNumber,
          data.workDescription,
          data.estimatedAmount,
          data.completionPeriod
        );
        break;
      case "startWork":
        await sentStartWorkNoticeEmail(
          email,
          notice.agency.name,
          data.workOrderNumber,
          data.workDescription,
          data.startDate,
          data.completionDate
        );
        break;
      default:
        return { success: false, error: "Invalid email type" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending notice email:", error);
    return { success: false, error: "Failed to send email" };
  }
}
