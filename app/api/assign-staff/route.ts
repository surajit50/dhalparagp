import { assignStaff } from "@/action/warishApplicationAction";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await assignStaff(formData);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in assign-staff API:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to assign staff",
      },
      { status: 500 }
    );
  }
}
