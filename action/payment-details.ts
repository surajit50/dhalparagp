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
        // ------------------------------------------------------------------
        // Create register entries only if amount > 0
        // ------------------------------------------------------------------
        let incomeTaxId: string | null = null;
        if (data.lessIncomeTax > 0) {
          const incomeTax = await tx.incomeTaxRegister.create({
            data: { incomeTaaxAmount: data.lessIncomeTax, paid: false, createdAt: currentDate },
          });
          incomeTaxId = incomeTax.id;
        }

        let labourWelfareCessId: string | null = null;
        if (data.lessLabourWelfareCess > 0) {
          const labourWelfareCess = await tx.labourWelfareCess.create({
            data: { labourWelfarecessAmt: data.lessLabourWelfareCess, paid: false, createdAt: currentDate },
          });
          labourWelfareCessId = labourWelfareCess.id;
        }

        let tdsCgstId: string | null = null;
        if (data.lessTdsCgst > 0) {
          const tdsCgst = await tx.tdsCgst.create({
            data: { tdscgstAmt: data.lessTdsCgst, paid: false, createdAt: currentDate },
          });
          tdsCgstId = tdsCgst.id;
        }

        let tdsSgstId: string | null = null;
        if (data.lessTdsSgst > 0) {
          const tdsSgst = await tx.tdsSgst.create({
            data: { tdsSgstAmt: data.lessTdsSgst, paid: false, createdAt: currentDate },
          });
          tdsSgstId = tdsSgst.id;
        }

        let securityDepositId: string | null = null;
        if (data.securityDeposit > 0) {
          const securityDeposit = await tx.secrutityDeposit.create({
            data: {
              securityDepositAmt: data.securityDeposit,
              maturityDate: calculateMaturityDate(data.workcompletaitiondate || null, data.billPaymentDate),
              paymentstatus: "unpaid",
              createdAt: currentDate,
            },
          });
          securityDepositId = securityDeposit.id;
        }

        // ------------------------------------------------------------------
        // Build paymentDetails create data with optional relations
        // ------------------------------------------------------------------
        const paymentDetailsData: any = {
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
          WorksDetail: { connect: { id: worksDetailId } },
        };

        // Only connect if a record was created
        if (incomeTaxId) {
          paymentDetailsData.lessIncomeTax = { connect: { id: incomeTaxId } };
        }
        if (labourWelfareCessId) {
          paymentDetailsData.lessLabourWelfareCess = { connect: { id: labourWelfareCessId } };
        }
        if (tdsCgstId) {
          paymentDetailsData.lessTdsCgst = { connect: { id: tdsCgstId } };
        }
        if (tdsSgstId) {
          paymentDetailsData.lessTdsSgst = { connect: { id: tdsSgstId } };
        }
        if (securityDepositId) {
          paymentDetailsData.securityDeposit = { connect: { id: securityDepositId } };
        }

        const paymentDetails = await tx.paymentDetails.create({
          data: paymentDetailsData,
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
        const fundRecord = await db.fundAvailability.findFirst({
          where: { schemeName: actionPlan.schemeName },
          orderBy: { year: 'desc' },
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
        // ------------------------------------------------------------------
        // Update each register entry: create if new amount > 0 and missing,
        // update if exists, delete if amount becomes 0.
        // ------------------------------------------------------------------

        // --- Income Tax ---
        if (data.lessIncomeTax > 0) {
          if (existingPayment.lessIncomeTax) {
            await tx.incomeTaxRegister.update({
              where: { id: existingPayment.lessIncomeTax.id },
              data: { incomeTaaxAmount: data.lessIncomeTax },
            });
          } else {
            // Create new record (should not happen normally, but safe)
            const newIncomeTax = await tx.incomeTaxRegister.create({
              data: {
                incomeTaaxAmount: data.lessIncomeTax,
                paid: false,
                createdAt: new Date(),
              },
            });
            // We'll need to connect it later via paymentDetails update
            // We'll store the id for connecting
            existingPayment.lessIncomeTax = { id: newIncomeTax.id } as any; // temporary
          }
        } else {
          // Amount is 0: delete existing record if it exists
          if (existingPayment.lessIncomeTax) {
            await tx.incomeTaxRegister.delete({
              where: { id: existingPayment.lessIncomeTax.id },
            });
            existingPayment.lessIncomeTax = null as any; // mark for disconnection
          }
        }

        // --- Labour Welfare Cess ---
        if (data.lessLabourWelfareCess > 0) {
          if (existingPayment.lessLabourWelfareCess) {
            await tx.labourWelfareCess.update({
              where: { id: existingPayment.lessLabourWelfareCess.id },
              data: { labourWelfarecessAmt: data.lessLabourWelfareCess },
            });
          } else {
            const newLabour = await tx.labourWelfareCess.create({
              data: {
                labourWelfarecessAmt: data.lessLabourWelfareCess,
                paid: false,
                createdAt: new Date(),
              },
            });
            existingPayment.lessLabourWelfareCess = { id: newLabour.id } as any;
          }
        } else {
          if (existingPayment.lessLabourWelfareCess) {
            await tx.labourWelfareCess.delete({
              where: { id: existingPayment.lessLabourWelfareCess.id },
            });
            existingPayment.lessLabourWelfareCess = null as any;
          }
        }

        // --- TDS CGST ---
        if (data.lessTdsCgst > 0) {
          if (existingPayment.lessTdsCgst) {
            await tx.tdsCgst.update({
              where: { id: existingPayment.lessTdsCgst.id },
              data: { tdscgstAmt: data.lessTdsCgst },
            });
          } else {
            const newTdsCgst = await tx.tdsCgst.create({
              data: {
                tdscgstAmt: data.lessTdsCgst,
                paid: false,
                createdAt: new Date(),
              },
            });
            existingPayment.lessTdsCgst = { id: newTdsCgst.id } as any;
          }
        } else {
          if (existingPayment.lessTdsCgst) {
            await tx.tdsCgst.delete({
              where: { id: existingPayment.lessTdsCgst.id },
            });
            existingPayment.lessTdsCgst = null as any;
          }
        }

        // --- TDS SGST ---
        if (data.lessTdsSgst > 0) {
          if (existingPayment.lessTdsSgst) {
            await tx.tdsSgst.update({
              where: { id: existingPayment.lessTdsSgst.id },
              data: { tdsSgstAmt: data.lessTdsSgst },
            });
          } else {
            const newTdsSgst = await tx.tdsSgst.create({
              data: {
                tdsSgstAmt: data.lessTdsSgst,
                paid: false,
                createdAt: new Date(),
              },
            });
            existingPayment.lessTdsSgst = { id: newTdsSgst.id } as any;
          }
        } else {
          if (existingPayment.lessTdsSgst) {
            await tx.tdsSgst.delete({
              where: { id: existingPayment.lessTdsSgst.id },
            });
            existingPayment.lessTdsSgst = null as any;
          }
        }

        // --- Security Deposit ---
        if (data.securityDeposit > 0) {
          if (existingPayment.securityDeposit) {
            await tx.secrutityDeposit.update({
              where: { id: existingPayment.securityDeposit.id },
              data: {
                securityDepositAmt: data.securityDeposit,
                maturityDate: calculateMaturityDate(data.workcompletaitiondate || null, data.billPaymentDate),
              },
            });
          } else {
            const newSecurity = await tx.secrutityDeposit.create({
              data: {
                securityDepositAmt: data.securityDeposit,
                maturityDate: calculateMaturityDate(data.workcompletaitiondate || null, data.billPaymentDate),
                paymentstatus: "unpaid",
                createdAt: new Date(),
              },
            });
            existingPayment.securityDeposit = { id: newSecurity.id } as any;
          }
        } else {
          if (existingPayment.securityDeposit) {
            await tx.secrutityDeposit.delete({
              where: { id: existingPayment.securityDeposit.id },
            });
            existingPayment.securityDeposit = null as any;
          }
        }

        // ------------------------------------------------------------------
        // Update paymentDetails: connect or disconnect as needed
        // ------------------------------------------------------------------
        const updateData: any = {
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
        };

        // For each relation, set connect if record exists, else set disconnect (null)
        if (existingPayment.lessIncomeTax) {
          updateData.lessIncomeTax = { connect: { id: existingPayment.lessIncomeTax.id } };
        } else {
          updateData.lessIncomeTax = { disconnect: true }; // or set to null
        }

        if (existingPayment.lessLabourWelfareCess) {
          updateData.lessLabourWelfareCess = { connect: { id: existingPayment.lessLabourWelfareCess.id } };
        } else {
          updateData.lessLabourWelfareCess = { disconnect: true };
        }

        if (existingPayment.lessTdsCgst) {
          updateData.lessTdsCgst = { connect: { id: existingPayment.lessTdsCgst.id } };
        } else {
          updateData.lessTdsCgst = { disconnect: true };
        }

        if (existingPayment.lessTdsSgst) {
          updateData.lessTdsSgst = { connect: { id: existingPayment.lessTdsSgst.id } };
        } else {
          updateData.lessTdsSgst = { disconnect: true };
        }

        if (existingPayment.securityDeposit) {
          updateData.securityDeposit = { connect: { id: existingPayment.securityDeposit.id } };
        } else {
          updateData.securityDeposit = { disconnect: true };
        }

        const updatedPaymentDetails = await tx.paymentDetails.update({
          where: { id: paymentDetailsId },
          data: updateData,
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
