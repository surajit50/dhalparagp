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
    const latest = searchParams.get("latest");

    if (latest === "true") {
      const billAbstract = await db.workBillAbstract.findFirst({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          entries: true,
        },
      });

      return NextResponse.json(billAbstract);
    } else {
      // If workId is provided, filter by it and get the latest one
      const workId = searchParams.get("workId");

      if (workId) {
        const billAbstract = await db.workBillAbstract.findFirst({
          where: {
            userId: session.user.id,
            worksDetailId: workId,
          },
          include: {
            entries: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        // Return as array for consistency or single object?
        // Current frontend expects array for fetchWorks but fetchBillAbstract expects array?
        // Let's check frontend. Frontend checks `data && data.length > 0` and sets `billEntries`.
        // The original GET returned array. Let's return array [abstract] if found, or []
        return NextResponse.json(billAbstract ? [billAbstract] : []);
      }

      const billAbstracts = await db.workBillAbstract.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          entries: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json(billAbstracts);
    }
  } catch (error) {
    console.error("Error fetching bill abstracts:", error);
    return NextResponse.json(
      { error: "Failed to fetch bill abstracts" },
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

    const body = await request.json();
    const {
      billType,
      period,
      contractualPercentage,
      itemwiseTotal,
      contractualDeduction,
      actualValue,
      grossBillAmount,
      entries,
      workId, // worksDetailId passed as workId
    } = body;

    if (!workId) {
      return NextResponse.json(
        { error: "Work ID is required" },
        { status: 400 }
      );
    }

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: "Missing entries" },
        { status: 400 }
      );
    }

    // Generate bill number
    const billCount = await db.workBillAbstract.count({
      where: {
        userId: session.user.id,
      },
    });
    const billNumber = `BILL-${billCount + 1}`;

    // Create bill abstract with entries
    const billAbstract = await db.workBillAbstract.create({
      data: {
        userId: session.user.id,
        worksDetailId: workId,
        billNumber,
        billType: billType || "1st & Final Bill",
        period: period || "",
        contractualPercentage: contractualPercentage || 0,
        itemwiseTotal: itemwiseTotal || 0,
        contractualDeduction: contractualDeduction || 0,
        actualValue: actualValue || 0,
        grossBillAmount: grossBillAmount || 0,
        entries: {
          create: entries.map((entry: any) => ({
            mbNumber: entry.mbNumber,
            mbPageNumber: entry.mbPageNumber,
            workItemDescription: entry.workItemDescription,
            unit: entry.unit,
            quantityExecuted: entry.quantityExecuted,
            rate: entry.rate,
            amount: entry.amount,
            remarks: entry.remarks || null,
            estimateItemId: entry.estimateItemId || null,
            subItemId: entry.subItemId || null,
            mbEntryId: entry.mbEntryId || null,
          })),
        },
      },
      include: {
        entries: true,
      },
    });

    revalidatePath("/admindashboard/work-manage/bill-abstract");

    return NextResponse.json({
      success: true,
      data: billAbstract,
      message: "Bill abstract saved successfully",
    });
  } catch (error) {
    console.error("Error saving bill abstract:", error);
    return NextResponse.json(
      { error: "Failed to save bill abstract" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      billType,
      period,
      contractualPercentage,
      itemwiseTotal,
      contractualDeduction,
      actualValue,
      grossBillAmount,
      entries,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Bill abstract ID is required for update" },
        { status: 400 }
      );
    }

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: "Missing entries" },
        { status: 400 }
      );
    }

    const existing = await db.workBillAbstract.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: { entries: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Bill abstract not found" },
        { status: 404 }
      );
    }

    const results = await db.$transaction([
      db.workBillAbstractEntry.deleteMany({
        where: { workBillAbstractId: id },
      }),
      db.workBillAbstract.update({
        where: { id },
        data: {
          billType: billType ?? existing.billType,
          period: period ?? existing.period,
          contractualPercentage: contractualPercentage ?? existing.contractualPercentage,
          itemwiseTotal: itemwiseTotal ?? existing.itemwiseTotal,
          contractualDeduction: contractualDeduction ?? existing.contractualDeduction,
          actualValue: actualValue ?? existing.actualValue,
          grossBillAmount: grossBillAmount ?? existing.grossBillAmount,
          entries: {
            create: entries.map((entry: any) => ({
              mbNumber: entry.mbNumber,
              mbPageNumber: entry.mbPageNumber,
              workItemDescription: entry.workItemDescription,
              unit: entry.unit,
              quantityExecuted: entry.quantityExecuted,
              rate: entry.rate,
              amount: entry.amount,
              remarks: entry.remarks || null,
              estimateItemId: entry.estimateItemId || null,
              subItemId: entry.subItemId || null,
              mbEntryId: entry.mbEntryId || null,
            })),
          },
        },
        include: { entries: true },
      }),
    ]);
    const updated = results[1];

    revalidatePath("/admindashboard/work-manage/bill-abstract");

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Bill abstract updated successfully",
    });
  } catch (error) {
    console.error("Error updating bill abstract:", error);
    return NextResponse.json(
      { error: "Failed to update bill abstract" },
      { status: 500 }
    );
  }
}
