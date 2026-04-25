"use server";

import { UserRole } from "@prisma/client"; // Ensure UserRole is imported
import { auth } from "@/auth";
import { db } from "./db";

export const currentUser = async () => {
  const session = await auth();

  return session?.user;
};

export const currentRole = async () => {
  const session = await auth();

  return session?.user?.role;
};

export const bidagencybyid = async (id: string) => {
  const bidder = await db.bidagency.findUnique({
    where: {
      id: id,
    },
    include: {
      agencydetails: true,
    },
  });

  return bidder;
};

export async function createNotification(userId: string, message: string) {
  return await db.notification.create({
    data: {
      userId,
      message,
    },
  });
}

export async function createMessage(
  senderId: string,
  recipientId: string,
  content: string
) {
  return await db.message.create({
    data: {
      senderId,
      recipientId,
      content,
    },
  });
}

export async function notifyUsers(actionUserId: string, message: string) {
  const actionUser = await db.user.findUnique({
    where: { id: actionUserId },
  });

  if (!actionUser) {
    throw new Error("User not found");
  }

  const notifyRole: UserRole[] =
    actionUser.role === UserRole.admin
      ? [UserRole.staff, UserRole.user]
      : [UserRole.admin];

  const usersToNotify = await db.user.findMany({
    where: { role: { in: notifyRole } },
  });

  const notifications = usersToNotify.map((user) =>
    createNotification(user.id, message)
  );

  await Promise.all(notifications);

  return notifications;
}

export async function getworklenthbynitno(nitno: number, nitid: string) {
  const workLength = await db.nitDetails.findUnique({
    where: {
      id: nitid,
      memoNumber: nitno,
    },
    select: {
      WorksDetail: true,
    },
  });

  return workLength?.WorksDetail.length;
}
