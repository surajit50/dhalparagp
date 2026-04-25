import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET(req: Request) {
  try {
    // Generate a random CSRF token
    const token = randomBytes(32).toString('hex');

    // Set the token in a secure HTTP-only cookie
    const response = NextResponse.json(
      { csrfToken: token },
      { status: 200 }
    );

    // Set the CSRF token cookie
    response.cookies.set({
      name: 'csrf-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });

    return response;

  } catch (error) {
    console.error("[MOBILE_CSRF_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 