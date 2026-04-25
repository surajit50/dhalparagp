import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workId = searchParams.get("workId");

    if (workId) {
      // Fetch estimate for specific work
      const items = await db.workEstimateItem.findMany({
        where: {
          userId: session.user.id,
          workDetailId: workId,
        },
        orderBy: {
          slNo: "asc",
        },
      });

      // Fetch project info from WorkEstimate
      const workEstimate = await db.workEstimate.findUnique({
        where: {
          workDetailId: workId,
        },
      });

      if (items.length === 0 && !workEstimate) {
        return NextResponse.json(null);
      }

      return NextResponse.json({
        items,
        projectInfo: workEstimate
          ? {
              projectName: workEstimate.projectName,
              projectCode: workEstimate.projectCode,
              location: workEstimate.location,
              preparedBy: workEstimate.preparedBy,
              date: workEstimate.estimateDate.toISOString().split("T")[0],
            }
          : {
              projectName: "",
              projectCode: "",
              location: "",
              preparedBy: "",
              date: new Date().toISOString().split("T")[0],
            },
        contingency: workEstimate?.contingency || 0,
      });
    }

    // Fallback: fetch all estimate items for user (for backward compatibility)
    const estimateItems = await db.workEstimateItem.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        slNo: "asc",
      },
    });

    return NextResponse.json(estimateItems);
  } catch (error) {
    console.error("Error fetching estimate items:", error);
    return NextResponse.json(
      { error: "Failed to fetch estimate items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { items, workId, projectInfo, contingency } = body; // Add projectInfo and contingency to request body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing items" },
        { status: 400 }
      );
    }

    if (!workId) {
      return NextResponse.json(
        { error: "Missing workId" },
        { status: 400 }
      );
    }

    // Save project info and contingency to WorkEstimate
    if (projectInfo) {
      await db.workEstimate.upsert({
        where: {
          workDetailId: workId,
        },
        update: {
          projectName: projectInfo.projectName,
          projectCode: String(projectInfo.projectCode),
          location: projectInfo.location,
          preparedBy: projectInfo.preparedBy,
          estimateDate: new Date(projectInfo.date),
          contingency: contingency || 0,
        },
        create: {
          workDetailId: workId,
          projectName: projectInfo.projectName,
          projectCode: String(projectInfo.projectCode),
          location: projectInfo.location,
          preparedBy: projectInfo.preparedBy,
          estimateDate: new Date(projectInfo.date),
          contingency: contingency || 0,
        },
      });
    }

    // Check if estimate already exists for this work
    const existingEstimate = await db.workEstimateItem.findFirst({
      where: {
        userId: userId,
        workDetailId: workId,
      },
    });

    if (existingEstimate) {
      // Delete existing items for this work
      await db.workEstimateItem.deleteMany({
        where: {
          userId: userId,
          workDetailId: workId,
        },
      });
    }

    const createdItems = await db.workEstimateItem.createMany({
      data: items.map((item: any) => ({
        userId: userId,
        workDetailId: workId, // Add workId to each item
        slNo: item.slNo,
        schedulePageNo: item.schedulePageNo || "",
        description: item.description,
        nos: item.nos || 1,
        length: item.length || 0,
        breadth: item.breadth || 0,
        depth: item.depth || 0,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.rate,
        amount: item.amount,
        measurements: item.measurements || [],
        subItems: item.subItems || [],
      })),
    });

    revalidatePath("/admindashboard/work-manage/estimate-preparation");

    return NextResponse.json({
      success: true,
      data: createdItems,
      message: "Estimate items saved successfully",
    });
  } catch (error) {
    console.error("Error saving estimate items:", error);
    return NextResponse.json(
      { error: "Failed to save estimate items" },
      { status: 500 }
    );
  }
}
