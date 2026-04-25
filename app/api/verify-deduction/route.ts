import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// GET: Fetch unverified deductions
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const verified = searchParams.get("verified");

        const whereClause = verified === "true"
            ? { isVerified: true }
            : verified === "false"
                ? { isVerified: false }
                : {}; // All deductions if not specified
                

        const deductions = await db.workBillDeduction.findMany({
            where: whereClause,
            include: {
                workBillAbstract: {
                    include: {
                        worksDetail: {
                            include: {
                                ApprovedActionPlanDetails: true,
                                nitDetails: true,
                                AwardofContract: {
                                    include: {
                                        workorderdetails: {
                                            include: {
                                                Bidagency: {
                                                    include: {
                                                        agencydetails: true,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(deductions);
    } catch (error) {
        console.error("Error fetching deductions:", error);
        return NextResponse.json(
            { error: "Failed to fetch deductions" },
            { status: 500 }
        );
    }
}

// POST: Verify a deduction
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            deductionId,
            billPaymentDate,
            eGramVoucher,
            eGramVoucherDate,
            gpmsVoucherNumber,
            gpmsVoucherDate,
            mbrefno,
            createPaymentDetails = false,
        } = body;

        if (!deductionId) {
            return NextResponse.json(
                { error: "Missing required field: deductionId" },
                { status: 400 }
            );
        }

        // Fetch the deduction to verify it exists
        const deduction = await db.workBillDeduction.findUnique({
            where: { id: deductionId },
            include: {
                workBillAbstract: {
                    include: {
                        worksDetail: true,
                    },
                },
            },
        });

        if (!deduction) {
            return NextResponse.json(
                { error: "Deduction not found" },
                { status: 404 }
            );
        }

        if (deduction.isVerified) {
            return NextResponse.json(
                { error: "Deduction is already verified" },
                { status: 400 }
            );
        }

        // Update the deduction with verification and voucher details
        const updatedDeduction = await db.workBillDeduction.update({
            where: { id: deductionId },
            data: {
                isVerified: true,
                verifiedBy: session.user.id,
                verifiedAt: new Date(),
                billPaymentDate: billPaymentDate ? new Date(billPaymentDate) : undefined,
                eGramVoucher: eGramVoucher || "",
                eGramVoucherDate: eGramVoucherDate ? new Date(eGramVoucherDate) : undefined,
                gpmsVoucherNumber: gpmsVoucherNumber || "",
                gpmsVoucherDate: gpmsVoucherDate ? new Date(gpmsVoucherDate) : undefined,
            },
        });

        let paymentDetails = null;

        // Optionally create PaymentDetails entry
        if (createPaymentDetails) {
            // Create the related deduction records
            const incomeTax = await db.incomeTaxRegister.create({
                data: {
                    incomeTaaxAmount: Math.round(deduction.lessIncomeTaxAmount),
                    paid: false,
                },
            });

            const labourCess = await db.labourWelfareCess.create({
                data: {
                    labourWelfarecessAmt: Math.round(deduction.lessLabourWelfareCessAmount),
                    paid: false,
                },
            });

            const tdsCgst = await db.tdsCgst.create({
                data: {
                    tdscgstAmt: Math.round(deduction.lessCgstAmount),
                    paid: false,
                },
            });

            const tdsSgst = await db.tdsSgst.create({
                data: {
                    tdsSgstAmt: Math.round(deduction.lessSgstAmount),
                    paid: false,
                },
            });

            const securityDeposit = await db.secrutityDeposit.create({
                data: {
                    securityDepositAmt: Math.round(deduction.lessSecurityDepositAmount),
                    paymentstatus: "unpaid",
                },
            });

            // Create PaymentDetails - FIX: Only use worksDetailId, not both worksDetailId and WorksDetail connect
            paymentDetails = await db.paymentDetails.create({
                data: {
                    worksDetailId: deduction.workBillAbstract.worksDetailId,
                    grossBillAmount: Math.round(deduction.grossBillAmount),
                    billType: deduction.billType,
                    mbrefno: mbrefno || deduction.workBillAbstract.billNumber,
                    netAmt: Math.round(deduction.netPayableAmount),
                    billPaymentDate: billPaymentDate ? new Date(billPaymentDate) : new Date(),
                    eGramVoucher: eGramVoucher || "",
                    eGramVoucherDate: eGramVoucherDate ? new Date(eGramVoucherDate) : new Date(),
                    gpmsVoucherNumber: gpmsVoucherNumber || "",
                    gpmsVoucherDate: gpmsVoucherDate ? new Date(gpmsVoucherDate) : new Date(),
                    isfinalbill: deduction.isFinalBill,
                    isVerified: true,
                    incomeTaxRegisterId: incomeTax.id,
                    labourWelfareCessId: labourCess.id,
                    tdsCgstId: tdsCgst.id,
                    tdsSgstId: tdsSgst.id,
                    secrutityDepositId: securityDeposit.id,
                },
            });

            // Only update work status if payment details were created
            await db.worksDetail.update({
                where: { id: deduction.workBillAbstract.worksDetailId },
                data: {
                    workStatus: "billpaid",
                    paymentDetails: {
                        connect: { id: paymentDetails.id },
                    },
                },
            });
        }

        revalidatePath("/admindashboard/verify-deduction");
        revalidatePath("/admindashboard/addpaymentdetails");

        return NextResponse.json({
            success: true,
            data: {
                deduction: updatedDeduction,
                paymentDetails,
            },
            message: createPaymentDetails
                ? "Deduction verified and payment details created successfully"
                : "Deduction verified successfully",
        });
    } catch (error) {
        console.error("Error verifying deduction:", error);
        return NextResponse.json(
            { error: "Failed to verify deduction" },
            { status: 500 }
        );
    }
}
