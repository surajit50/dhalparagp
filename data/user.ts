import { db } from "@/lib/db";

export const getUserEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string | undefined) => {
  try {
    const user = await db.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  } catch {
    return null;
  }
};

export const getUserByUserRole = async () => {
  try {
    const user = await db.user.findMany({
      where: {
        role: "user",
      },
    });
    return user;
  } catch (error) {}
};

// Curren active prodhan

export const getCurrentActiveProdhan = async () => {
  try {
    const prodhan = await db.activeProdhanDetails.findFirst({
      where: {
        status: "active",
      },
    });

    return prodhan;
  } catch (error) {
    return null;
  }
};
