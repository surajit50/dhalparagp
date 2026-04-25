"use server";

import { auth } from "@/auth";

export async function renewSession() {
  const session = await auth();

  if (!session) {
    return { success: false };
  }

  // Nothing else needed.
  // Client update() will trigger jwt callback
  return { success: true };
}
