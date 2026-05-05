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

export async function applyPujaNOC(data: {
  applicantName: string;
  applicantPhone: string;
  applicantEmail?: string;
  applicantAddress: string;
  organizerName: string;
  organizerType?: string;
  eventName: string;
  eventLocation: string;
  startDate: string;
  endDate: string;
  expectedAttendance?: number;
  loudspeakerRequired: boolean;
  electricityRequired: boolean;
  roadClosureRequired: boolean;
  additionalRequirements?: string;
  userId: string;
  fileUrl?: string | null;
  fileKey?: string | null;
}) {
  try {
    const applicationNo = `APP/PUJA/${Date.now()}`;

    const noc = await db.nocApplication.create({
      data: {
        applicationNo,
        status: "SUBMITTED",
        applicantName: data.applicantName,
        applicantPhone: data.applicantPhone,
        applicantEmail: data.applicantEmail,
        applicantAddress: data.applicantAddress,
        organizerName: data.organizerName,
        organizerType: data.organizerType,
        eventName: data.eventName,
        eventCategory: "PUJA",
        eventLocation: data.eventLocation,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        expectedAttendance: data.expectedAttendance,
        loudspeakerRequired: data.loudspeakerRequired,
        electricityRequired: data.electricityRequired,
        roadClosureRequired: data.roadClosureRequired,
        additionalRequirements: data.additionalRequirements,
        createdById: data.userId,
      },
    });

    if (data.fileUrl && data.fileKey) {
      await db.nocDocument.create({
        data: {
          applicationId: noc.id,
          documentType: "APPLICATION_LETTER",
          fileUrl: data.fileUrl,
          fileKey: data.fileKey,
          uploadedBy: data.userId,
        },
      });
    }

    revalidatePath("/dashboard/puja-noc/status");

    return {
      success: true,
      applicationNo: noc.applicationNo,
    };
  } catch (error) {
    console.error("Error applying for Puja NOC:", error);
    return { success: false, message: "Failed to submit application" };
  }
}

export async function getUserPujaNOCs(userId: string) {
  try {
    const nocs = await db.nocApplication.findMany({
      where: {
        createdById: userId,
        eventCategory: "PUJA",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: nocs };
  } catch (error) {
    console.error("Error fetching user Puja NOCs:", error);
    return { success: false, message: "Failed to fetch applications" };
  }
}

export async function updatePujaNOCStatus(id: string, status: any, remarks?: string) {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const shortYear = year.toString().slice(-2);

    let updateData: any = {
      status,
      remarks,
    };

    if (status === "APPROVED") {
      const count = await db.nocApplication.count({
        where: {
          eventCategory: "PUJA",
          status: "APPROVED",
          createdAt: {
            gte: new Date(year, 0, 1),
            lt: new Date(year + 1, 0, 1),
          },
        },
      });

      const sequentialNo = (count + 1).toString().padStart(3, "0");
      updateData.refNo = `NOC/PUJA/${shortYear}/${sequentialNo}`;
      updateData.refDate = today;
    }

    await db.nocApplication.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admindashboard/verify/puja-noc");
    revalidatePath("/dashboard/puja-noc/status");

    return { success: true };
  } catch (error) {
    console.error("Error updating Puja NOC status:", error);
    return { success: false, message: "Failed to update status" };
  }
}

export async function getPujaNOCs() {
  try {
    const nocs = await db.nocApplication.findMany({
      where: {
        eventCategory: "PUJA",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: nocs };
  } catch (error) {
    console.error("Error fetching Puja NOCs:", error);
    return { success: false, message: "Failed to fetch NOCs" };
  }
}
