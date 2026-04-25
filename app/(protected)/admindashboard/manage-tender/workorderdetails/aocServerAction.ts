"use server";

import { createAgreement } from "@/action/create-agrement";
import { register } from "@/lib/register";
import { bidagencybyid } from "@/lib/auth";
import { db } from "@/lib/db";
import { sentAwardedNotification } from "@/lib/mail";
import { CreateAgreementInput } from "@/types/agreement";
import { z } from "zod";
import { sendSms } from "@/action/sendSms";
import { gpcode, gpnameinshort } from "@/constants/gpinfor";
import { formatDate } from "@/utils/utils";

/* ----------------------------- VALIDATION ----------------------------- */

const AocSchema = z.object({
  workodermenonumber: z.string().min(1, "Memo number is required"),
  workordeermemodate: z.string().min(1, "Memo date is required"),
  worksDetailId: z.string().min(1, "Work ID is required"),
  bidagencyId: z.string().min(1, "Bid agency ID is required"),
});

/* ----------------------------- SERVER ACTION ----------------------------- */

export const addAoCdetails = async (data: FormData) => {
  try {

    /* ----------------------------- EXTRACT FORM DATA ----------------------------- */

    const formData = {
      memono: data.get("memono") as string,
      memodate: data.get("memodate") as string,
      workId: data.get("workId") as string,
      acceptbidderId: data.get("acceptbidderId") as string,
    };

    /* ----------------------------- VALIDATE INPUT ----------------------------- */

    const validation = AocSchema.safeParse({
      workodermenonumber: formData.memono,
      workordeermemodate: formData.memodate,
      worksDetailId: formData.workId,
      bidagencyId: formData.acceptbidderId,
    });

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;

      return {
        error: "Validation failed",
        details: errors,
      };
    }

    const {
      workodermenonumber,
      worksDetailId,
      bidagencyId,
    } = validation.data;

    const workordeermemodate = new Date(validation.data.workordeermemodate);

    /* ----------------------------- FUTURE DATE CHECK ----------------------------- */

    if (workordeermemodate > new Date()) {
      return {
        error: "Memo date cannot be in the future",
      };
    }

    /* ----------------------------- UNIQUE MEMO PER YEAR ----------------------------- */

    const year = workordeermemodate.getFullYear();

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const existingAoc = await db.awardofContract.findFirst({
      where: {
        workodermenonumber,
        workordeermemodate: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    });

    if (existingAoc) {
      return {
        error: `Memo number already exists for year ${year}`,
      };
    }

    /* ----------------------------- PREVENT DUPLICATE WORK ORDER ----------------------------- */

    const existingWork = await db.worksDetail.findUnique({
      where: { id: worksDetailId },
      select: { tenderStatus: true },
    });

    if (existingWork?.tenderStatus === "AOC") {
      return {
        error: "Work order already created for this work",
      };
    }

    /* ----------------------------- DATABASE TRANSACTION ----------------------------- */

    const result = await db.$transaction(async (tx) => {

      /* ----------------------------- CREATE AOC ----------------------------- */

      const aoc = await tx.awardofContract.create({
        data: {
          workodermenonumber,
          workordeermemodate,
        },
      });

      /* ----------------------------- CREATE WORK ORDER DETAILS ----------------------------- */

      await tx.workorderdetails.create({
        data: {
          awardofContractId: aoc.id,
          bidagencyId,
        },
      });

      /* ----------------------------- UPDATE WORK STATUS ----------------------------- */

      const work = await tx.worksDetail.update({
        where: { id: worksDetailId },
        data: {
          workStatus: "workorder",
          tenderStatus: "AOC",
          AwardofContract: {
            connect: { id: aoc.id },
          },
        },
        include: {
          nitDetails: true,
          ApprovedActionPlanDetails: true,
        },
      });

      return { aoc, work };
    });

    const { aoc, work } = result;

    /* ----------------------------- CREATE AGREEMENT ----------------------------- */

    const inputdata: CreateAgreementInput = {
      aggrementno: `AGR-${aoc.workordeermemodate.getFullYear()}-${String(
        aoc.workodermenonumber
      ).padStart(4, "0")}/${work.workslno}`,

      aggrementdate: aoc.workordeermemodate.toISOString(),

      approvedActionPlanDetailsId:
        work.approvedActionPlanDetailsId,

      bidagencyId,
    };

    const [agreement, bidder] = await Promise.all([
      createAgreement(inputdata),
      bidagencybyid(bidagencyId),
    ]);

    if (!bidder) {
      throw new Error("Bidder not found");
    }

    /* ----------------------------- REGISTER BIDDER ----------------------------- */

    await register(bidagencyId, work.earnestMoneyFee);

    /* ----------------------------- EMAIL NOTIFICATION ----------------------------- */

    if (bidder.agencydetails.email) {
      await sentAwardedNotification(
        bidder.agencydetails.email,
        work.nitDetails?.memoNumber || 0,
        work.nitDetails?.memoDate || new Date(),
        work.workslno,
        bidder.agencydetails.name
      );
    }

    /* ----------------------------- SMS NOTIFICATION ----------------------------- */

    const mobile = bidder.agencydetails.mobileNumber;

    if (!mobile || mobile.length !== 10) {
      throw new Error("Invalid bidder mobile number");
    }

    const phoneWithCountryCode = `+91${mobile}`;

    const memoDate = work.nitDetails?.memoDate;

    const smsMessage = `🎉 Congratulations!

You have been awarded the contract.

NIT No: ${work.nitDetails?.memoNumber ?? 0}/${gpcode}/${memoDate ? memoDate.getFullYear() : ""}
Date: ${memoDate ? formatDate(memoDate) : "N/A"}
Work Sl No: ${work.workslno}

${gpnameinshort} GP
Check your email for further details.`;

    const sms = await sendSms(phoneWithCountryCode, smsMessage);

    if (!sms) {
      throw new Error("Failed to send SMS notification");
    }

    if (sms.MessageId) {
      console.log("SMS sent successfully:", sms.MessageId);
    } else {
      console.log("SMS sending failed.");
    }

    /* ----------------------------- SUCCESS ----------------------------- */

    return {
      success: "Work order finalized successfully",
    };

  } catch (error) {

    console.error("Failed to create work order:", error);

    if (error instanceof z.ZodError) {
      return {
        error: "Invalid input data",
      };
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to create work order",
    };
  }
};
