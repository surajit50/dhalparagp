"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function generatePujaNOC(data: {
  pujaName: string;
  location: string;
  organizer: string;
  startDate: string;
  endDate: string;
}) {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const shortYear = year.toString().slice(-2);

    // Generate a reference number
    // We can count the number of NOCs this year to make a sequential ref no
    const count = await db.nocApplication.count({
      where: {
        eventCategory: "PUJA",
        createdAt: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
    });

    const sequentialNo = (count + 1).toString().padStart(3, "0");
    const refNo = `NOC/PUJA/${shortYear}/${sequentialNo}`;
    const applicationNo = `APP/PUJA/${Date.now()}`;

    // Create the NOC application
    const noc = await db.nocApplication.create({
      data: {
        applicationNo,
        status: "APPROVED",
        applicantName: data.organizer,
        applicantPhone: "N/A",
        applicantAddress: data.location,
        organizerName: data.organizer,
        eventName: data.pujaName,
        eventCategory: "PUJA",
        eventLocation: data.location,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        refNo,
        refDate: today,
      },
    });

    revalidatePath("/admindashboard/generate/puja-noc");

    return {
      success: true,
      refNo: noc.refNo,
      date: noc.refDate?.toISOString().split('T')[0], // yyyy-mm-dd
    };
  } catch (error) {
    console.error("Error generating Puja NOC:", error);
    return { success: false, message: "Failed to generate NOC" };
  }
}
