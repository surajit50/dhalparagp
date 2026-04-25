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
    const billAbstractId = searchParams.get("billAbstractId");
    const latest = searchParams.get("latest");

    if (latest === "true") {
      // Get latest deduction for this user
      const deduction = await db.workBillDeduction.findFirst({
        where: {
          userId: session.user.id,
        },
        include: {
          workBillAbstract: {
            include: {
              entries: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json(deduction);
    } else if (billAbstractId) {
      // Get deduction for specific bill abstract
      const deduction = await db.workBillDeduction.findFirst({
        where: {
          userId: session.user.id,
          workBillAbstractId: billAbstractId,
        },
        include: {
          workBillAbstract: {
            include: {
              entries: true,
            },
          },
        },
      });

      return NextResponse.json(deduction);
    } else {
      // Get all deductions for this user
      const deductions = await db.workBillDeduction.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          workBillAbstract: {
            include: {
              entries: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json(deductions);
    }
  } catch (error) {
    console.error("Error fetching bill deductions:", error);
    return NextResponse.json(
      { error: "Failed to fetch bill deductions" },
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
    const {
      billAbstractId,
      grossBillAmount,
      deductions,
      totalDeduction,
      netPayable,
      billPaymentDate,
      eGramVoucher,
      eGramVoucherDate,
      gpmsVoucherNumber,
      gpmsVoucherDate,
    } = body;

    if (!billAbstractId || !grossBillAmount || !deductions) {
      return NextResponse.json(
        { error: "Missing required fields: billAbstractId, grossBillAmount, or deductions" },
        { status: 400 }
      );
    }

    // Verify bill abstract exists
    const billAbstract = await db.workBillAbstract.findUnique({
      where: { id: billAbstractId },
    });

    if (!billAbstract) {
      return NextResponse.json(
        { error: "Bill abstract not found" },
        { status: 404 }
      );
    }

    // Check if deduction already exists for this bill abstract
    const existingDeduction = await db.workBillDeduction.findFirst({
      where: {
        userId: userId,
        workBillAbstractId: billAbstractId,
      },
    });

    if (existingDeduction) {
      return NextResponse.json(
        { error: "Bill deduction already exists for this bill abstract" },
        { status: 400 }
      );
    }

    // Calculate CGST and SGST from GST TDS (split equally)
    const gstTdsAmount = deductions.gstTds?.amount || 0;
    const cgstAmount = gstTdsAmount / 2;
    const sgstAmount = gstTdsAmount / 2;

    // Convert date strings to Date objects or null
    const parseDate = (dateStr: string | null | undefined) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    };

    // Create WorkBillDeduction entry - completely independent model
    const billDeduction = await db.workBillDeduction.create({
      data: {
        userId: userId,
        workBillAbstractId: billAbstractId,
        billType: "1st & Final Bill",
        billPaymentDate: parseDate(billPaymentDate),
        eGramVoucher: eGramVoucher || "",
        eGramVoucherDate: parseDate(eGramVoucherDate),
        gpmsVoucherNumber: gpmsVoucherNumber || "",
        gpmsVoucherDate: parseDate(gpmsVoucherDate),
        grossBillAmount: grossBillAmount,
        lessIncomeTaxPercentage: deductions.incomeTax?.percentage || 0,
        lessIncomeTaxAmount: deductions.incomeTax?.amount || 0,
        lessGstTdsPercentage: deductions.gstTds?.percentage || 0,
        lessGstTdsAmount: gstTdsAmount,
        lessCgstAmount: cgstAmount,
        lessSgstAmount: sgstAmount,
        lessLabourWelfareCessPercentage: deductions.labourWelfareCess?.percentage || 0,
        lessLabourWelfareCessAmount: deductions.labourWelfareCess?.amount || 0,
        lessSecurityDepositPercentage: deductions.securityDeposit?.percentage || 0,
        lessSecurityDepositAmount: deductions.securityDeposit?.amount || 0,
        totalDeduction: totalDeduction || 0,
        netPayableAmount: netPayable || 0,
        isFinalBill: true,
        isVerified: false,
      },
    });

    revalidatePath("/admindashboard/work-manage/bill-deduction");

    return NextResponse.json({
      success: true,
      data: billDeduction,
      message: "Bill deduction saved successfully",
    });
  } catch (error) {
    console.error("Error saving bill deduction:", error);
    return NextResponse.json(
      { error: "Failed to save bill deduction" },
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

    const userId = session.user.id;
    const body = await request.json();
    const {
      id,
      grossBillAmount,
      deductions,
      totalDeduction,
      netPayable,
      billPaymentDate,
      eGramVoucher,
      eGramVoucherDate,
      gpmsVoucherNumber,
      gpmsVoucherDate,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Deduction ID is required for update" },
        { status: 400 }
      );
    }

    const existing = await db.workBillDeduction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Bill deduction not found" },
        { status: 404 }
      );
    }

    const gstTdsAmount = deductions?.gstTds?.amount ?? existing.lessGstTdsAmount;
    const cgstAmount = gstTdsAmount / 2;
    const sgstAmount = gstTdsAmount / 2;

    const parseDate = (dateStr: string | null | undefined) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    };

    const billDeduction = await db.workBillDeduction.update({
      where: { id },
      data: {
        billPaymentDate: billPaymentDate !== undefined ? parseDate(billPaymentDate) : existing.billPaymentDate,
        eGramVoucher: eGramVoucher !== undefined ? (eGramVoucher || "") : existing.eGramVoucher,
        eGramVoucherDate: eGramVoucherDate !== undefined ? parseDate(eGramVoucherDate) : existing.eGramVoucherDate,
        gpmsVoucherNumber: gpmsVoucherNumber !== undefined ? (gpmsVoucherNumber || "") : existing.gpmsVoucherNumber,
        gpmsVoucherDate: gpmsVoucherDate !== undefined ? parseDate(gpmsVoucherDate) : existing.gpmsVoucherDate,
        grossBillAmount: grossBillAmount ?? existing.grossBillAmount,
        lessIncomeTaxPercentage: deductions?.incomeTax?.percentage ?? existing.lessIncomeTaxPercentage,
        lessIncomeTaxAmount: deductions?.incomeTax?.amount ?? existing.lessIncomeTaxAmount,
        lessGstTdsPercentage: deductions?.gstTds?.percentage ?? existing.lessGstTdsPercentage,
        lessGstTdsAmount: gstTdsAmount,
        lessCgstAmount: cgstAmount,
        lessSgstAmount: sgstAmount,
        lessLabourWelfareCessPercentage: deductions?.labourWelfareCess?.percentage ?? existing.lessLabourWelfareCessPercentage,
        lessLabourWelfareCessAmount: deductions?.labourWelfareCess?.amount ?? existing.lessLabourWelfareCessAmount,
        lessSecurityDepositPercentage: deductions?.securityDeposit?.percentage ?? existing.lessSecurityDepositPercentage,
        lessSecurityDepositAmount: deductions?.securityDeposit?.amount ?? existing.lessSecurityDepositAmount,
        totalDeduction: totalDeduction ?? existing.totalDeduction,
        netPayableAmount: netPayable ?? existing.netPayableAmount,
      },
    });

    revalidatePath("/admindashboard/work-manage/bill-deduction");

    return NextResponse.json({
      success: true,
      data: billDeduction,
      message: "Bill deduction updated successfully",
    });
  } catch (error) {
    console.error("Error updating bill deduction:", error);
    return NextResponse.json(
      { error: "Failed to update bill deduction" },
      { status: 500 }
    );
  }
}
