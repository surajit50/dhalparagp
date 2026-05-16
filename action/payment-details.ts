"use server";

import { formSchema, FormValues } from "@/schema/formSchema";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ----------------------------------------------------------------------
// Utility: maturity date = 6 months after work completion or bill date
// ----------------------------------------------------------------------
const calculateMaturityDate = (
  workCompletionDate: Date | null | undefined,
  billPaymentDate: Date
): Date => {
  const baseDate = workCompletionDate || billPaymentDate;
  const maturityDate = new Date(baseDate);
  maturityDate.setMonth(maturityDate.getMonth() + 6);
  return maturityDate;
};

// ----------------------------------------------------------------------
// ADD PAYMENT DETAILS
// ----------------------------------------------------------------------
export const addPaymentDetails = async (values: FormValues, worksDetailId: string) => {
  try {
    console.log("WorksDetailId:", worksDetailId, "Form Values:", values);

    const validatedData = formSchema.safeParse(values);
    if (!validatedData.success) {
      console.error("Validation failed:", validatedData.error);
      return { error: "Invalid fields!" };
    }

    const existingWork = await db.worksDetail.findUnique({
      where: { id: worksDetailId },
    });
    if (!existingWork) {
      console.error("Invalid worksDetailId:", worksDetailId);
      return { error: "Invalid worksDetailId" };
    }

    // Fetch actionPlan (read-only)
    const actionPlan = await db.approvedActionPlanDetails.findFirst({
      where: { WorksDetail: { some: { id: worksDetailId } } },
    });
    if (!actionPlan) {
      console.warn("No approved action plan linked to this work. Fund balance will not be updated.");
    }

    const currentDate = new Date();
    const data = validatedData.data;

    // Main transaction for critical writes
    const result = await db.$transaction(
      async (tx) => {
        const incomeTax = await tx.incomeTaxRegister.create({
          data: { incomeTaaxAmount: data.lessIncomeTax, paid: false, createdAt: currentDate },
        });
        const labourWelfareCess = await tx.labourWelfareCess.create({
          data: { labourWelfarecessAmt: data.lessLabourWelfareCess, paid: false, createdAt: currentDate },
        });
        const tdsCgst = await tx.tdsCgst.create({
          data: { tdscgstAmt: data.lessTdsCgst, paid: false, createdAt: currentDate },
        });
        const tdsSgst = await tx.tdsSgst.create({
          data: { tdsSgstAmt: data.lessTdsSgst, paid: false, createdAt: currentDate },
        });
        const securityDeposit = await tx.secrutityDeposit.create({
          data: {
            securityDepositAmt: data.securityDeposit,
            maturityDate: calculateMaturityDate(data.workcompletaitiondate || null, data.billPaymentDate),
            paymentstatus: "unpaid",
            createdAt: currentDate,
          },
        });

        const paymentDetails = await tx.paymentDetails.create({
          data: {
            grossBillAmount: data.grossBillAmount,
            lessIncomeTax: { connect: { id: incomeTax.id } },
            lessLabourWelfareCess: { connect: { id: labourWelfareCess.id } },
            lessTdsCgst: { connect: { id: tdsCgst.id } },
            lessTdsSgst: { connect: { id: tdsSgst.id } },
            securityDeposit: { connect: { id: securityDeposit.id } },
            billPaymentDate: data.billPaymentDate,
            eGramVoucher: data.eGramVoucher,
            eGramVoucherDate: data.eGramVoucherDate,
            gpmsVoucherNumber: data.gpmsVoucherNumber,
            gpmsVoucherDate: data.gpmsVoucherDate,
            mbrefno: data.mbrefno,
            billType: data.billType,
            isfinalbill: data.billType === "Final Bill",
            netAmt: data.netAmount,
            workcompletaitiondate: data.workcompletaitiondate || null,
            WorksDetail: { connect: { id: worksDetailId } },
          },
        });

        await tx.worksDetail.update({
          where: { id: worksDetailId },
          data: {
            completionDate: data.workcompletaitiondate || null,
            workStatus: data.workcompletaitiondate ? "billpaid" : "workinprogress",
            paymentDetails: { connect: { id: paymentDetails.id } },
          },
        });

        return paymentDetails;
      },
      { timeout: 15000 }
    );

    // ------------------------------------------------------------------
    // Fund availability update using the LATEST financial year
    // ------------------------------------------------------------------
    if (actionPlan && actionPlan.fundType && actionPlan.schemeName) {
      try {
        // Find FundAvailability record with the highest year (latest financial year)
        const fundRecord = await db.fundAvailability.findFirst({
          where: { schemeName: actionPlan.schemeName },
          orderBy: { year: 'desc' },  // latest year first
        });

        if (fundRecord) {
          const netAmount = data.netAmount;
          const fundType = actionPlan.fundType.toLowerCase();

          if (fundType === "tied") {
            await db.fundAvailability.update({
              where: { id: fundRecord.id },
              data: {
                expenditureTied: { increment: netAmount },
                expenditureTotal: { increment: netAmount },
              },
            });
            console.log(`Fund updated (tied) for latest year ${fundRecord.year}: +${netAmount}`);
          } else if (fundType === "untied") {
            await db.fundAvailability.update({
              where: { id: fundRecord.id },
              data: {
                expenditureUntied: { increment: netAmount },
                expenditureTotal: { increment: netAmount },
              },
            });
            console.log(`Fund updated (untied) for latest year ${fundRecord.year}: +${netAmount}`);
          } else {
            console.warn(`Unknown fundType "${actionPlan.fundType}" – skipping fund update`);
          }
        } else {
          console.warn(`No FundAvailability record found for scheme: ${actionPlan.schemeName} – skipping fund update`);
        }
      } catch (fundError) {
        console.error("Failed to update fund availability:", fundError);
      }
    } else {
      console.warn("Skipping fund update: missing actionPlan, fundType, or schemeName");
    }

    console.log("PaymentDetails created successfully:", result);
    revalidatePath(`/works/${worksDetailId}`, "page");
    return { success: true, paymentDetails: result };
  } catch (error) {
    console.error("Failed to submit payment details:", error);
    return { error: "Failed to submit payment details. Please try again." };
  }
};

// ----------------------------------------------------------------------
// UPDATE PAYMENT DETAILS
// ----------------------------------------------------------------------
export const updatePaymentDetails = async (
  values: FormValues,
  worksDetailId: string,
  paymentDetailsId: string
) => {
  try {
    console.log("Updating payment details", { worksDetailId, paymentDetailsId, values });

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
      console.error("Invalid paymentDetailsId or missing WorksDetail relation");
      return { error: "Invalid payment details reference" };
    }

    const actionPlan = await db.approvedActionPlanDetails.findFirst({
      where: { WorksDetail: { some: { id: worksDetailId } } },
    });
    if (!actionPlan) {
      console.warn("No approved action plan linked to this work. Fund balance will not be updated.");
    }

    const data = validatedData.data;

    const result = await db.$transaction(
      async (tx) => {
        if (!existingPayment.lessIncomeTax) throw new Error("Income tax record missing");
        await tx.incomeTaxRegister.update({
          where: { id: existingPayment.lessIncomeTax.id },
          data: { incomeTaaxAmount: data.lessIncomeTax },
        });

        if (!existingPayment.lessLabourWelfareCess) throw new Error("Labour welfare cess record missing");
        await tx.labourWelfareCess.update({
          where: { id: existingPayment.lessLabourWelfareCess.id },
          data: { labourWelfarecessAmt: data.lessLabourWelfareCess },
        });

        if (!existingPayment.lessTdsCgst) throw new Error("TDS CGST record missing");
        await tx.tdsCgst.update({
          where: { id: existingPayment.lessTdsCgst.id },
          data: { tdscgstAmt: data.lessTdsCgst },
        });

        if (!existingPayment.lessTdsSgst) throw new Error("TDS SGST record missing");
        await tx.tdsSgst.update({
          where: { id: existingPayment.lessTdsSgst.id },
          data: { tdsSgstAmt: data.lessTdsSgst },
        });

        if (!existingPayment.securityDeposit) throw new Error("Security deposit record missing");
        await tx.secrutityDeposit.update({
          where: { id: existingPayment.securityDeposit.id },
          data: {
            securityDepositAmt: data.securityDeposit,
            maturityDate: calculateMaturityDate(data.workcompletaitiondate || null, data.billPaymentDate),
          },
        });

        const updatedPaymentDetails = await tx.paymentDetails.update({
          where: { id: paymentDetailsId },
          data: {
            grossBillAmount: data.grossBillAmount,
            billPaymentDate: data.billPaymentDate,
            eGramVoucher: data.eGramVoucher,
            eGramVoucherDate: data.eGramVoucherDate,
            gpmsVoucherNumber: data.gpmsVoucherNumber,
            gpmsVoucherDate: data.gpmsVoucherDate,
            mbrefno: data.mbrefno,
            billType: data.billType,
            isfinalbill: data.billType === "Final Bill",
            netAmt: data.netAmount,
            workcompletaitiondate: data.workcompletaitiondate || null,
          },
        });

        await tx.worksDetail.update({
          where: { id: worksDetailId },
          data: {
            completionDate: data.workcompletaitiondate || null,
            workStatus: data.workcompletaitiondate ? "billpaid" : "workinprogress",
          },
        });

        return updatedPaymentDetails;
      },
      { timeout: 15000 }
    );

    // Fund availability update with LATEST financial year
    if (actionPlan && actionPlan.fundType && actionPlan.schemeName) {
      try {
        const fundRecord = await db.fundAvailability.findFirst({
          where: { schemeName: actionPlan.schemeName },
          orderBy: { year: 'desc' },
        });

        if (fundRecord) {
          const oldNetAmount = existingPayment.netAmt;
          const newNetAmount = data.netAmount;
          const netAmountDiff = newNetAmount - oldNetAmount;

          if (netAmountDiff !== 0) {
            const fundType = actionPlan.fundType.toLowerCase();
            if (fundType === "tied") {
              await db.fundAvailability.update({
                where: { id: fundRecord.id },
                data: {
                  expenditureTied: { increment: netAmountDiff },
                  expenditureTotal: { increment: netAmountDiff },
                },
              });
              console.log(`Fund updated (tied) for latest year ${fundRecord.year}: adjustment ${netAmountDiff}`);
            } else if (fundType === "untied") {
              await db.fundAvailability.update({
                where: { id: fundRecord.id },
                data: {
                  expenditureUntied: { increment: netAmountDiff },
                  expenditureTotal: { increment: netAmountDiff },
                },
              });
              console.log(`Fund updated (untied) for latest year ${fundRecord.year}: adjustment ${netAmountDiff}`);
            } else {
              console.warn(`Unknown fundType "${actionPlan.fundType}" – skipping fund update`);
            }
          }
        } else {
          console.warn(`No FundAvailability record found for scheme: ${actionPlan.schemeName} – skipping fund update`);
        }
      } catch (fundError) {
        console.error("Failed to update fund availability:", fundError);
      }
    } else {
      console.warn("Skipping fund update: missing actionPlan, fundType, or schemeName");
    }

    console.log("PaymentDetails updated successfully:", result);
    revalidatePath(`/works/${worksDetailId}`, "page");
    revalidatePath("/admindashboard/editpaymentdetails", "page");
    return { success: true, paymentDetails: result };
  } catch (error) {
    console.error("Failed to update payment details:", error);
    return { error: "Failed to update payment details. Please try again." };
  }
};
