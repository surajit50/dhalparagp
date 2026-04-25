"use server";

import { db } from "@/lib/db";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { NewPasswordSchema } from "@/schema";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserEmail } from "@/data/user";

export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null
) => {
  if (!token) {
    return { error: "Missing Token" };
  }

  const validateField = NewPasswordSchema.safeParse(values);

  if (!validateField.success) {
    return { error: "Invalid Email" };
  }

  const { password } = validateField.data;

  const exitingToken = await getPasswordResetTokenByToken(token);

  if (!exitingToken) {
    return { error: "token not found" };
  }

  const existingUser = await getUserEmail(exitingToken.email);

  if (!existingUser) {
    return { error: "Email does not exist" };
  }

  const hasExpired = new Date(exitingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired" };
  }

  const hasHedpassword = await bcrypt.hash(password, 10);

  try {
    await db.user.update({
      where: { id: existingUser.id },
      data: { password: hasHedpassword },
    });
  } catch (error) {
    console.error("Password reset update error:", error);
    return { error: "Failed to update password. User record might be missing." };
  }

  await db.passwordResetToken.delete({
    where: { id: exitingToken.id },
  });

  return { success: "Password changed update" };
};
