import { db } from "./db";

export const staffoption = async () => {
  const staff = await db.user.findMany({
    where: {
      role: "staff",
    },
    select: {
      id: true,
      name: true,
    },
  });

  return staff;
};
