
"use server";

import { formSchema, FormValues } from "@/schema/formSchema";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Utility function to calculate maturity date (6 months from work completion date or bill date)
const calculateMaturityDate = (
  workCompletionDate: Date | null | undefined,
  billPaymentDate: Date
): Date => {
  const baseDate = workCompletionDate || billPaymentDate;
  const maturityDate = new Date(baseDate);
  maturityDate.setMonth(maturityDate.getMonth() + 6); // Add 6 months
  return maturityDate;
};

export const addPaymentDetails = async (
  values: FormValues,
  worksDetailId: string
) => {
  try {
    console.log("WorksDetailId:", worksDetailId, "Form Values:", values);

    // Validate the form data
    const validatedData = formSchema.safeParse(values);
    if (!validatedData.success) {
      console.error("Validation failed:", validatedData.error);
      return { error: "Invalid fields!" };
    }

    // Check if the work detail exists
    const existingWork = await db.worksDetail.findUnique({
      where: { id: worksDetailId },
    });

    if (!existingWork) {
      console.error("Invalid worksDetailId:", worksDetailId);
      return { error: "Invalid worksDetailId" };
    }

    const currentDate = new Date();

    // Create related records
    const [incomeTax, labourWelfareCess, tdsCgst, tdsSgst, securityDeposit] =
      await Promise.all([
        db.incomeTaxRegister.create({
          data: {
            incomeTaaxAmount: validatedData.data.lessIncomeTax,
            paid: false,
            createdAt: currentDate,
          },
        }),
        db.labourWelfareCess.create({
          data: {
            labourWelfarecessAmt: validatedData.data.lessLabourWelfareCess,
            paid: false,
            createdAt: currentDate,
          },
        }),
        db.tdsCgst.create({
          data: {
            tdscgstAmt: validatedData.data.lessTdsCgst,
            paid: false,
            createdAt: currentDate,
          },
        }),
        db.tdsSgst.create({
          data: {
            tdsSgstAmt: validatedData.data.lessTdsSgst,
            paid: false,
            createdAt: currentDate,
          },
        }),
        db.secrutityDeposit.create({
          data: {
            securityDepositAmt: validatedData.data.securityDeposit,
            maturityDate: calculateMaturityDate(
              validatedData.data.workcompletaitiondate || null, // Use null if undefined
              validatedData.data.billPaymentDate // Fallback to billPaymentDate
            ),
            paymentstatus: "unpaid",
            createdAt: currentDate,
          },
        }),
      ]);

    // Determine if the bill is final
    const isfinalbill = validatedData.data.billType === "Final Bill";

    // Create PaymentDetails record
    const paymentDetails = await db.paymentDetails.create({
      data: {
        grossBillAmount: validatedData.data.grossBillAmount,
        lessIncomeTax: { connect: { id: incomeTax.id } },
        lessLabourWelfareCess: { connect: { id: labourWelfareCess.id } },
        lessTdsCgst: { connect: { id: tdsCgst.id } },
        lessTdsSgst: { connect: { id: tdsSgst.id } },
        securityDeposit: { connect: { id: securityDeposit.id } },
        billPaymentDate: validatedData.data.billPaymentDate,
        eGramVoucher: validatedData.data.eGramVoucher,
        eGramVoucherDate: validatedData.data.eGramVoucherDate,
        gpmsVoucherNumber: validatedData.data.gpmsVoucherNumber,
        gpmsVoucherDate: validatedData.data.gpmsVoucherDate,
        mbrefno: validatedData.data.mbrefno,
        billType: validatedData.data.billType,
        isfinalbill,
        netAmt: validatedData.data.netAmount,
        workcompletaitiondate: validatedData.data.workcompletaitiondate || null,
        WorksDetail: { connect: { id: worksDetailId } },
      },
    });

    // Update WorksDetail with the new PaymentDetails
    await db.worksDetail.update({
      where: { id: worksDetailId },
      data: {
        completionDate: validatedData.data.workcompletaitiondate || null,
        workStatus: validatedData.data.workcompletaitiondate
          ? "billpaid"
          : "workinprogress",
        paymentDetails: {
          connect: { id: paymentDetails.id },
        },
      },
    });

    console.log("Created PaymentDetails:", paymentDetails);
    console.log("Updated WorksDetail with new PaymentDetails");

    // Revalidate the path to update the UI
    revalidatePath(`/works/${worksDetailId}`, 'page');

    return { success: true, paymentDetails };
  } catch (error) {
    console.error("Failed to submit payment details:", error);
    return { error: "Failed to submit payment details. Please try again." };
  }
};

export const updatePaymentDetails = async (
  values: FormValues,
  worksDetailId: string,
  paymentDetailsId: string
) => {
  try {
    console.log(
      "Updating payment details. WorksDetailId:",
      worksDetailId,
      "PaymentDetailsId:",
      paymentDetailsId,
      "Form Values:",
      values
    );

    const validatedData = formSchema.safeParse(values);
    if (!validatedData.success) {
      console.error("Validation failed:", validatedData.error);
      return { error: "Invalid fields!" };
    }

    const existingPayment = await db.paymentDetails.findUnique({
      where: { id: paymentDetailsId },
      include: {
        lessIncomeTax: true,
        lessLabourWelfareCess: true,
        lessTdsCgst: true,
        lessTdsSgst: true,
        securityDeposit: true,
        WorksDetail: true,
      },
    });

    if (!existingPayment || !existingPayment.WorksDetail) {
      console.error("Invalid paymentDetailsId:", paymentDetailsId);
      return { error: "Invalid payment details reference" };
    }

    const currentDate = new Date();

    // Update related deduction and security deposit records
    await Promise.all([
      existingPayment.lessIncomeTax &&
        db.incomeTaxRegister.update({
          where: { id: existingPayment.lessIncomeTax.id },
          data: {
            incomeTaaxAmount: validatedData.data.lessIncomeTax,
          },
        }),
      existingPayment.lessLabourWelfareCess &&
        db.labourWelfareCess.update({
          where: { id: existingPayment.lessLabourWelfareCess.id },
          data: {
            labourWelfarecessAmt: validatedData.data.lessLabourWelfareCess,
          },
        }),
      existingPayment.lessTdsCgst &&
        db.tdsCgst.update({
          where: { id: existingPayment.lessTdsCgst.id },
          data: {
            tdscgstAmt: validatedData.data.lessTdsCgst,
          },
        }),
      existingPayment.lessTdsSgst &&
        db.tdsSgst.update({
          where: { id: existingPayment.lessTdsSgst.id },
          data: {
            tdsSgstAmt: validatedData.data.lessTdsSgst,
          },
        }),
      existingPayment.securityDeposit &&
        db.secrutityDeposit.update({
          where: { id: existingPayment.securityDeposit.id },
          data: {
            securityDepositAmt: validatedData.data.securityDeposit,
            maturityDate: calculateMaturityDate(
              validatedData.data.workcompletaitiondate || null,
              validatedData.data.billPaymentDate
            ),
            // keep existing paymentstatus and createdAt
          },
        }),
    ]);

    const isfinalbill = validatedData.data.billType === "Final Bill";

    const updatedPaymentDetails = await db.paymentDetails.update({
      where: { id: paymentDetailsId },
      data: {
        grossBillAmount: validatedData.data.grossBillAmount,
        billPaymentDate: validatedData.data.billPaymentDate,
        eGramVoucher: validatedData.data.eGramVoucher,
        eGramVoucherDate: validatedData.data.eGramVoucherDate,
        gpmsVoucherNumber: validatedData.data.gpmsVoucherNumber,
        gpmsVoucherDate: validatedData.data.gpmsVoucherDate,
        mbrefno: validatedData.data.mbrefno,
        billType: validatedData.data.billType,
        isfinalbill,
        netAmt: validatedData.data.netAmount,
        workcompletaitiondate: validatedData.data.workcompletaitiondate || null,
      },
    });

    await db.worksDetail.update({
      where: { id: worksDetailId },
      data: {
        completionDate: validatedData.data.workcompletaitiondate || null,
        workStatus: validatedData.data.workcompletaitiondate
          ? "billpaid"
          : "workinprogress",
      },
    });

    console.log("Updated PaymentDetails:", updatedPaymentDetails);

    revalidatePath(`/works/${worksDetailId}`, 'page');
    revalidatePath("/admindashboard/editpaymentdetails", 'page');

    return { success: true, paymentDetails: updatedPaymentDetails };
  } catch (error) {
    console.error("Failed to update payment details:", error);
    return { error: "Failed to update payment details. Please try again." };
  }
};
