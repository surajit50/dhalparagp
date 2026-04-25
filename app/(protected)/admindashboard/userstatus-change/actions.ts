"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const activateAllUsers = async () => {
  "use server";
  try {
    await db.user.updateMany({
      where: {
        role: {
          in: ["user", "staff"],
        },
      },
      data: {
        userStatus: "active",
      },
    });
    revalidatePath("/admindashboard/userstatus-change");
    return { success: "All users have been activated" };
  } catch (error) {
    return { error: "Failed to activate all users" };
  }
};

export const deactivateAllUsers = async () => {
  "use server";
  try {
    await db.user.updateMany({
      where: {
        role: {
          in: ["user", "staff"],
        },
      },
      data: {
        userStatus: "inactive",
      },
    });
    revalidatePath("/admindashboard/userstatus-change");
    return { success: "All users have been deactivated" };
  } catch (error) {
    return { error: "Failed to deactivate all users" };
  }
};

export const toggleUserStatus = async (
  userId: string,
  currentStatus: "active" | "inactive"
) => {
  "use server";
  try {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await db.user.update({
      where: { id: userId },
      data: { userStatus: newStatus },
    });
    revalidatePath("/admindashboard/userstatus-change");
    return { success: `User status has been changed to ${newStatus}` };
  } catch (error) {
    return { error: "Failed to update user status" };
  }
};
