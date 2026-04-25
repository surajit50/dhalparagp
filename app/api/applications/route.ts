import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { WarishApplicationStatus } from "@prisma/client";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");
    const status = searchParams.get("status");

    if (!staffId) {
      return new NextResponse("Staff ID is required", { status: 400 });
    }

    const applications = await db.warishApplication.findMany({
      where: {
        assingstaffId: staffId,
        ...(status && { warishApplicationStatus: status as WarishApplicationStatus }),
      },
      include: {
        User: {
          select: {
            id:true,
            name: true,
            email: true,
          },
        },
        warishDetails: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("[APPLICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 