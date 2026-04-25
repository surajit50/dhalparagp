import { NextResponse } from "next/server";

import { signOut } from "next-auth/react";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Sign out the user
    await signOut({ redirect: false });

    return NextResponse.json(
      { success: true, message: "Successfully signed out" },
      { status: 200 }
    );

  } catch (error) {
    console.error("[MOBILE_SIGNOUT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 