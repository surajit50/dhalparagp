// app/api/measurement-book/route.ts

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

    const searchParams = request.nextUrl.searchParams;
    const workId = searchParams.get("workId");

    const whereClause: any = {
      userId: session.user.id,
    };

    if (workId) {
      whereClause.workDetailId = workId;
    }

    const rows = await db.workMeasurementBook.findMany({
      where: whereClause,
      orderBy: {
        orderIndex: "asc",
      },
    });

    const mbEntries = rows.map((row: any) => ({
      id: row.id,
      estimateItemId: row.estimateItemId,
      subItemId: row.subItemId ?? undefined,
      mbNumber: row.mbNumber ?? "",
      mbPageNumber: row.mbPageNumber ?? "",
      workItemDescription: row.workItemDescription ?? "",
      unit: row.unit ?? "",
      quantityExecuted: Number(row.quantityExecuted) ?? 0,
      rate: Number(row.rate) ?? 0,
      amount: Number(row.amount) ?? 0,
      measuredDate:
        row.measuredDate instanceof Date
          ? row.measuredDate.toISOString().split("T")[0]
          : String(row.measuredDate ?? "").split("T")[0],
      measuredBy: row.measuredBy ?? "",
      checkedBy: row.checkedBy ?? undefined,
      remarks: row.remarks ?? undefined,
      measurements: Array.isArray(row.measurements)
        ? row.measurements
        : typeof row.measurements === "string"
          ? (() => {
              try {
                const p = JSON.parse(row.measurements);
                return Array.isArray(p) ? p : [p].filter(Boolean);
              } catch {
                return [];
              }
            })()
          : row.measurements != null
            ? [row.measurements].filter(Boolean)
            : [],
      createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
      updatedAt: row.updatedAt?.toISOString?.() ?? row.updatedAt,
    }));

    return NextResponse.json(mbEntries);
  } catch (error) {
    console.error("Error fetching MB entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch MB entries" },
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
    const { workId, entries } = body;

    if (!workId) {
      return NextResponse.json({ error: "Missing workId" }, { status: 400 });
    }

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: "Missing entries" },
        { status: 400 }
      );
    }

    // 🟢 Delete all existing entries for this work before inserting new ones
    await db.workMeasurementBook.deleteMany({
      where: {
        userId: userId,
        workDetailId: workId,
      },
    });

    // Create new MB entries
    const createdEntries = await db.workMeasurementBook.createMany({
      data: entries.map((entry: any, index: number) => ({
        userId: userId,
        workDetailId: workId,
        estimateItemId: entry.estimateItemId,
        subItemId: entry.subItemId || null,
        mbNumber: entry.mbNumber,
        mbPageNumber: entry.mbPageNumber,
        workItemDescription: entry.workItemDescription,
        unit: entry.unit,
        quantityExecuted: entry.quantityExecuted,
        rate: entry.rate,
        amount: entry.amount,
        measurements: entry.measurements || null,
        measuredDate: new Date(entry.measuredDate),
        measuredBy: entry.measuredBy,
        checkedBy: entry.checkedBy || null,
        remarks: entry.remarks || null,
        orderIndex: index,
        status: "DRAFT",
      })),
    });

    revalidatePath("/admindashboard/work-manage/mb-create");

    return NextResponse.json({
      success: true,
      data: createdEntries,
      message: "MB entries saved successfully",
    });
  } catch (error) {
    console.error("Error saving MB entries:", error);
    return NextResponse.json(
      { error: "Failed to save MB entries" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { entries } = body;

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: "Missing entries" }, { status: 400 });
    }

    // Process updates in transaction
    const updatePromises = entries.map((entry: any) =>
      db.workMeasurementBook.update({
        where: { id: entry.id },
        data: {
          mbNumber: entry.mbNumber,
          mbPageNumber: entry.mbPageNumber,
          quantityExecuted: entry.quantityExecuted,
          amount: entry.amount,
          measurements: entry.measurements || null,
          measuredDate: new Date(entry.measuredDate),
          measuredBy: entry.measuredBy,
          checkedBy: entry.checkedBy || null,
          remarks: entry.remarks || null,
        },
      })
    );

    await db.$transaction(updatePromises);

    revalidatePath("/admindashboard/work-manage/mb-create");

    return NextResponse.json({
      success: true,
      message: "MB entries updated successfully",
    });
  } catch (error) {
    console.error("Error updating MB entries:", error);
    return NextResponse.json(
      { error: "Failed to update MB entries" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await db.workMeasurementBook.delete({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    revalidatePath("/admindashboard/work-manage/mb-create");

    return NextResponse.json({
      success: true,
      message: "MB entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting MB entry:", error);
    return NextResponse.json(
      { error: "Failed to delete MB entry" },
      { status: 500 }
    );
  }
}
