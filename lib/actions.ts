// lib/actions/notification.ts
"use server";

import { db } from "@/lib/db";
import { z } from "zod";
import { NotificationType } from "@prisma/client";

const NotificationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(500, "Message too long"),
  link: z.string().optional(),
  type: z.nativeEnum(NotificationType).default(NotificationType.INFO),
});

export type CreateNotificationResponse =
  | { success: true; notificationId: string }
  | { success: false; error: string };

export const createNotification = async (
  userId: string,
  message: string,
  options?: {
    link?: string;
    type?: NotificationType;
  }
): Promise<CreateNotificationResponse> => {
  try {
    const validation = NotificationSchema.safeParse({
      userId,
      message,
      link: options?.link,
      type: options?.type,
    });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map((e) => e.message).join(", "),
      };
    }

    const notification = await db.notification.create({
      data: {
        userId: validation.data.userId,
        message: validation.data.message,
        link: validation.data.link,
        type: validation.data.type,
        read: false,
      },
      select: { id: true },
    });

    return {
      success: true,
      notificationId: notification.id,
    };
  } catch (error) {
    console.error("Notification creation failed:", error);
    return {
      success: false,
      error: "Failed to create notification",
    };
  }
};

export const getFundType = async () => {
  // Fetch distinct fund types from the database
  const fundTypes = await db.approvedActionPlanDetails.findMany({
    select: { schemeName: true },
    distinct: ["schemeName"],
  });

  return fundTypes;
}
// Prisma or Mongoose connection

export interface EnquiryFinding {
  serialNumber: string;
  particulars: string;
  details: string;
}

export interface DocumentVerified {
  serialNumber: string;
  documentName: string;
  documentNumber?: string;
  issuedAuthority: string;
}

export interface DomicileEnquiryReport {
  id?: string;
 
  memoNo: string;
  memoDate: string;
  letterNumber?: string;
  letterDate?: string;
  applicantName: string;
  applicantFatherName: string;
  applicantAddress: string;
  applicantVillage: string;
  applicantPostOffice: string;
  applicantDistrict: string;
  applicantState: string;
  enquiryFindings: EnquiryFinding[];
  documentsVerified: DocumentVerified[];
  isPermanentResident: boolean;
  finalRemarks?: string;
 
}

// Server action to fetch a single report
export async function getDomicileEnquiryReportById(id: string): Promise<DomicileEnquiryReport | null> {
  const record = await db.domicileCertificateEnquiry.findUnique({
    where: { id },
    include: { enquiryFindings: true, documentsVerified: true },
  });

  if (!record) return null;

  return {
   
    memoNo: record.memoNo,
   memoDate: record.memoDate ? new Date(record.memoDate).toISOString() : "",
    letterNumber: record.letterNumber || "",
    letterDate: record.letterDate ? new Date(record.letterDate).toISOString() : "",
    applicantName: record.applicantName,
    applicantFatherName: record.applicantFatherName,
    applicantAddress: record.applicantAddress,
    applicantVillage: record.applicantVillage,
    applicantPostOffice: record.applicantPostOffice,
    applicantDistrict: record.applicantDistrict,
    applicantState: record.applicantState,
    enquiryFindings: record.enquiryFindings.map((f: any) => ({
      serialNumber: f.serialNumber,
      particulars: f.particulars,
      details: f.details,
    })),
    documentsVerified: record.documentsVerified.map((d: any) => ({
      serialNumber: d.serialNumber,
      documentName: d.documentName,
      documentNumber: d.documentNumber || "N/A",
      issuedAuthority: d.issuedAuthority,
    })),
    isPermanentResident: record.isPermanentResident,
    finalRemarks: record.finalRemarks || "",
   
  };
    }

