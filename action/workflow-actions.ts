"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import {
  fieldEnquirySchema,
  approvalSchema,
  renewalSchema,
  type FieldEnquiryInput,
  type ApprovalInput,
  type RenewalInput,
} from "@/schema/family-lineage-certificate-schema"
import { calculateExpiryDate } from "@/lib/certificate"
import {
  CertificateStatus,
  EnquiryStatus,
  type ApprovalStatus,
  RenewalStatus,
  type ActionResult,
  type FieldEnquiry,
  type Approval,
  type Renewal,
} from "@/types"

export async function createFieldEnquiry(input: FieldEnquiryInput): Promise<ActionResult<FieldEnquiry>> {
  try {
    const validatedData = fieldEnquirySchema.parse(input)

    const fieldEnquiry = await db.fieldEnquiry.create({
      data: {
        certificateId: validatedData.certificateId,
        enquiryOfficer: validatedData.enquiryOfficer,
        enquiryDate: new Date(),
        findings: validatedData.findings,
        recommendations: validatedData.recommendations,
        status: EnquiryStatus.COMPLETED,
        witnessNames: validatedData.witnessNames || [],
        documentsVerified: validatedData.documentsVerified || [],
        communityVerified: validatedData.communityVerified,
      },
    })

    // Update certificate status
    await db.familyLineageCertificate.update({
      where: { id: validatedData.certificateId },
      data: { status: CertificateStatus.FIELD_ENQUIRY_COMPLETED },
    })

    revalidatePath("/certificates")

    return {
      success: true,
      data: fieldEnquiry as FieldEnquiry,
      message: "Field enquiry completed successfully",
    }
  } catch (error) {
    console.error("Error creating field enquiry:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete field enquiry",
    }
  }
}

export async function rejectFieldEnquiry(certificateId: string, findings: string): Promise<ActionResult> {
  try {
    await db.fieldEnquiry.create({
      data: {
        certificateId,
        enquiryOfficer: "System", // You might want to pass this as parameter
        enquiryDate: new Date(),
        findings,
        recommendations: "Application rejected based on field enquiry",
        status: EnquiryStatus.REJECTED,
        witnessNames: [],
        documentsVerified: [],
        communityVerified: false,
      },
    })

    // Update certificate status
    await db.familyLineageCertificate.update({
      where: { id: certificateId },
      data: { status: CertificateStatus.REJECTED },
    })

    revalidatePath("/certificates")

    return {
      success: true,
      message: "Application rejected successfully",
    }
  } catch (error) {
    console.error("Error rejecting field enquiry:", error)
    return {
      success: false,
      error: "Failed to reject application",
    }
  }
}

export async function createApproval(input: ApprovalInput): Promise<ActionResult<Approval>> {
  try {
    const validatedData = approvalSchema.parse(input)

    const approval = await db.approval.create({
      data: {
        certificateId: validatedData.certificateId,
        approverName: validatedData.approverName,
        designation: validatedData.designation,
        approvalDate: new Date(),
        status: validatedData.status as ApprovalStatus,
        comments: validatedData.comments,
        level: validatedData.level,
      },
    })

    // Update certificate status based on approval
    let newStatus: CertificateStatus
    if (validatedData.status === "APPROVED") {
      newStatus = CertificateStatus.APPROVED

      // If approved, issue the certificate
      const issueDate = new Date()
      const expiryDate = calculateExpiryDate(issueDate, 6)

      await db.familyLineageCertificate.update({
        where: { id: validatedData.certificateId },
        data: {
          status: CertificateStatus.ISSUED,
          issueDate,
          expiryDate,
          issuedBy: validatedData.approverName,
          designation: validatedData.designation,
        },
      })
    } else if (validatedData.status === "REJECTED") {
      newStatus = CertificateStatus.REJECTED
      await db.familyLineageCertificate.update({
        where: { id: validatedData.certificateId },
        data: { status: newStatus },
      })
    } else {
      newStatus = CertificateStatus.FIELD_ENQUIRY_PENDING
      await db.familyLineageCertificate.update({
        where: { id: validatedData.certificateId },
        data: { status: newStatus },
      })
    }

    revalidatePath("/certificates")

    return {
      success: true,
      data: approval as Approval,
      message: `Certificate ${validatedData.status.toLowerCase()} successfully`,
    }
  } catch (error) {
    console.error("Error creating approval:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process approval",
    }
  }
}

export async function createRenewal(input: RenewalInput): Promise<ActionResult<Renewal>> {
  try {
    const validatedData = renewalSchema.parse(input)

    const renewalDate = new Date()
    const newExpiryDate = calculateExpiryDate(renewalDate, 6)

    const renewal = await db.renewal.create({
      data: {
        originalCertificateId: validatedData.originalCertificateId,
        renewalDate,
        newExpiryDate,
        renewalReason: validatedData.renewalReason,
        status: RenewalStatus.COMPLETED,
        additionalNotes: validatedData.additionalNotes,
        processedBy: "System", // You might want to pass this as parameter
        processedDate: new Date(),
      },
    })

    // Update certificate with new expiry date
    await db.familyLineageCertificate.update({
      where: { id: validatedData.originalCertificateId },
      data: {
        expiryDate: newExpiryDate,
        status: CertificateStatus.ISSUED, // Reset to issued if it was expired
      },
    })

    revalidatePath("/certificates")

    return {
      success: true,
      data: renewal as Renewal,
      message: "Certificate renewed successfully",
    }
  } catch (error) {
    console.error("Error creating renewal:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to renew certificate",
    }
  }
}

export async function updateCertificateStatus(id: string, status: CertificateStatus): Promise<ActionResult> {
  try {
    await db.familyLineageCertificate.update({
      where: { id },
      data: { status },
    })

    revalidatePath("/certificates")

    return {
      success: true,
      message: "Certificate status updated successfully",
    }
  } catch (error) {
    console.error("Error updating certificate status:", error)
    return {
      success: false,
      error: "Failed to update certificate status",
    }
  }
}
