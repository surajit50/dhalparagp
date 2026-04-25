"use server";

import { db } from "@/lib/db";
import { createAuditLog } from "./monitoring-actions";

// Function to seed sample audit logs for testing
export async function seedSampleAuditLogs() {
  try {
    // Get a sample user to associate with audit logs
    const sampleUser = await db.user.findFirst({
      where: { role: 'admin' }
    });

    if (!sampleUser) {
      console.log("No admin user found to create audit logs");
      return { success: false, error: "No admin user found" };
    }

    const sampleActions = [
      {
        action: "User Login",
        entityId: sampleUser.id,
        entityType: "User",
        details: "User logged in successfully"
      },
      {
        action: "Created Warish Application",
        entityId: "sample-warish-id",
        entityType: "WarishApplication",
        details: "New warish application submitted"
      },
      {
        action: "Updated User Profile",
        entityId: sampleUser.id,
        entityType: "User",
        details: "User profile information updated"
      },
      {
        action: "Approved Booking",
        entityId: "sample-booking-id",
        entityType: "Booking",
        details: "Service booking approved"
      },
      {
        action: "Generated Report",
        entityId: "report-id",
        entityType: "Report",
        details: "Monthly report generated"
      },
      {
        action: "Uploaded Document",
        entityId: "document-id",
        entityType: "Document",
        details: "New document uploaded to system"
      },
      {
        action: "System Maintenance",
        entityId: "system-id",
        entityType: "System",
        details: "Scheduled maintenance completed"
      },
      {
        action: "Data Export",
        entityId: "export-id",
        entityType: "Export",
        details: "User data exported successfully"
      }
    ];

    const createdLogs = [];

    for (const action of sampleActions) {
      const result = await createAuditLog({
        ...action,
        userId: sampleUser.id
      });

      if (result.success) {
        createdLogs.push(result.data);
      }
    }

    console.log(`Created ${createdLogs.length} sample audit logs`);
    return { success: true, count: createdLogs.length };
  } catch (error) {
    console.error('Error seeding audit logs:', error);
    return { success: false, error: "Failed to seed audit logs" };
  }
}

// Function to clear all audit logs (for testing)
export async function clearAuditLogs() {
  try {
    await db.auditLog.deleteMany({});
    return { success: true, message: "All audit logs cleared" };
  } catch (error) {
    console.error('Error clearing audit logs:', error);
    return { success: false, error: "Failed to clear audit logs" };
  }
} 