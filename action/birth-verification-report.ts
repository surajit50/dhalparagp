"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import {
  birthVerificationReportSchema,
  updateBirthVerificationReportSchema,
  type BirthVerificationReportFormData,
  type BirthVerificationFilters,
} from "@/schema/birth-verification-report";

export type ServerActionResult<T> = {
  success: boolean;
  data?: T;
  message: string;
  errors?: Record<string, any>;
};

export async function createBirthVerificationReport(
  formData: BirthVerificationReportFormData,
  isDraft = false
): Promise<ServerActionResult<any>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return {
        success: false,
        message: "Unauthorized: Please login to continue",
      };
    }

    const validatedData = birthVerificationReportSchema.parse(formData);

    const report = await db.birthVerificationReport.create({
      data: {
        memoNo: validatedData.memoNo,
        memoDate: validatedData.memoDate,
        gpMemoNo: validatedData.gpMemoNo,
        gpMemoDate: validatedData.gpMemoDate,
        toAuthority: validatedData.toAuthority,
        toZone: validatedData.toZone,
        subject: validatedData.subject,
        certificateHolder: validatedData.certificateHolder,
        motherName: validatedData.motherName,
        fatherName: validatedData.fatherName,
        address: validatedData.address,
        dateOfBirth: validatedData.dateOfBirth,
        registrationNo: validatedData.registrationNo,
        dateOfRegistration: validatedData.dateOfRegistration,
        placeOfRegistration: validatedData.placeOfRegistration,
        isGenuine: validatedData.isGenuine,
        remarks: validatedData.remarks || null,
        status: isDraft ? "DRAFT" : "PENDING",
        createdByUser: { connect: { id: userId } },
      },
    });

    revalidatePath("/admindashboard/birth-verification", 'page');
    revalidatePath("/dashboard", 'page');

    return {
      success: true,
      data: report,
      message: isDraft 
        ? "Birth verification report draft saved successfully" 
        : "Birth verification report submitted successfully",
    };
  } catch (error) {
    console.error("Error creating birth verification report:", error);
    return {
      success: false,
      message: "Failed to create birth verification report",
      errors: error instanceof Error ? { message: error.message } : undefined,
    };
  }
}

export async function getBirthVerificationReport(
  id: string
): Promise<ServerActionResult<any>> {
  try {
    const report = await db.birthVerificationReport.findUnique({
      where: { id },
      include: {
        createdByUser: { select: { id: true, name: true, email: true } },
      },
    });

    if (!report) {
      return { success: false, message: "Report not found" };
    }

    return {
      success: true,
      data: report,
      message: "Report retrieved successfully",
    };
  } catch (error) {
    console.error("Error fetching report:", error);
    return {
      success: false,
      message: "Failed to fetch report",
      errors: error instanceof Error ? { message: error.message } : undefined,
    };
  }
}

export async function getBirthVerificationReports(
  filters?: BirthVerificationFilters
): Promise<ServerActionResult<any[]>> {
  try {
    const whereClause: any = {};

    if (filters?.status) whereClause.status = filters.status;
    
    if (filters?.certificateHolder) {
      whereClause.certificateHolder = {
        contains: filters.certificateHolder,
        mode: "insensitive",
      };
    }

    if (filters?.registrationNo) {
      whereClause.registrationNo = {
        contains: filters.registrationNo,
        mode: "insensitive",
      };
    }

    if (filters?.dateFrom || filters?.dateTo) {
      whereClause.createdAt = {};
      if (filters.dateFrom) whereClause.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) whereClause.createdAt.lte = filters.dateTo;
    }

    const reports = await db.birthVerificationReport.findMany({
      where: whereClause,
      include: {
        createdByUser: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: reports,
      message: "Reports retrieved successfully",
    };
  } catch (error) {
    console.error("Error fetching reports:", error);
    return {
      success: false,
      message: "Failed to fetch reports",
      errors: error instanceof Error ? { message: error.message } : undefined,
    };
  }
}

export async function updateBirthVerificationReport(
  id: string,
  formData: Partial<BirthVerificationReportFormData>
): Promise<ServerActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized: Please login to continue",
      };
    }

    const validatedData = updateBirthVerificationReportSchema.parse(formData);

    const report = await db.birthVerificationReport.update({
      where: { id },
      data: {
        memoNo: validatedData.memoNo,
        memoDate: validatedData.memoDate,
        gpMemoNo: validatedData.gpMemoNo,
        gpMemoDate: validatedData.gpMemoDate,
        toAuthority: validatedData.toAuthority,
        toZone: validatedData.toZone,
        subject: validatedData.subject,
        certificateHolder: validatedData.certificateHolder,
        motherName: validatedData.motherName,
        fatherName: validatedData.fatherName,
        address: validatedData.address,
        dateOfBirth: validatedData.dateOfBirth,
        registrationNo: validatedData.registrationNo,
        dateOfRegistration: validatedData.dateOfRegistration,
        placeOfRegistration: validatedData.placeOfRegistration,
        isGenuine: validatedData.isGenuine,
        remarks: validatedData.remarks || null,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admindashboard/birth-verification", 'page');
    revalidatePath("/dashboard", 'page');

    return {
      success: true,
      data: report,
      message: "Birth verification report updated successfully",
    };
  } catch (error) {
    console.error("Error updating birth verification report:", error);
    return {
      success: false,
      message: "Failed to update report",
      errors: error instanceof Error ? { message: error.message } : undefined,
    };
  }
}

export async function updateBirthVerificationStatus(
  id: string,
  status: "PENDING" | "APPROVED" | "REJECTED"
): Promise<ServerActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized: Please login to continue",
      };
    }

    const report = await db.birthVerificationReport.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });

    revalidatePath("/admindashboard/birth-verification", 'page');
    revalidatePath("/dashboard", 'page');

    return {
      success: true,
      data: report,
      message: `Report status updated to ${status}`,
    };
  } catch (error) {
    console.error("Error updating report status:", error);
    return {
      success: false,
      message: "Failed to update report status",
      errors: error instanceof Error ? { message: error.message } : undefined,
    };
  }
}

export async function deleteBirthVerificationReport(
  id: string
): Promise<ServerActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized: Please login to continue",
      };
    }

    await db.birthVerificationReport.delete({ where: { id } });

    revalidatePath("/admindashboard/birth-verification", 'page');
    revalidatePath("/dashboard", 'page');

    return { success: true, message: "Report deleted successfully" };
  } catch (error) {
    console.error("Error deleting report:", error);
    return {
      success: false,
      message: "Failed to delete report",
      errors: error instanceof Error ? { message: error.message } : undefined,
    };
  }
}
