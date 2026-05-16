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

    // 1. Validate input
    const validatedData = formSchema.safeParse(values);
    if (!validatedData.success) {
      console.error("Validation failed:", validatedData.error);
      return { error: "Invalid fields!" };
    }

    // 2. Check if WorksDetail exists
    const existingWork = await db.worksDetail.findUnique({
      where: { id: worksDetailId },
    });
    if (!existingWork) {
      console.error("Invalid worksDetailId:", worksDetailId);
      return { error: "Invalid worksDetailId" };
    }

    // 3. Retrieve the related ApprovedActionPlan (using WorksDetail[] relation)
    const actionPlan = await db.approvedActionPlanDetails.findFirst({
      where: { WorksDetail: { some: { id: worksDetailId } } },
    });
    if (!actionPlan) {
      console.warn("No approved action plan linked to this work. Fund balance will not be updated.");
    }

    const currentDate = new Date();
    const data = validatedData.data;

    // 4. Execute everything in a transaction
    const result = await db.$transaction(async (tx) => {
      // 4a. Create deduction & deposit records
      const incomeTax = await tx.incomeTaxRegister.create({
        data: {
          incomeTaaxAmount: data.lessIncomeTax,
          paid: false,
          createdAt: currentDate,
        },
      });

      const labourWelfareCess = await tx.labourWelfareCess.create({
        data: {
          labourWelfarecessAmt: data.lessLabourWelfareCess,
          paid: false,
          createdAt: currentDate,
        },
      });

      const tdsCgst = await tx.tdsCgst.create({
        data: {
          tdscgstAmt: data.lessTdsCgst,
          paid: false,
          createdAt: currentDate,
        },
      });

      const tdsSgst = await tx.tdsSgst.create({
        data: {
          tdsSgstAmt: data.lessTdsSgst,
          paid: false,
          createdAt: currentDate,
        },
      });

      const securityDeposit = await tx.secrutityDeposit.create({
        data: {
          securityDepositAmt: data.securityDeposit,
          maturityDate: calculateMaturityDate(
            data.workcompletaitiondate || null,
            data.billPaymentDate
          ),
          paymentstatus: "unpaid",
          createdAt: currentDate,
        },
      });

      // 4b. Create PaymentDetails record
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

      // 4c. Update WorksDetail with completion date, status, and link to payment
      await tx.worksDetail.update({
        where: { id: worksDetailId },
        data: {
          completionDate: data.workcompletaitiondate || null,
          workStatus: data.workcompletaitiondate ? "billpaid" : "workinprogress",
          paymentDetails: {
            connect: { id: paymentDetails.id },
          },
        },
      });

      // 4d. Update FundAvailability ONLY IF actionPlan exists AND fundType AND schemeName are valid
      if (actionPlan && actionPlan.fundType && actionPlan.schemeName) {
        const fundRecord = await tx.fundAvailability.findFirst({
          where: {
            year: actionPlan.financialYear,
            schemeName: actionPlan.schemeName,
          },
        });

        if (fundRecord) {
          const netAmount = data.netAmount;
          const fundType = actionPlan.fundType.toLowerCase();

          if (fundType === "tied") {
            await tx.fundAvailability.update({
              where: { id: fundRecord.id },
              data: {
                expenditureTied: { increment: netAmount },
                expenditureTotal: { increment: netAmount },
              },
            });
            console.log(`Fund updated (tied): added ${netAmount} to expenditure`);
          } else if (fundType === "untied") {
            await tx.fundAvailability.update({
              where: { id: fundRecord.id },
              data: {
                expenditureUntied: { increment: netAmount },
                expenditureTotal: { increment: netAmount },
              },
            });
            console.log(`Fund updated (untied): added ${netAmount} to expenditure`);
          } else {
            console.warn(`Unknown fundType "${actionPlan.fundType}" – skipping fund update`);
          }
        } else {
          console.warn(`FundAvailability not found for year=${actionPlan.financialYear}, scheme=${actionPlan.schemeName} – skipping fund update`);
        }
      } else {
        console.warn("Skipping fund availability update because:",
          !actionPlan ? "no action plan" :
          !actionPlan.fundType ? "fundType is null" :
          !actionPlan.schemeName ? "schemeName is missing" : "unknown reason");
      }

      return paymentDetails;
    });

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

    // 1. Validate input
    const validatedData = formSchema.safeParse(values);
    if (!validatedData.success) {
      console.error("Validation failed:", validatedData.error);
      return { error: "Invalid fields!" };
    }

    // 2. Fetch existing payment details with its relations
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

    // 3. Retrieve the related ApprovedActionPlan (via WorksDetail)
    const actionPlan = await db.approvedActionPlanDetails.findFirst({
      where: { WorksDetail: { some: { id: worksDetailId } } },
    });
    if (!actionPlan) {
      console.warn("No approved action plan linked to this work. Fund balance will not be updated.");
    }

    const data = validatedData.data;

    // 4. Execute in transaction
    const result = await db.$transaction(async (tx) => {
      // 4a. Update deduction & deposit records (check existence first)
      if (!existingPayment.lessIncomeTax) {
        throw new Error("Income tax record missing, cannot update");
      }
      await tx.incomeTaxRegister.update({
        where: { id: existingPayment.lessIncomeTax.id },
        data: { incomeTaaxAmount: data.lessIncomeTax },
      });

      if (!existingPayment.lessLabourWelfareCess) {
        throw new Error("Labour welfare cess record missing, cannot update");
      }
      await tx.labourWelfareCess.update({
        where: { id: existingPayment.lessLabourWelfareCess.id },
        data: { labourWelfarecessAmt: data.lessLabourWelfareCess },
      });

      if (!existingPayment.lessTdsCgst) {
        throw new Error("TDS CGST record missing, cannot update");
      }
      await tx.tdsCgst.update({
        where: { id: existingPayment.lessTdsCgst.id },
        data: { tdscgstAmt: data.lessTdsCgst },
      });

      if (!existingPayment.lessTdsSgst) {
        throw new Error("TDS SGST record missing, cannot update");
      }
      await tx.tdsSgst.update({
        where: { id: existingPayment.lessTdsSgst.id },
        data: { tdsSgstAmt: data.lessTdsSgst },
      });

      if (!existingPayment.securityDeposit) {
        throw new Error("Security deposit record missing, cannot update");
      }
      await tx.secrutityDeposit.update({
        where: { id: existingPayment.securityDeposit.id },
        data: {
          securityDepositAmt: data.securityDeposit,
          maturityDate: calculateMaturityDate(
            data.workcompletaitiondate || null,
            data.billPaymentDate
          ),
        },
      });

      // 4b. Update PaymentDetails main fields
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

      // 4c. Update WorksDetail status & completion date
      await tx.worksDetail.update({
        where: { id: worksDetailId },
        data: {
          completionDate: data.workcompletaitiondate || null,
          workStatus: data.workcompletaitiondate ? "billpaid" : "workinprogress",
        },
      });

      // 4d. Update FundAvailability ONLY IF conditions are met
      if (actionPlan && actionPlan.fundType && actionPlan.schemeName) {
        const fundRecord = await tx.fundAvailability.findFirst({
          where: {
            year: actionPlan.financialYear,
            schemeName: actionPlan.schemeName,
          },
        });

        if (fundRecord) {
          const oldNetAmount = existingPayment.netAmt;
          const newNetAmount = data.netAmount;
          const netAmountDiff = newNetAmount - oldNetAmount;

          if (netAmountDiff !== 0) {
            const fundType = actionPlan.fundType.toLowerCase();
            if (fundType === "tied") {
              await tx.fundAvailability.update({
                where: { id: fundRecord.id },
                data: {
                  expenditureTied: { increment: netAmountDiff },
                  expenditureTotal: { increment: netAmountDiff },
                },
              });
              console.log(`Fund updated (tied): adjusted expenditure by ${netAmountDiff}`);
            } else if (fundType === "untied") {
              await tx.fundAvailability.update({
                where: { id: fundRecord.id },
                data: {
                  expenditureUntied: { increment: netAmountDiff },
                  expenditureTotal: { increment: netAmountDiff },
                },
              });
              console.log(`Fund updated (untied): adjusted expenditure by ${netAmountDiff}`);
            } else {
              console.warn(`Unknown fundType "${actionPlan.fundType}" – skipping fund update`);
            }
          } else {
            console.log("Net amount unchanged – no fund update needed");
          }
        } else {
          console.warn(`FundAvailability not found for year=${actionPlan.financialYear}, scheme=${actionPlan.schemeName} – skipping fund update`);
        }
      } else {
        console.warn("Skipping fund availability update because:",
          !actionPlan ? "no action plan" :
          !actionPlan.fundType ? "fundType is null" :
          !actionPlan.schemeName ? "schemeName is missing" : "unknown reason");
      }

      return updatedPaymentDetails;
    });

    console.log("PaymentDetails updated successfully:", result);
    revalidatePath(`/works/${worksDetailId}`, "page");
    revalidatePath("/admindashboard/editpaymentdetails", "page");
    return { success: true, paymentDetails: result };
  } catch (error) {
    console.error("Failed to update payment details:", error);
    return { error: "Failed to update payment details. Please try again." };
  }
};
