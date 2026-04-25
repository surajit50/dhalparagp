import { db } from "@/lib/db";
import { NextRequest } from "next/server";
// Excel export functionality removed as per request

export async function GET() {
  return new Response(
    JSON.stringify({ message: "Excel export is not available." }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}