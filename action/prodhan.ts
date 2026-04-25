"use server";

import { db } from "@/lib/db";
import { addYears } from "date-fns";

export async function createProdhan(data: any) {
  const joinDate = new Date(data.joinDate);
  const periodEndDate = addYears(joinDate, 5); // Add 5 years to join date

  try {
    const prodhan = await db.activeProdhanDetails.create({
      data: {
        ...data,
        periodOfWork: "5 years",
        periodEndDate,
        status: "active",
      },
    });
    return prodhan;
  } catch (error) {
    console.error("Failed to create prodhan:", error);
    throw new Error("Failed to create prodhan");
  }
}
