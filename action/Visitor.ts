"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function updateTotalVisitors() {
  try {
    const result = await db.visitor.update({
      where: { id: "674f9569bc5089624f96c2e3" },
      data: { totalVisitors: { increment: 1 } },
    });
    return result.totalVisitors;
  } catch (error) {
    console.error("Failed to update total visitors:", error);
    throw new Error("Failed to update total visitors");
  }
}

export async function getOnlineVisitors(): Promise<number> {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 5 * 60; // 5 minutes ago in seconds

  try {
    const onlineVisitorsCount = await db.account.count({
      where: {
        expires_at: {
          gt: fiveMinutesAgo,
        },
      },
    });

    return onlineVisitorsCount;
  } catch (error) {
    console.error("Failed to fetch online visitors:", error);
    throw new Error("Failed to fetch online visitors");
  }
}
