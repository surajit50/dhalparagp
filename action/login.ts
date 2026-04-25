"use server";

import * as z from "zod";
import { LoginSchema } from "@/schema";

import { signIn } from "@/auth";

import {
  DEFAULT_LOGIN_REDIRECT,
  DEFAULT_ADMINLOGIN_REDIRECT,
  DEFAULT_STAFFLOGIN_REDIRECT,
  DEFAULT_AGENCYLOGIN_REDIRECT,
  DEFAULT_SUPERADMINLOGIN_REDIRECT,
} from "@/routes";

import { AuthError } from "next-auth";

import { getUserEmail } from "@/data/user";

import {
  generateTwoFactorToken,
  generateVerificationToken,
} from "@/lib/token";

import {
  sendTwoFactorTokenEmail,
  sendVerificationEmail,
  sendLoginAttemptAlertEmail,
} from "@/lib/mail";

import { getTwoFactorTokenEmail } from "@/data/two-factor-token";
import { getTwoFactorConfirmByUserId } from "@/data/two-factor-confirm";

import { db } from "@/lib/db";

import { headers } from "next/headers";
import bcrypt from "bcryptjs";

//////////////////////////////////////////////////////////
// SETTINGS
//////////////////////////////////////////////////////////

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;

const MAX_IP_ATTEMPTS = 10;
const IP_BLOCK_MINUTES = 30;

//////////////////////////////////////////////////////////
// GET CLIENT IP
//////////////////////////////////////////////////////////

async function getClientIP(): Promise<string> {
  const headersList = await headers();

  // Common headers for client IP in order of preference
  const ipHeaders = [
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip", // Cloudflare
    "client-ip",
    "x-client-ip",
    "x-cluster-client-ip",
  ];

  for (const headerName of ipHeaders) {
    const value = headersList.get(headerName);
    if (value) {
      // x-forwarded-for can contain multiple IPs, the first one is the client
      let ip = value;
      if (headerName === "x-forwarded-for") {
        ip = value.split(",")[0].trim();
      } else {
        ip = value.trim();
      }

      if (ip) {
        // Normalize IPv6 loopback (::1) to IPv4 (127.0.0.1)
        if (ip === "::1") return "127.0.0.1";
        return ip;
      }
    }
  }

  // Fallback to localhost if no headers are present
  return "127.0.0.1";
}

//////////////////////////////////////////////////////////
// GET LOCATION FROM IP
//////////////////////////////////////////////////////////

async function getLocationFromIP(ip: string): Promise<string> {
  if (ip === "127.0.0.1" || ip === "::1" || ip === "unknown") {
    return "Localhost / Internal Network";
  }

  try {
    // Using ip-api.com (free for non-commercial use, no API key required for basic info)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city`);
    
    if (!response.ok) {
      return "Unknown location (API unavailable)";
    }

    const data = await response.json();

    if (data.status === "success") {
      return `${data.city}, ${data.regionName}, ${data.country}`;
    }

    return "Unknown location";
  } catch (error) {
    console.error("Error fetching location from IP:", error);
    return "Unknown location (Error)";
  }
}

//////////////////////////////////////////////////////////
// RECORD LOGIN ATTEMPT
//////////////////////////////////////////////////////////

async function recordLoginAttempt(
  email: string,
  ipAddress: string,
  success: boolean
) {
  await db.loginAttempt.create({
    data: {
      email,
      ipAddress,
      success,
    },
  });
}

//////////////////////////////////////////////////////////
// HANDLE FAILED LOGIN
//////////////////////////////////////////////////////////

async function handleFailedLogin(
  user: any,
  ipAddress: string,
  userAgent?: string
) {
  const attempts = user.failedLoginAttempts + 1;
  const isLocking = attempts >= MAX_FAILED_ATTEMPTS;
  const location = await getLocationFromIP(ipAddress);

  // Always send an alert on failure
  sendLoginAttemptAlertEmail(
    user.email,
    user.name || "User",
    ipAddress,
    new Date(),
    location,
    userAgent,
    isLocking // Pass true if the account is being locked
  ).catch(console.error);

  if (isLocking) {
    try {
      await db.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0, // Reset on lock
          lockoutExpiry: new Date(Date.now() + LOCK_TIME_MINUTES * 60000),
        },
      });
    } catch (error) {
      console.error("Lockout update error:", error);
    }
    return {
      error: `Your account has been locked for ${LOCK_TIME_MINUTES} minutes due to multiple failed login attempts.`,
    };
  }

  // Otherwise, just increment the attempt count
  try {
    await db.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: attempts },
    });
  } catch (error) {
    console.error("Failed login attempts update error:", error);
  }

  await recordLoginAttempt(user.email, ipAddress, false);

  // IP block check (remains the same)
  const failedCount = await db.loginAttempt.count({
    where: {
      ipAddress,
      success: false,
      createdAt: {
        gte: new Date(Date.now() - 10 * 60 * 1000),
      },
    },
  });

  if (failedCount >= MAX_IP_ATTEMPTS) {
    await db.blockedIP.upsert({
      where: { ipAddress },
      update: {
        expiresAt: new Date(Date.now() + IP_BLOCK_MINUTES * 60000),
      },
      create: {
        ipAddress,
        expiresAt: new Date(Date.now() + IP_BLOCK_MINUTES * 60000),
      },
    });
  }

  const remainingAttempts = MAX_FAILED_ATTEMPTS - attempts;
  return {
    error: `Invalid email or password. ${remainingAttempts} attempt(s) remaining.`,
  };
}

//////////////////////////////////////////////////////////
// LOGIN FUNCTION
//////////////////////////////////////////////////////////

export const login = async (
  values: z.infer<typeof LoginSchema>
) => {
  // Validate input
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid input fields." };
  }

  const { email, password, code } = validatedFields.data;

  // Get IP and user agent
  const ipAddress = await getClientIP();
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "Unknown";

  // Check IP block
  const blockedIP = await db.blockedIP.findUnique({
    where: { ipAddress },
  });
  if (blockedIP && blockedIP.expiresAt && blockedIP.expiresAt > new Date()) {
    const remainingMinutes = Math.ceil(
      (blockedIP.expiresAt.getTime() - Date.now()) / 60000
    );
    return {
      error: `Too many failed login attempts. Your IP is blocked for ${remainingMinutes} minutes.`,
    };
  }

  // Find user
  const existingUser = await getUserEmail(email);
  if (!existingUser || !existingUser.email || !existingUser.password) {
    await recordLoginAttempt(email, ipAddress, false);
    return {
      error: "No account found with this email address.",
    };
  }

  // Account lock check
  if (existingUser.lockoutExpiry && existingUser.lockoutExpiry > new Date()) {
    const remainingMinutes = Math.ceil(
      (existingUser.lockoutExpiry.getTime() - Date.now()) / 60000
    );
    return {
      error: `Your account is locked. Try again after ${remainingMinutes} minutes.`,
    };
  }

  // Password validation
  const passwordMatch = await bcrypt.compare(password, existingUser.password);
  if (!passwordMatch) {
    return await handleFailedLogin(existingUser, ipAddress, userAgent);
  }

  // Email verification (only after correct password)
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );
    return {
      success:
        "Verification email sent. Please check your inbox to verify your account.",
    };
  }

  // Two-factor authentication (only after correct password)
  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenEmail(existingUser.email);
      if (!twoFactorToken || twoFactorToken.token !== code) {
        return { error: "Invalid verification code." };
      }
      if (new Date(twoFactorToken.expires) < new Date()) {
        return { error: "Verification code expired." };
      }

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

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
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(
        twoFactorToken.email,
        twoFactorToken.token
      );
      return { twoFactor: true };
    }
  }

  // Sign in (all validations passed)
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // Reset failed attempts on success
    try {
      await db.user.update({
        where: { id: existingUser.id },
        data: {
          failedLoginAttempts: 0,
          lockoutExpiry: null,
        },
      });
    } catch (error) {
      console.error("Success login update error:", error);
      // We don't return error here because the user is already signed in
    }

    await recordLoginAttempt(email, ipAddress, true);

    // Role redirect
    const roleRedirects = {
      admin: DEFAULT_ADMINLOGIN_REDIRECT,
      staff: DEFAULT_STAFFLOGIN_REDIRECT,
      agency: DEFAULT_AGENCYLOGIN_REDIRECT,
      superadmin: DEFAULT_SUPERADMINLOGIN_REDIRECT,
      default: DEFAULT_LOGIN_REDIRECT,
    };
    const redirectUrl =
      roleRedirects[existingUser.role as keyof typeof roleRedirects] ||
      roleRedirects.default;

    return { success: "Login successful.", redirectUrl };
  } catch (error) {
    if (error instanceof AuthError) {
      return await handleFailedLogin(existingUser, ipAddress, userAgent);
    }
    return { error: "Something went wrong. Please try again." };
  }
};

export const resendTwoFactorCode = async (email: string) => {
  const existingUser = await getUserEmail(email);
  if (!existingUser || !existingUser.email) {
    throw new Error("Email not found");
  }
  if (!existingUser.isTwoFactorEnabled) {
    throw new Error("Two-factor not enabled");
  }
  const twoFactorToken = await generateTwoFactorToken(existingUser.email);
  await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);
};
