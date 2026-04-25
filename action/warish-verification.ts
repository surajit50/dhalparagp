"use server";

import { WarishApplication, WarishDetail } from "@prisma/client";

import { db } from "@/lib/db";



export async function verifyWarishApplication(refNo: string) {
  try {
    // Find the application by reference number
    const application = await db.warishApplication.findFirst({
      where: {
        warishRefNo: refNo,
      },
    });

    console.log("Application found:", application);

    if (application) {
      // Treat both 'approved' and 'renewed' as genuine applications
      const isGenuine =
        application.warishApplicationStatus === "approved" ||
        application.warishApplicationStatus === "renewed";

      return {
        success: true,
        id: application.id,
        isGenuine,
        message: isGenuine
          ? `Application verified successfully (${
              application.warishApplicationStatus === "renewed"
                ? "Renewed"
                : "Approved"
            }).`
          : "Application found, but not approved or renewed.",
      };
    } else {
      return {
        success: false,
        message: "No application found with the given reference number.",
      };
    }
  } catch (error) {
    console.error("Error verifying Warish application:", error);
    throw new Error("Failed to verify Warish application");
  }
}

export async function getWarishApplicationDetails(id: string) {
  try {
    const application = await db.warishApplication.findUnique({
      where: { id },
      include: { warishDetails: true },
    });

    if (application) {
      return {
        success: true,
        application: application as WarishApplication & {
          warishDetails: WarishDetail[];
        },
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching Warish application details:", error);
    throw new Error("Failed to fetch Warish application details");
  }
}



