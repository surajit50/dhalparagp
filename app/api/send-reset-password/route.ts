import { sendResetPasswordEmail } from "@/lib/mail";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generatePasswordToken } from "@/lib/token";
import { getUserEmail } from "@/data/user";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await getUserEmail(email);

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "Email not found" },
        { status: 404 }
      );
    }

    // Generate password reset token
    const passwordResetToken = await generatePasswordToken(email);

    // Send reset email
    await sendResetPasswordEmail(
      passwordResetToken.email,
      passwordResetToken.token
    );

    return NextResponse.json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Error sending reset password email:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to send password reset email",
      },
      { status: 500 }
    );
  }
}
