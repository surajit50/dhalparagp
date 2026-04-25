"use server";
import * as z from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { leaveSchema } from "@/schema/leaveSchema";

export const leaveApplication = async (values: z.infer<typeof leaveSchema>) => {
  try {
    const validateField = leaveSchema.safeParse(values);

    if (!validateField.success) {
      return { error: "Invalid fields !" };
    }
    const { startDate, endDate, reason, leaveType } = validateField.data;

    const user = await currentUser();
    if (!user) {
      throw new Error("User not found");
    }

    if (startDate >= endDate) {
      return { error: "End date must be after start date." };
    }

    const userId = user.id || "";

    // Calculate duration in days
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const durationInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leaveApp = await db.leave.create({
      data: {
        startDate,
        endDate,
        reason,
        leaveType,
        durationInDays,
        userId,
      },
    });
    console.log(leaveApp);
    return { success: "leave applied suceffuly" };
  } catch (error) {
    console.log(error);
    return { error: "Error" };
  }
};

export const updateLeaveStatus = async (id: string, status: "approved" | "rejected") => {
  try {
    const user = await currentUser();
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return { error: "Unauthorized! Only admins can update leave status." };
    }

    const leave = await db.leave.findUnique({
      where: { id },
    });

    if (!leave) {
      return { error: "Leave application not found." };
    }

    await db.leave.update({
      where: { id },
      data: {
        status,
        approverId: user.id,
      },
    });

    // Optional: Add notification for the user
    await db.notification.create({
      data: {
        userId: leave.userId,
        message: `Leave Application ${status.toUpperCase()}: Your leave application from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been ${status}.`,
        type: status === "approved" ? "SUCCESS" : "ERROR",
        link: "/employeedashboard/leave/history",
      },
    });

    return { success: `Leave application ${status} successfully.` };
  } catch (error) {
    console.log(error);
    return { error: "Failed to update leave status." };
  }
};
