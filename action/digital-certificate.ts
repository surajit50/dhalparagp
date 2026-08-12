"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import {
  digitalCertificateApplicationSchema,
  officeVerificationSchema,
  type DigitalCertificateApplicationFormData,
  type OfficeVerificationFormData,
  type DigitalCertificateFilters,
} from "@/schema/digital-certificate";

export type ServerActionResult<T> = {
  success: boolean;
  data?: T;
  message: string;
  errors?: Record<string, any>;
};

/**
 * Generate a unique Acknowledgement Number
 * Format: DBC/2026/0001 (Birth) or DDC/2026/0001 (Death)
 */
async function generateAcknowledgementNo(certificateType: "BIRTH" | "DEATH"): Promise<string> {
  const prefix = certificateType === "BIRTH" ? "DBC" : "DDC";
  const year = new Date().getFullYear();

  const count = await db.digitalCertificateApplication.count({
    where: {
      certificateType,
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
  });

  const nextSeq = (count + 1).toString().padStart(4, "0");
  let ackNo = `${prefix}/${year}/${nextSeq}`;

  // Ensure collision safety
  let exists = await db.digitalCertificateApplication.findUnique({
    where: { acknowledgementNo: ackNo },
  });

  let counter = 1;
  while (exists) {
    const fallbackSeq = (count + 1 + counter).toString().padStart(4, "0");
    ackNo = `${prefix}/${year}/${fallbackSeq}`;
    exists = await db.digitalCertificateApplication.findUnique({
      where: { acknowledgementNo: ackNo },
    });
    counter++;
  }

  return ackNo;
}

/**
 * Create a new Digital Certificate Application
 */
export async function createDigitalCertificateApplication(
  formData: DigitalCertificateApplicationFormData
): Promise<ServerActionResult<any>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const validated = digitalCertificateApplicationSchema.parse(formData);

    const regNoTrimmed = validated.registrationNumber.trim();
    const regYearTrimmed = validated.registrationYear.trim();
    const personNameTrimmed = validated.personName.trim();

    // 1. Unique Registration Number check (per certificate type and registration year)
    const existingRegNo = await db.digitalCertificateApplication.findFirst({
      where: {
        registrationNumber: { equals: regNoTrimmed, mode: "insensitive" },
        registrationYear: regYearTrimmed,
        certificateType: validated.certificateType,
      },
    });

    if (existingRegNo) {
      return {
        success: false,
        message: `Registration Number "${regNoTrimmed}" already exists for year ${regYearTrimmed} (${validated.certificateType}). Duplicate registration numbers are not allowed.`,
        errors: { registrationNumber: `Registration Number "${regNoTrimmed}" is already registered` },
      };
    }

    // 2. Duplicate entry check (same Person Name, Date of Birth/Event, and Registration Year)
    const eventDate = new Date(validated.dateOfEvent);
    const startOfDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 0, 0, 0);
    const endOfDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 23, 59, 59);

    const existingPerson = await db.digitalCertificateApplication.findFirst({
      where: {
        personName: { equals: personNameTrimmed, mode: "insensitive" },
        certificateType: validated.certificateType,
        registrationYear: regYearTrimmed,
        dateOfEvent: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingPerson) {
      const eventTypeLabel = validated.certificateType === "BIRTH" ? "Birth" : "Death";
      const formattedDateStr = eventDate.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
      return {
        success: false,
        message: `An application for "${personNameTrimmed}" with the same Date of ${eventTypeLabel} (${formattedDateStr}) and Registration Year (${regYearTrimmed}) already exists (Ack No: ${existingPerson.acknowledgementNo}). Duplicate entries are not allowed.`,
        errors: { personName: `Duplicate entry found for "${personNameTrimmed}" with Date of ${eventTypeLabel} in year ${regYearTrimmed}` },
      };
    }

    const acknowledgementNo = await generateAcknowledgementNo(validated.certificateType);

    const application = await db.digitalCertificateApplication.create({
      data: {
        acknowledgementNo,
        certificateType: validated.certificateType,
        status: "SUBMITTED",
        applicantName: validated.applicantName.trim(),
        relationshipWithPerson: validated.relationshipWithPerson?.trim() || null,
        fatherOrHusbandName: validated.fatherOrHusbandName.trim(),
        postalAddress: validated.postalAddress.trim(),
        mobileNumber: validated.mobileNumber.trim(),
        personName: validated.personName.trim(),
        fatherName: validated.fatherName?.trim() || null,
        motherName: validated.motherName?.trim() || null,
        deceasedFatherOrHusbandName: validated.deceasedFatherOrHusbandName?.trim() || null,
        dateOfEvent: validated.dateOfEvent,
        placeOfEvent: validated.placeOfEvent.trim(),
        registrationYear: validated.registrationYear.trim(),
        registrationNumber: validated.registrationNumber.trim(),
        purpose: validated.purpose.trim(),
        docProofOfIdentity: validated.docProofOfIdentity,
        docProofOfIdentityUrl: validated.docProofOfIdentityUrl || null,
        docProofOfIdentityPublicId: validated.docProofOfIdentityPublicId || null,

        docPreviousCertificate: validated.docPreviousCertificate,
        docPreviousCertificateUrl: validated.docPreviousCertificateUrl || null,
        docPreviousCertificatePublicId: validated.docPreviousCertificatePublicId || null,

        docGeneralDiary: validated.docGeneralDiary,
        docGeneralDiaryUrl: validated.docGeneralDiaryUrl || null,
        docGeneralDiaryPublicId: validated.docGeneralDiaryPublicId || null,

        docRegistrationDetails: validated.docRegistrationDetails,
        docRegistrationDetailsUrl: validated.docRegistrationDetailsUrl || null,
        docRegistrationDetailsPublicId: validated.docRegistrationDetailsPublicId || null,

        docOtherDocument: validated.docOtherDocument,
        docOtherDetails: validated.docOtherDetails?.trim() || null,
        docOtherDocumentUrl: validated.docOtherDocumentUrl || null,
        docOtherDocumentPublicId: validated.docOtherDocumentPublicId || null,

        // Section C2: Identity Documents for Verification
        docFatherAadhaar: validated.docFatherAadhaar,
        docFatherAadhaarUrl: validated.docFatherAadhaarUrl || null,
        docFatherAadhaarPublicId: validated.docFatherAadhaarPublicId || null,

        docFatherVoter: validated.docFatherVoter,
        docFatherVoterUrl: validated.docFatherVoterUrl || null,
        docFatherVoterPublicId: validated.docFatherVoterPublicId || null,

        docMotherAadhaar: validated.docMotherAadhaar,
        docMotherAadhaarUrl: validated.docMotherAadhaarUrl || null,
        docMotherAadhaarPublicId: validated.docMotherAadhaarPublicId || null,

        docMotherVoter: validated.docMotherVoter,
        docMotherVoterUrl: validated.docMotherVoterUrl || null,
        docMotherVoterPublicId: validated.docMotherVoterPublicId || null,

        docChildAadhaar: validated.docChildAadhaar,
        docChildAadhaarUrl: validated.docChildAadhaarUrl || null,
        docChildAadhaarPublicId: validated.docChildAadhaarPublicId || null,

        declarationPlace: validated.declarationPlace || "Dhalpara",
        declarationDate: validated.declarationDate || new Date(),
        applicantSignatureName: validated.applicantSignatureName || validated.applicantName,
        applicationReceivedOn: new Date(),
        userId: userId || null,
      },
    });

    revalidatePath("/dashboard/digital-certificate/status", "page");
    revalidatePath("/admindashboard/manage-digital-certificate", "page");

    return {
      success: true,
      data: application,
      message: `Application submitted successfully! Your Acknowledgement No is ${acknowledgementNo}`,
    };
  } catch (error: any) {
    console.error("Error creating digital certificate application:", error);
    return {
      success: false,
      message: error?.message || "Failed to submit application. Please try again.",
      errors: error?.errors || undefined,
    };
  }
}

/**
 * Get an application by ID or Acknowledgement Number
 */
export async function getDigitalCertificateApplication(
  idOrAck: string
): Promise<ServerActionResult<any>> {
  try {
    if (!idOrAck) {
      return { success: false, message: "Application identifier is required" };
    }

    let application = null;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrAck.trim());

    if (isObjectId) {
      application = await db.digitalCertificateApplication.findUnique({
        where: { id: idOrAck.trim() },
        include: {
          user: {
            select: { id: true, name: true, email: true, mobileNumber: true },
          },
        },
      });
    }

    if (!application) {
      application = await db.digitalCertificateApplication.findUnique({
        where: { acknowledgementNo: idOrAck.trim().toUpperCase() },
        include: {
          user: {
            select: { id: true, name: true, email: true, mobileNumber: true },
          },
        },
      });
    }

    if (!application) {
      return { success: false, message: "Application not found" };
    }

    return {
      success: true,
      data: application,
      message: "Application retrieved successfully",
    };
  } catch (error: any) {
    console.error("Error fetching application:", error);
    return {
      success: false,
      message: error?.message || "Failed to retrieve application",
    };
  }
}

/**
 * Get current user's submitted applications
 */
export async function getMyDigitalCertificateApplications(): Promise<ServerActionResult<any[]>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return {
        success: false,
        message: "Please login to view your applications",
        data: [],
      };
    }

    // Retrieve user record to also match by mobile number if available
    const dbUser = await db.user.findUnique({
      where: { id: userId },
      select: { mobileNumber: true },
    });

    const userMobile = dbUser?.mobileNumber;

    const whereOr: any[] = [{ userId }];
    if (userMobile) whereOr.push({ mobileNumber: userMobile });

    const applications = await db.digitalCertificateApplication.findMany({
      where: {
        OR: whereOr,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: applications,
      message: "Applications retrieved successfully",
    };
  } catch (error: any) {
    console.error("Error fetching user applications:", error);
    return {
      success: false,
      message: error?.message || "Failed to retrieve applications",
      data: [],
    };
  }
}

/**
 * Get all applications with search and filters (Admin)
 */
export async function getAllDigitalCertificateApplications(
  filters?: DigitalCertificateFilters
): Promise<ServerActionResult<{ applications: any[]; total: number; totalPages: number; page: number }>> {
  try {
    const page = filters?.page || 1;
    const limit = filters?.limit || 15;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.certificateType && filters.certificateType !== "ALL") {
      where.certificateType = filters.certificateType;
    }

    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status;
    }

    if (filters?.year && filters.year.trim()) {
      where.registrationYear = filters.year.trim();
    }

    if (filters?.search && filters.search.trim()) {
      const search = filters.search.trim();
      where.OR = [
        { acknowledgementNo: { contains: search, mode: "insensitive" } },
        { personName: { contains: search, mode: "insensitive" } },
        { applicantName: { contains: search, mode: "insensitive" } },
        { mobileNumber: { contains: search, mode: "insensitive" } },
        { registrationNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, applications] = await Promise.all([
      db.digitalCertificateApplication.count({ where }),
      db.digitalCertificateApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        applications,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        page,
      },
      message: "Applications retrieved successfully",
    };
  } catch (error: any) {
    console.error("Error fetching all applications:", error);
    return {
      success: false,
      message: error?.message || "Failed to retrieve applications",
    };
  }
}

/**
 * Update Office Verification and Sub-Registrar Order (Admin)
 * Now supports UNDER_ENQUIRY status
 */
export async function updateOfficeVerification(
  id: string,
  formData: OfficeVerificationFormData
): Promise<ServerActionResult<any>> {
  try {
    const session = await auth();
    const role = session?.user?.role;

    if (!session?.user || !["admin", "superadmin", "staff"].includes(role as string)) {
      return {
        success: false,
        message: "Unauthorized: Admin privileges required",
      };
    }

    const validated = officeVerificationSchema.parse(formData);

    // Map subRegistrarOrder to application status
    let status = "UNDER_ENQUIRY";
    if (validated.subRegistrarOrder === "APPROVED") {
      status = "APPROVED";
    } else if (validated.subRegistrarOrder === "REJECTED") {
      status = "REJECTED";
    }
    // For "UNDER_ENQUIRY", status remains "UNDER_ENQUIRY"

    const updated = await db.digitalCertificateApplication.update({
      where: { id },
      data: {
        status,
        applicationReceivedOn: validated.applicationReceivedOn,
        registerNoPageNoSerialNo: validated.registerNoPageNoSerialNo?.trim() || null,
        officeRegistrationYear: validated.officeRegistrationYear?.trim() || null,
        officeRegistrationNo: validated.officeRegistrationNo?.trim() || null,
        dateOfVerification: validated.dateOfVerification || new Date(),
        recordAvailable: validated.recordAvailable,
        registrationVerified: validated.registrationVerified,
        subRegistrarOrder: validated.subRegistrarOrder || null,
        rejectionReason: validated.rejectionReason?.trim() || null,
        dataEntryOperatorSignature: validated.dataEntryOperatorSignature || null,
        dataEntryOperatorName: validated.dataEntryOperatorName?.trim() || null,
        dataEntryOperatorDate: validated.dataEntryOperatorDate || null,
        subRegistrarSignature: validated.subRegistrarSignature || null,
        subRegistrarName: validated.subRegistrarName?.trim() || null,
        subRegistrarDate: validated.subRegistrarDate || null,
        issuedCertificateUrl: validated.issuedCertificateUrl !== undefined ? validated.issuedCertificateUrl : undefined,
        issuedCertificateDate: validated.issuedCertificateUrl ? new Date() : undefined,
      },
    });

    revalidatePath("/dashboard/digital-certificate/status", "page");
    revalidatePath("/admindashboard/manage-digital-certificate", "page");

    return {
      success: true,
      data: updated,
      message: "Office verification and order updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating office verification:", error);
    return {
      success: false,
      message: error?.message || "Failed to update verification details",
    };
  }
}

/**
 * Get statistical overview for dashboards
 */
export async function getDigitalCertificateStats(): Promise<ServerActionResult<{
  total: number;
  birthCount: number;
  deathCount: number;
  submittedCount: number;
  underEnquiryCount: number;
  approvedCount: number;
  rejectedCount: number;
}>> {
  try {
    const [
      total,
      birthCount,
      deathCount,
      submittedCount,
      underEnquiryCount,
      approvedCount,
      rejectedCount,
    ] = await Promise.all([
      db.digitalCertificateApplication.count(),
      db.digitalCertificateApplication.count({ where: { certificateType: "BIRTH" } }),
      db.digitalCertificateApplication.count({ where: { certificateType: "DEATH" } }),
      db.digitalCertificateApplication.count({ where: { status: "SUBMITTED" } }),
      db.digitalCertificateApplication.count({ where: { status: "UNDER_ENQUIRY" } }),
      db.digitalCertificateApplication.count({ where: { status: "APPROVED" } }),
      db.digitalCertificateApplication.count({ where: { status: "REJECTED" } }),
    ]);

    return {
      success: true,
      data: {
        total,
        birthCount,
        deathCount,
        submittedCount,
        underEnquiryCount,
        approvedCount,
        rejectedCount,
      },
      message: "Stats retrieved successfully",
    };
  } catch (error: any) {
    console.error("Error fetching certificate stats:", error);
    return {
      success: false,
      message: error?.message || "Failed to retrieve statistics",
      data: {
        total: 0,
        birthCount: 0,
        deathCount: 0,
        submittedCount: 0,
        underEnquiryCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
      },
    };
  }
}

/**
 * Delete application (Admin only)
 */
export async function deleteDigitalCertificateApplication(
  id: string
): Promise<ServerActionResult<null>> {
  try {
    const session = await auth();
    const role = session?.user?.role;

    if (!session?.user || !["admin", "superadmin"].includes(role as string)) {
      return {
        success: false,
        message: "Unauthorized: Admin privileges required",
      };
    }

    await db.digitalCertificateApplication.delete({
      where: { id },
    });

    revalidatePath("/admindashboard/manage-digital-certificate", "page");

    return {
      success: true,
      data: null,
      message: "Application deleted successfully",
    };
  } catch (error: any) {
    console.error("Error deleting application:", error);
    return {
      success: false,
      message: error?.message || "Failed to delete application",
    };
  }
}

/**
 * Update application field data (Admin edit)
 */
export async function updateDigitalCertificateApplication(
  id: string,
  formData: any
): Promise<ServerActionResult<any>> {
  try {
    const session = await auth();
    const role = session?.user?.role;

    if (!session?.user || !["admin", "superadmin", "staff"].includes(role as string)) {
      return {
        success: false,
        message: "Unauthorized: Admin privileges required",
      };
    }

    const existing = await db.digitalCertificateApplication.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, message: "Application not found" };
    }

    const targetRegNo = formData.registrationNumber ? formData.registrationNumber.trim() : existing.registrationNumber;
    const targetRegYear = formData.registrationYear ? formData.registrationYear.trim() : existing.registrationYear;
    const targetType = formData.certificateType || existing.certificateType;
    const targetPersonName = formData.personName ? formData.personName.trim() : existing.personName;
    const targetDateOfEvent = formData.dateOfEvent ? new Date(formData.dateOfEvent) : existing.dateOfEvent;

    // 1. Unique Registration Number check (excluding current ID)
    const duplicateRegNo = await db.digitalCertificateApplication.findFirst({
      where: {
        id: { not: id },
        registrationNumber: { equals: targetRegNo, mode: "insensitive" },
        registrationYear: targetRegYear,
        certificateType: targetType,
      },
    });

    if (duplicateRegNo) {
      return {
        success: false,
        message: `Registration Number "${targetRegNo}" is already in use by another application (Ack No: ${duplicateRegNo.acknowledgementNo}) in year ${targetRegYear}.`,
        errors: { registrationNumber: `Registration Number "${targetRegNo}" is already taken` },
      };
    }

    // 2. Duplicate entry check (same Person Name, Date of Birth/Event, and Registration Year, excluding current ID)
    const eventDate = new Date(targetDateOfEvent);
    const startOfDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 0, 0, 0);
    const endOfDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 23, 59, 59);

    const duplicatePerson = await db.digitalCertificateApplication.findFirst({
      where: {
        id: { not: id },
        personName: { equals: targetPersonName, mode: "insensitive" },
        certificateType: targetType,
        registrationYear: targetRegYear,
        dateOfEvent: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (duplicatePerson) {
      const eventTypeLabel = targetType === "BIRTH" ? "Birth" : "Death";
      const formattedDateStr = eventDate.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
      return {
        success: false,
        message: `Another application for "${targetPersonName}" with the same Date of ${eventTypeLabel} (${formattedDateStr}) and Registration Year (${targetRegYear}) already exists (Ack No: ${duplicatePerson.acknowledgementNo}).`,
        errors: { personName: `Duplicate entry found for "${targetPersonName}" in year ${targetRegYear}` },
      };
    }

    const updated = await db.digitalCertificateApplication.update({
      where: { id },
      data: {
        certificateType: formData.certificateType || existing.certificateType,
        status: formData.status || existing.status,
        applicantName: formData.applicantName ? formData.applicantName.trim() : existing.applicantName,
        relationshipWithPerson: formData.relationshipWithPerson !== undefined ? (formData.relationshipWithPerson?.trim() || null) : existing.relationshipWithPerson,
        fatherOrHusbandName: formData.fatherOrHusbandName ? formData.fatherOrHusbandName.trim() : existing.fatherOrHusbandName,
        postalAddress: formData.postalAddress ? formData.postalAddress.trim() : existing.postalAddress,
        mobileNumber: formData.mobileNumber ? formData.mobileNumber.trim() : existing.mobileNumber,
        personName: formData.personName ? formData.personName.trim() : existing.personName,
        fatherName: formData.fatherName !== undefined ? (formData.fatherName?.trim() || null) : existing.fatherName,
        motherName: formData.motherName !== undefined ? (formData.motherName?.trim() || null) : existing.motherName,
        deceasedFatherOrHusbandName: formData.deceasedFatherOrHusbandName !== undefined ? (formData.deceasedFatherOrHusbandName?.trim() || null) : existing.deceasedFatherOrHusbandName,
        dateOfEvent: formData.dateOfEvent ? new Date(formData.dateOfEvent) : existing.dateOfEvent,
        placeOfEvent: formData.placeOfEvent ? formData.placeOfEvent.trim() : existing.placeOfEvent,
        registrationYear: formData.registrationYear ? formData.registrationYear.trim() : existing.registrationYear,
        registrationNumber: formData.registrationNumber ? formData.registrationNumber.trim() : existing.registrationNumber,
        purpose: formData.purpose ? formData.purpose.trim() : existing.purpose,
        docProofOfIdentity: formData.docProofOfIdentity !== undefined ? Boolean(formData.docProofOfIdentity) : existing.docProofOfIdentity,
        docProofOfIdentityUrl: formData.docProofOfIdentityUrl !== undefined ? formData.docProofOfIdentityUrl : existing.docProofOfIdentityUrl,
        docPreviousCertificate: formData.docPreviousCertificate !== undefined ? Boolean(formData.docPreviousCertificate) : existing.docPreviousCertificate,
        docPreviousCertificateUrl: formData.docPreviousCertificateUrl !== undefined ? formData.docPreviousCertificateUrl : existing.docPreviousCertificateUrl,
        docGeneralDiary: formData.docGeneralDiary !== undefined ? Boolean(formData.docGeneralDiary) : existing.docGeneralDiary,
        docGeneralDiaryUrl: formData.docGeneralDiaryUrl !== undefined ? formData.docGeneralDiaryUrl : existing.docGeneralDiaryUrl,
        docRegistrationDetails: formData.docRegistrationDetails !== undefined ? Boolean(formData.docRegistrationDetails) : existing.docRegistrationDetails,
        docRegistrationDetailsUrl: formData.docRegistrationDetailsUrl !== undefined ? formData.docRegistrationDetailsUrl : existing.docRegistrationDetailsUrl,
        docOtherDocument: formData.docOtherDocument !== undefined ? Boolean(formData.docOtherDocument) : existing.docOtherDocument,
        docOtherDetails: formData.docOtherDetails !== undefined ? (formData.docOtherDetails?.trim() || null) : existing.docOtherDetails,
        docOtherDocumentUrl: formData.docOtherDocumentUrl !== undefined ? formData.docOtherDocumentUrl : existing.docOtherDocumentUrl,
        docFatherAadhaar: formData.docFatherAadhaar !== undefined ? Boolean(formData.docFatherAadhaar) : existing.docFatherAadhaar,
        docFatherAadhaarUrl: formData.docFatherAadhaarUrl !== undefined ? formData.docFatherAadhaarUrl : existing.docFatherAadhaarUrl,
        docFatherVoter: formData.docFatherVoter !== undefined ? Boolean(formData.docFatherVoter) : existing.docFatherVoter,
        docFatherVoterUrl: formData.docFatherVoterUrl !== undefined ? formData.docFatherVoterUrl : existing.docFatherVoterUrl,
        docMotherAadhaar: formData.docMotherAadhaar !== undefined ? Boolean(formData.docMotherAadhaar) : existing.docMotherAadhaar,
        docMotherAadhaarUrl: formData.docMotherAadhaarUrl !== undefined ? formData.docMotherAadhaarUrl : existing.docMotherAadhaarUrl,
        docMotherVoter: formData.docMotherVoter !== undefined ? Boolean(formData.docMotherVoter) : existing.docMotherVoter,
        docMotherVoterUrl: formData.docMotherVoterUrl !== undefined ? formData.docMotherVoterUrl : existing.docMotherVoterUrl,
        docChildAadhaar: formData.docChildAadhaar !== undefined ? Boolean(formData.docChildAadhaar) : existing.docChildAadhaar,
        docChildAadhaarUrl: formData.docChildAadhaarUrl !== undefined ? formData.docChildAadhaarUrl : existing.docChildAadhaarUrl,
        issuedCertificateUrl: formData.issuedCertificateUrl !== undefined ? formData.issuedCertificateUrl : existing.issuedCertificateUrl,
        issuedCertificateDate: formData.issuedCertificateUrl ? new Date() : existing.issuedCertificateDate,
        declarationPlace: formData.declarationPlace ? formData.declarationPlace.trim() : existing.declarationPlace,
        applicantSignatureName: formData.applicantSignatureName ? formData.applicantSignatureName.trim() : existing.applicantSignatureName,
      },
    });

    revalidatePath("/dashboard/digital-certificate/status", "page");
    revalidatePath("/admindashboard/manage-digital-certificate", "page");

    return {
      success: true,
      data: updated,
      message: "Application updated successfully!",
    };
  } catch (error: any) {
    console.error("Error updating application:", error);
    return {
      success: false,
      message: error?.message || "Failed to update application",
    };
  }
}

/**
 * Upload official issued Digital Certificate PDF (Admin Action)
 */
export async function uploadIssuedCertificate(
  id: string,
  issuedCertificateUrl: string,
  issuedCertificatePublicId?: string
): Promise<ServerActionResult<any>> {
  try {
    const session = await auth();
    const role = session?.user?.role;

    if (!session?.user || !["admin", "superadmin", "staff"].includes(role as string)) {
      return {
        success: false,
        message: "Unauthorized: Admin privileges required",
      };
    }

    const application = await db.digitalCertificateApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return { success: false, message: "Application not found" };
    }

    const updated = await db.digitalCertificateApplication.update({
      where: { id },
      data: {
        issuedCertificateUrl,
        issuedCertificatePublicId: issuedCertificatePublicId || null,
        issuedCertificateDate: new Date(),
        status: "APPROVED",
        subRegistrarOrder: "APPROVED",
      },
    });

    revalidatePath("/dashboard/digital-certificate/status", "page");
    revalidatePath("/admindashboard/manage-digital-certificate", "page");

    return {
      success: true,
      data: updated,
      message: "Official Digital Certificate PDF uploaded and issued successfully!",
    };
  } catch (error: any) {
    console.error("Error uploading issued certificate:", error);
    return {
      success: false,
      message: error?.message || "Failed to upload issued certificate PDF",
    };
  }
}
