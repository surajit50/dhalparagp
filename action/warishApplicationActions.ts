
"use server"

import { db } from "@/lib/db"

// Fetch warish details by ID
export async function getWarishDetailsById(applicationId: string) {
  return await db.warishApplication.findUnique({
    where: { id: applicationId },
    
  })
}

// Update Warish Details
export async function updateWarishDetails(applicationId: string, data: any) {
  try {
    const updatedApplication = await db.warishApplication.update({
      where: { id: applicationId },
      data: {
        ...data,
      }
    }
    );

    return {
      success: true,
      data: updatedApplication,
    };
  } catch (error: any) {
    console.error("Error updating warish details:", error);
    return {
      success: false,
      message: error.message || "Failed to update warish details",
    };
  }
}
