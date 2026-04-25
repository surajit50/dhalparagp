"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import {
  domicileCertificateEnquirySchema,
  updateDomicileCertificateEnquirySchema,
  enquiryFiltersSchema,
  type DomicileCertificateEnquiryFormData,
  type EnquiryFilters,
} from "@/schema/domicile-certificate-enquiry";

export type ServerActionResult<T> = {
  success: boolean;
  data?: T;
  message: string;
  errors?: Record<string, any>;
};

export async function createDomicileCertificateEnquiry(
  formData: DomicileCertificateEnquiryFormData,
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

    const validatedData = domicileCertificateEnquirySchema.parse(formData);

    const result = await db.$transaction(async (tx) => {
      const enquiry = await tx.domicileCertificateEnquiry.create({
        data: {
          memoNo: validatedData.memoNo,
          memoDate: validatedData.memoDate,
          letterNumber: validatedData.letterNumber,
          letterDate: validatedData.letterDate,
          applicantName: validatedData.applicantName,
          applicantFatherName: validatedData.applicantFatherName,
          applicantAddress: validatedData.applicantAddress,
          applicantVillage: validatedData.applicantVillage,
          applicantPostOffice: validatedData.applicantPostOffice,
          applicantDistrict: validatedData.applicantDistrict,
          applicantState: validatedData.applicantState,
          isPermanentResident: validatedData.isPermanentResident,
          finalRemarks: validatedData.finalRemarks,
          status: isDraft ? "DRAFT" : "PENDING",
          createdByUser: { connect: { id: userId } },
        },
      });

      if (validatedData.enquiryFindings.length > 0) {
        await tx.enquiryFinding.createMany({
          data: validatedData.enquiryFindings.map((finding) => ({
            domicileCertificateEnquiryId: enquiry.id,
            serialNumber: finding.serialNumber,
            particulars: finding.particulars,
            details: finding.details,
          })),
        });
      }

      if (validatedData.documentsVerified.length > 0) {
        await tx.documentVerified.createMany({
          data: validatedData.documentsVerified.map((doc) => ({
            domicileCertificateEnquiryId: enquiry.id,
            serialNumber: doc.serialNumber,
            documentName: doc.documentName,
            documentNumber: doc.documentNumber,
            issuedAuthority: doc.issuedAuthority,
          })),
        });
      }

      return enquiry;
    });

    revalidatePath("/admindashboard/domicile-certificate-enquiry", 'page');
    revalidatePath("/dashboard", 'page');

    return {
      success: true,
      data: result,
      message: isDraft 
        ? "Domicile certificate enquiry draft saved successfully" 
        : "Domicile certificate enquiry submitted successfully",
    };
  } catch (error) {
    console.error("Error creating domicile certificate enquiry:", error);
    return {
      success: false,
      message: "Failed to create enquiry",
      errors: error instanceof Error ? { message: error.message } : undefined,
    };
  }
}

export async function getDomicileCertificateEnquiry(
  id: string
): Promise<ServerActionResult<any>> {
  try {
    const enquiry = await db.domicileCertificateEnquiry.findUnique({
      where: { id },
      include: {
        enquiryFindings: { orderBy: { serialNumber: "asc" } },
        documentsVerified: { orderBy: { serialNumber: "asc" } },
        createdByUser: { select: { id: true, name: true, email: true } },
      },
    });

    if (!enquiry) {
      return { success: false, message: "Enquiry not found" };
    }

    return {
      success: true,
      data: enquiry,
      message: "Enquiry retrieved successfully",
    };
  } catch (error) {
    console.error("Error fetching enquiry:", error);
    return {
      success: false,
      message: "Failed to fetch enquiry",
      errors: error instanceof Error ? { message: error.message } : undefined,
    };
  }
}

export async function getDomicileCertificateEnquiries(
  filters?: EnquiryFilters
): Promise<ServerActionResult<any[]>> {
  try {
    const whereClause: any = {};

    if (filters?.status) whereClause.status = filters.status;
    
    if (filters?.applicantName) {
      whereClause.applicantName = {
        contains: filters.applicantName,
        mode: "insensitive",
      };
    }

    if (filters?.applicantVillage) {
      whereClause.applicantVillage = {
        contains: filters.applicantVillage,
        mode: "insensitive",
      };
    }

    if (filters?.dateFrom || filters?.dateTo) {
      whereClause.createdAt = {};
      if (filters.dateFrom) whereClause.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) whereClause.createdAt.lte = filters.dateTo;
    }

    const enquiries = await db.domicileCertificateEnquiry.findMany({
      where: whereClause,
      include: {
        enquiryFindings: { orderBy: { serialNumber: "asc" } },
        documentsVerified: { orderBy: { serialNumber: "asc" } },
        createdByUser: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: enquiries,
      message: "Enquiries retrieved successfully",
    };
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    return {
      success: false,
      message: "Failed to fetch enquiries",
      errors: error instanceof Error ? { message: error.message } : undefined,
    };
  }
}

export async function updateDomicileCertificateEnquiry(
  id: string,
  formData: Partial<DomicileCertificateEnquiryFormData>
): Promise<ServerActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized: Please login to continue",
      };
    }

    const validatedData = updateDomicileCertificateEnquirySchema.parse(formData);

    const result = await db.$transaction(async (tx) => {
      const enquiry = await tx.domicileCertificateEnquiry.update({
        where: { id },
        data: {
          memoNo: validatedData.memoNo,
          memoDate: validatedData.memoDate,
          letterNumber: validatedData.letterNumber,
          letterDate: validatedData.letterDate,
          applicantName: validatedData.applicantName,
          applicantFatherName: validatedData.applicantFatherName,
          applicantAddress: validatedData.applicantAddress,
          applicantVillage: validatedData.applicantVillage,
          applicantPostOffice: validatedData.applicantPostOffice,
          applicantDistrict: validatedData.applicantDistrict,
          applicantState: validatedData.applicantState,
          isPermanentResident: validatedData.isPermanentResident,
          finalRemarks: validatedData.finalRemarks,
          updatedAt: new Date(),
        },
      });

      if (validatedData.enquiryFindings !== undefined) {
        await tx.enquiryFinding.deleteMany({
          where: { domicileCertificateEnquiryId: id },
        });

        if (validatedData.enquiryFindings.length > 0) {
          await tx.enquiryFinding.createMany({
            data: validatedData.enquiryFindings.map((finding) => ({
              domicileCertificateEnquiryId: id,
              serialNumber: finding.serialNumber,
              particulars: finding.particulars,
              details: finding.details,
            })),
          });
        }
      }

      if (validatedData.documentsVerified !== undefined) {
        await tx.documentVerified.deleteMany({
          where: { domicileCertificateEnquiryId: id },
        });

        if (validatedData.documentsVerified.length > 0) {
          await tx.documentVerified.createMany({
            data: validatedData.documentsVerified.map((doc) => ({
              domicileCertificateEnquiryId: id,
              serialNumber: doc.serialNumber,
              documentName: doc.documentName,
              documentNumber: doc.documentNumber,
              issuedAuthority: doc.issuedAuthority,
            })),
          });
        }
      }

      return enquiry;
    });

    revalidatePath("/admindashboard/domicile-certificate-enquiry", 'page');
    revalidatePath("/dashboard", 'page');

    return {
      success: true,
      data: result,
      message: "Enquiry updated successfully",
    };
  } catch (error) {
    console.error("Error updating enquiry:", error);
    return {
      success: false,
      message: "Failed to update enquiry",
      errors: error instanceof Error ? { message: error.message } : undefined,
    };
  }
}

export async function updateEnquiryStatus(
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

    const enquiry = await db.domicileCertificateEnquiry.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });

    revalidatePath("/admindashboard/domicile-certificate-enquiry", 'page');
    revalidatePath("/dashboard", 'page');

    return {
      success: true,
      data: enquiry,
      message: `Enquiry status updated to ${status}`,
    };
  } catch (error) {
    console.error("Error updating enquiry status:", error);
    return {
      success: false,
      message: "Failed to update enquiry status",
      errors: error instanceof Error ? { message: error.message } : undefined,
    };
  }
}

export async function deleteDomicileCertificateEnquiry(
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

    await db.domicileCertificateEnquiry.delete({ where: { id } });

    revalidatePath("/admindashboard/domicile-certificate-enquiry", 'page');
    revalidatePath("/dashboard", 'page');

    return { success: true, message: "Enquiry deleted successfully" };
  } catch (error) {
    console.error("Error deleting enquiry:", error);
    return {
      success: false,
      message: "Failed to delete enquiry",
      errors: error instanceof Error ? { message: error.message } : undefined,
    };
  }
}

// Convenience wrapper to match existing client usage
export async function getAllDomicileEnquiryReports() {
  const result = await getDomicileCertificateEnquiries();
  return result.data;
}



