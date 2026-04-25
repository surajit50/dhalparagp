"use server";

import { db } from "./db";

export async function register(bidderid: string, emdAmount: number) {
  try {
    const emd = await db.earnestMoneyRegister.create({
      data: {
        earnestMoneyAmount: emdAmount,
        bidderId: bidderid,
      },
    });

    return { success: true, emd: emd };
  } catch (error) {
    console.log(error);
  }
}
