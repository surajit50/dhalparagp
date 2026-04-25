"use server";
import * as z from "zod";
import { auth } from "@/auth";
import { getUserById } from "@/data/user";
import { changePasswordSchema } from "@/schema";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
export const updateUserPasword = async (
  values: z.infer<typeof changePasswordSchema>
) => {
  const user = await auth();

  const userid = user?.user.id;

  const validateField = changePasswordSchema.safeParse(values);

  if (!validateField.success) {
    return { error: "Please Enter Proper value" };
  }

  const { password, newpassword } = validateField.data;
  const userbyid = await getUserById(userid);
  const hashpasword = userbyid?.password as string;

  const matchpassword = await bcrypt.compare(password, hashpasword);
  if (!matchpassword) {
    return { error: "Current password does not match" };
  }

  const hasnewpassword = await bcrypt.hash(newpassword, 10);

  const users = await db.user.update({
    where: { id: userid },
    data: {
      password: hasnewpassword,
    },
  });
  console.log(users);
  return { success: "Password changed successfully" };
};
