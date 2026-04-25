"use server";

import * as z from "zod";
import { LoginSchema } from "@/schema";
import { signIn } from "@/auth";
import { DEFAULT_ADMINLOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { getUserEmail } from "@/data/user";
import { generateTwoFactorToken, generateVerificationToken } from "@/lib/token";
import { sendTwoFactorTokenEmail, sendVerificationEmail } from "@/lib/mail";
import { getTwoFactorTokenEmail } from "@/data/two-factor-token";
import { getTwoFactorConfirmByUserId } from "@/data/two-factor-confirm";
import { db } from "@/lib/db";

export const adminLoginAction = async (values: z.infer<typeof LoginSchema>) => {
  // Validate input fields
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, code } = validatedFields.data;

  // Check if user exists
  const existingUser = await getUserEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email does not exist" };
  }

  // Handle email verification
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );
    return { success: "Confirmation email sent" };
  }

  // Handle two-factor authentication
  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      // Validate two-factor code
      const twoFactorToken = await getTwoFactorTokenEmail(existingUser.email);

      if (!twoFactorToken || twoFactorToken.token !== code) {
        return { error: "Invalid code" };
      }

      if (new Date(twoFactorToken.expires) < new Date()) {
        return { error: "Code expired" };
      }

      // Clean up used token and create confirmation
      await db.twoFactorToken.delete({ where: { id: twoFactorToken.id } });

      const existingConfirmation = await getTwoFactorConfirmByUserId(
        existingUser.id
      );
      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await db.twoFactorConfirmation.create({
        data: { userId: existingUser.id },
      });
    } else {
      // Generate and send new two-factor token
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);
      return { twoFactor: true };
    }
  }

  // Attempt to sign in
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_ADMINLOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    throw error;
  }

  return { success: "Logged in successfully" };
};
