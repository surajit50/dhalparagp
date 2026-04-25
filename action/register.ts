"use server";

import * as z from "zod";
import { RegisterSchema } from "@/schema";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getUserEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";

type RegisterInput = z.infer<typeof RegisterSchema>;
type RegisterResult = { error?: string; success?: string };

export const register = async (values: RegisterInput): Promise<RegisterResult> => {
  const parseResult = RegisterSchema.safeParse(values) as z.SafeParseReturnType<RegisterInput, RegisterInput>;

  if (!parseResult.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name, mobileNumber } = parseResult.data;

  try {
    const normalizedEmail = email.toLowerCase();
    const existingUser = await getUserEmail(normalizedEmail);

    if (existingUser) {
      return { error: "Email is already in use!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        mobileNumber,
        email: normalizedEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true
      }
    });

    if (!user.email) {
      return { error: "Registration failed - email not set" };
    }

    const verificationToken = await generateVerificationToken(user.email);
    await sendVerificationEmail(
      verificationToken.email, 
      verificationToken.token
    );

    return { success: "Confirmation email sent" };

  } catch (error) {
    console.error("Registration error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
};
