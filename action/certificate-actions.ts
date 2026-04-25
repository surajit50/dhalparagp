"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  certificateFormSchema,
  type CertificateFormInput,
} from "@/schema/family-lineage-certificate-schema";
import { generateCertificateNumber } from "@/lib/certificate";
import {
  CertificateStatus,
  type ActionResult,
  type Certificate,
} from "@/types";

export async function createCertificate(
  formData: CertificateFormInput,
  isDraft = false
): Promise<ActionResult<Certificate>> {
  try {
    // Validate input
    const validatedData = certificateFormSchema.parse(formData);

    // Generate certificate number
    const certificateNo = generateCertificateNumber();

    // Create certificate
    const certificate = await db.familyLineageCertificate.create({
      data: {
        certificateNo,
        status: isDraft
          ? CertificateStatus.DRAFT
          : CertificateStatus.FIELD_ENQUIRY_PENDING,
        validityMonths: 6,

        // Applicant Information
        applicantName: validatedData.applicantName,
        applicantPhone: validatedData.applicantPhone,
        applicantEmail: validatedData.applicantEmail || null,
        applicantAddress: validatedData.applicantAddress,

        // Ancestor Information
        ancestorName: validatedData.ancestorName,
        casteCategory: validatedData.casteCategory,

        // Address Information
        village: validatedData.village,
        postOffice: validatedData.postOffice,
        block: validatedData.block,
        district: validatedData.district,
        state: validatedData.state,

        // Create family members
        familyMembers: {
          create: validatedData.familyMembers.map((member, index) => ({
            name: member.name,
            relation: member.relation,
            age: member.age,
            occupation: member.occupation,
            parentId: member.parentId,
          })),
        },
      },
      include: {
        familyMembers: true,
      },
    });

    revalidatePath("/certificates", 'page');

    return {
      success: true,
      data: certificate as Certificate,
      message: isDraft
        ? "Certificate saved as draft successfully"
        : "Certificate application submitted successfully",
    };
  } catch (error) {
    console.error("Error creating certificate:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create certificate",
    };
  }
}

export async function updateCertificate(
  id: string,
  formData: CertificateFormInput
): Promise<ActionResult<Certificate>> {
  try {
    const validatedData = certificateFormSchema.parse(formData);

    // Delete existing family members and create new ones
    await db.familyMember.deleteMany({
      where: { certificateId: id },
    });

    const certificate = await db.familyLineageCertificate.update({
      where: { id },
      data: {
        // Applicant Information
        applicantName: validatedData.applicantName,
        applicantPhone: validatedData.applicantPhone,
        applicantEmail: validatedData.applicantEmail || null,
        applicantAddress: validatedData.applicantAddress,

        // Ancestor Information
        ancestorName: validatedData.ancestorName,
        casteCategory: validatedData.casteCategory,

        // Address Information
        village: validatedData.village,
        postOffice: validatedData.postOffice,
        block: validatedData.block,
        district: validatedData.district,
        state: validatedData.state,

        // Recreate family members
        familyMembers: {
          create: validatedData.familyMembers.map((member) => ({
            name: member.name,
            relation: member.relation,
            age: member.age,
            occupation: member.occupation,
            parentId: member.parentId,
          })),
        },
      },
      include: {
        familyMembers: true,
      },
    });

    revalidatePath("/certificates", 'page');

    return {
      success: true,
      data: certificate as Certificate,
      message: "Certificate updated successfully",
    };
  } catch (error) {
    console.error("Error updating certificate:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update certificate",
    };
  }
}

export async function getCertificates(): Promise<ActionResult<Certificate[]>> {
  try {
    const certificates = await db.familyLineageCertificate.findMany({
      include: {
        familyMembers: true,
        fieldEnquiry: true,
        approvals: true,
        renewals: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: certificates as Certificate[],
    };
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return {
      success: false,
      error: "Failed to fetch certificates",
    };
  }
}

export async function getCertificateById(
  id: string
): Promise<ActionResult<Certificate>> {
  try {
    const certificate = await db.familyLineageCertificate.findUnique({
      where: { id },
      include: {
        familyMembers: true,
        fieldEnquiry: true,
        approvals: true,
        renewals: true,
      },
    });

    if (!certificate) {
      return {
        success: false,
        error: "Certificate not found",
      };
    }

    return {
      success: true,
      data: certificate as Certificate,
    };
  } catch (error) {
    console.error("Error fetching certificate:", error);
    return {
      success: false,
      error: "Failed to fetch certificate",
    };
  }
}

export async function deleteCertificate(id: string): Promise<ActionResult> {
  try {
    await db.familyLineageCertificate.delete({
      where: { id },
    });

    revalidatePath("/certificates", 'page');

    return {
      success: true,
      message: "Certificate deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting certificate:", error);
    return {
      success: false,
      error: "Failed to delete certificate",
    };
  }
}
