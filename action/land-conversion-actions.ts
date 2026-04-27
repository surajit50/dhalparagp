"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { currentUser } from "@/lib/auth"
import { uploadToCloudinary } from "@/app/lib/cloudinary"
import { generate } from "@pdfme/generator"
import { image, line, multiVariableText, rectangle, table, text } from "@pdfme/schemas"
import path from "path"
import { promises as fs } from "fs"
import {
  landConversionApplicationSchema,
  type LandConversionApplicationInput,
  type LandConversionCreateMode,
} from "@/schema/land-conversion"
import {
  ApprovalStatus,
  LandConversionStatus,
  type LandConversionApplication,
  type LandConversionInspection,
  type LandConversionCertificate,
} from "@prisma/client"

type ActionResult<T = unknown> = {
  success: boolean
  message?: string
  error?: string
  data?: T
}

type LandConversionCertificatePrintData = {
  certificateNo: string
  memoNumber: string
  issueDate: Date
  signatoryName: string | null
  signatoryDesignation: string | null
  applicantName: string
  applicantAddress: string
  applicantPhone: string
  lands: {
    khatianNo: string
    plotNo: string
    mouza: string
    jlNo: string
    landAreaDec: string
    presentLandUse: string
    proposedLandUse: string
  }[]
}

async function generateApplicationNo(): Promise<string> {
  const now = new Date()
  const year = now.getFullYear()
  const startOfYear = new Date(year, 0, 1)

  const count = await db.landConversionApplication.count({
    where: {
      createdAt: {
        gte: startOfYear,
      },
    },
  })

  const serial = (count + 1).toString().padStart(4, "0")
  return `LC-${year}-${serial}`
}

async function generateCertificateNo(): Promise<string> {
  const now = new Date()
  const year = now.getFullYear()
  const startOfYear = new Date(year, 0, 1)

  const count = await db.landConversionCertificate.count({
    where: {
      createdAt: {
        gte: startOfYear,
      },
    },
  })

  const serial = (count + 1).toString().padStart(4, "0")
  return `LCC-${year}-${serial}`
}

export async function createLandConversionApplication(
  input: LandConversionApplicationInput,
  mode: LandConversionCreateMode,
): Promise<
  ActionResult<{
    application: LandConversionApplication
  }>
> {
  try {
    const user = await currentUser()

    const formData = landConversionApplicationSchema.parse(input)

    const applicationNo = await generateApplicationNo()

    const status =
      mode === "DRAFT" ? LandConversionStatus.DRAFT : LandConversionStatus.SUBMITTED

    const application = await db.landConversionApplication.create({
      data: {
        applicationNo,
        status,
        applicantName: formData.applicantName,
        applicantPhone: formData.applicantPhone,
        applicantEmail: formData.applicantEmail || null,
        applicantAddress: formData.address,
        khatianNo: formData.khatianNo,
        plotNo: formData.plotNo,
        mouza: formData.mouza,
        jlNo: formData.jlNo,
        landAreaDec: formData.landAreaDec,
        presentLandUse: formData.presentLandUse,
        proposedLandUse: formData.proposedLandUse,
        createdById: user?.id ?? null,
        landDetails: {
          create: (formData.additionalLands ?? []).map((land) => ({
            khatianNo: land.khatianNo,
            plotNo: land.plotNo,
            mouza: land.mouza,
            jlNo: land.jlNo,
            landAreaDec: land.landAreaDec,
            presentLandUse: land.presentLandUse,
            proposedLandUse: land.proposedLandUse,
          })),
        },
      },
    })

    revalidatePath("/admindashboard/manage-land-conversion/application", 'page')

    return {
      success: true,
      message:
        mode === "DRAFT"
          ? "Draft saved successfully"
          : "Application submitted successfully",
      data: { application },
    }
  } catch (error) {
    console.error("Error creating land conversion application:", error)
    return {
      success: false,
      error: "Failed to create land conversion application",
    }
  }
}

export async function getApplicationsForVerification(): Promise<
  ActionResult<
    {
      id: string
      applicationNo: string
      applicantName: string
      khatianNo: string
      plotNo: string
      mouza: string
      status: LandConversionStatus
    }[]
  >
> {
  try {
    const applications = await db.landConversionApplication.findMany({
      where: {
        status: {
          in: [LandConversionStatus.SUBMITTED, LandConversionStatus.VERIFICATION_PENDING],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      success: true,
      data: applications.map((a) => ({
        id: a.id,
        applicationNo: a.applicationNo,
        applicantName: a.applicantName,
        khatianNo: a.khatianNo,
        plotNo: a.plotNo,
        mouza: a.mouza,
        status: a.status,
      })),
    }
  } catch (error) {
    console.error("Error fetching applications for verification:", error)
    return {
      success: false,
      error: "Failed to load applications",
    }
  }
}

export async function verifyApplication(
  applicationId: string,
  remarks: string,
  action: "verify" | "reject",
): Promise<ActionResult> {
  try {
    const user = await currentUser()
    const application = await db.landConversionApplication.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      return {
        success: false,
        error: "Application not found",
      }
    }

    const nextStatus =
      action === "verify"
        ? LandConversionStatus.INSPECTION_PENDING
        : LandConversionStatus.VERIFICATION_REJECTED

    await db.$transaction(async (tx) => {
      await tx.landConversionVerification.upsert({
        where: {
          applicationId: application.id,
        },
        update: {
          verifiedBy: user?.name ?? "System",
          verificationDate: new Date(),
          remarks,
          status:
            action === "verify" ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
          documentsVerified: action === "verify",
        },
        create: {
          applicationId: application.id,
          verifiedBy: user?.name ?? "System",
          verificationDate: new Date(),
          remarks,
          status:
            action === "verify" ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
          documentsVerified: action === "verify",
        },
      })

      if (action === "verify") {
        await tx.landConversionInspection.create({
          data: {
            applicationId: application.id,
            inspectorName: user?.name ?? "Inspector",
            scheduledDate: new Date(),
            status: ApprovalStatus.PENDING,
            siteAddress: `${application.mouza}, JL-${application.jlNo}, Plot-${application.plotNo}`,
          },
        })
      }

      await tx.landConversionApplication.update({
        where: { id: application.id },
        data: {
          status: nextStatus,
        },
      })
    })

    revalidatePath("/admindashboard/manage-land-conversion/verify", 'page')

    return {
      success: true,
      message:
        action === "verify"
          ? "Application verified and moved to inspection."
          : "Application rejected at verification stage.",
    }
  } catch (error) {
    console.error("Error verifying land conversion application:", error)
    return {
      success: false,
      error: "Failed to process verification",
    }
  }
}

export async function getInspections(): Promise<
  ActionResult<
    (LandConversionInspection & {
      application: Pick<
        LandConversionApplication,
        "id" | "applicationNo" | "applicantName" | "mouza" | "plotNo" | "jlNo"
      >
    })[]
  >
> {
  try {
    const inspections = await db.landConversionInspection.findMany({
      where: {
        status: ApprovalStatus.PENDING,
      },
      include: {
        application: {
          select: {
            id: true,
            applicationNo: true,
            applicantName: true,
            mouza: true,
            plotNo: true,
            jlNo: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      success: true,
      data: inspections,
    }
  } catch (error) {
    console.error("Error fetching inspections:", error)
    return {
      success: false,
      error: "Failed to load inspections",
    }
  }
}

export async function completeInspection(
  inspectionId: string,
  report: string,
  approve: boolean,
): Promise<ActionResult> {
  try {
    const inspection = await db.landConversionInspection.findUnique({
      where: { id: inspectionId },
      include: {
        application: true,
      },
    })

    if (!inspection) {
      return {
        success: false,
        error: "Inspection not found",
      }
    }

    const nextStatus =
      approve
        ? LandConversionStatus.APPROVAL_PENDING
        : LandConversionStatus.INSPECTION_REJECTED

    await db.$transaction(async (tx) => {
      await tx.landConversionInspection.update({
        where: { id: inspection.id },
        data: {
          inspectionDate: new Date(),
          report,
          status: approve ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
        },
      })

      await tx.landConversionApplication.update({
        where: { id: inspection.applicationId },
        data: {
          status: nextStatus,
        },
      })
    })

    revalidatePath("/admindashboard/manage-land-conversion/inspection", 'page')

    return {
      success: true,
      message: approve
        ? "Inspection completed and moved for approval."
        : "Inspection rejected.",
    }
  } catch (error) {
    console.error("Error completing inspection:", error)
    return {
      success: false,
      error: "Failed to complete inspection",
    }
  }
}

export async function getApplicationsForApproval(): Promise<
  ActionResult<
    {
      id: string
      applicationNo: string
      applicantName: string
      status: LandConversionStatus
    }[]
  >
> {
  try {
    const apps = await db.landConversionApplication.findMany({
      where: {
        status: {
          in: [LandConversionStatus.APPROVAL_PENDING],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      success: true,
      data: apps.map((a) => ({
        id: a.id,
        applicationNo: a.applicationNo,
        applicantName: a.applicantName,
        status: a.status,
      })),
    }
  } catch (error) {
    console.error("Error fetching applications for approval:", error)
    return {
      success: false,
      error: "Failed to load applications",
    }
  }
}

export async function approveApplication(
  applicationId: string,
  comments: string,
  approve: boolean,
): Promise<ActionResult> {
  try {
    const user = await currentUser()
    const application = await db.landConversionApplication.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      return {
        success: false,
        error: "Application not found",
      }
    }

    const nextStatus = approve
      ? LandConversionStatus.APPROVED
      : LandConversionStatus.REJECTED

    await db.$transaction(async (tx) => {
      await tx.landConversionApproval.upsert({
        where: {
          applicationId: application.id,
        },
        update: {
          approverName: user?.name ?? "Approver",
          designation: "Approving Authority",
          approvalDate: new Date(),
          status: approve ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
          comments,
        },
        create: {
          applicationId: application.id,
          approverName: user?.name ?? "Approver",
          designation: "Approving Authority",
          approvalDate: new Date(),
          status: approve ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
          comments,
        },
      })

      await tx.landConversionApplication.update({
        where: { id: application.id },
        data: {
          status: nextStatus,
        },
      })
    })

    revalidatePath("/admindashboard/manage-land-conversion/approve")

    return {
      success: true,
      message: approve ? "Application approved." : "Application rejected.",
    }
  } catch (error) {
    console.error("Error approving land conversion application:", error)
    return {
      success: false,
      error: "Failed to process approval",
    }
  }
}

export async function getApplicationsForIssuance(): Promise<
  ActionResult<
    {
      id: string
      applicationNo: string
      applicantName: string
      status: LandConversionStatus
    }[]
  >
> {
  try {
    const apps = await db.landConversionApplication.findMany({
      where: {
        status: LandConversionStatus.APPROVED,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      success: true,
      data: apps.map((a) => ({
        id: a.id,
        applicationNo: a.applicationNo,
        applicantName: a.applicantName,
        status: a.status,
      })),
    }
  } catch (error) {
    console.error("Error fetching applications for issuance:", error)
    return {
      success: false,
      error: "Failed to load applications",
    }
  }
}

export async function issueCertificate(
  applicationId: string,
  memoNumber: string,
  issueDate: string,
  signatoryName?: string,
  signatoryDesignation?: string,
): Promise<
  ActionResult<{
    certificate: LandConversionCertificate
  }>
> {
  try {
    const trimmedMemoNumber = memoNumber.trim()
    if (!trimmedMemoNumber) {
      return {
        success: false,
        error: "Memo number is required",
      }
    }

    const parsedIssueDate = new Date(issueDate)
    if (Number.isNaN(parsedIssueDate.getTime())) {
      return {
        success: false,
        error: "Please provide a valid issue date",
      }
    }

    const application = await db.landConversionApplication.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      return {
        success: false,
        error: "Application not found",
      }
    }

    if (application.status !== LandConversionStatus.APPROVED) {
      return {
        success: false,
        error: "Only approved applications can be issued",
      }
    }

    const existingCertificate = await db.landConversionCertificate.findUnique({
      where: { applicationId: application.id },
      select: { id: true, certificateNo: true },
    })

    if (existingCertificate) {
      return {
        success: false,
        error: `Certificate already issued (${existingCertificate.certificateNo})`,
      }
    }

    const certificateNo = await generateCertificateNo()

    const certificate = await db.landConversionCertificate.create({
      data: {
        applicationId: application.id,
        certificateNo,
        memoNumber: trimmedMemoNumber,
        issueDate: parsedIssueDate,
        signatoryName: signatoryName?.trim() || null,
        signatoryDesignation: signatoryDesignation?.trim() || null,
      },
    })

    await db.landConversionApplication.update({
      where: { id: application.id },
      data: {
        status: LandConversionStatus.ISSUED,
      },
    })

    revalidatePath("/admindashboard/manage-land-conversion/issue")
    revalidatePath("/admindashboard/manage-land-conversion/print")

    return {
      success: true,
      message: "Certificate issued successfully",
      data: { certificate },
    }
  } catch (error) {
    console.error("Error issuing land conversion certificate:", error)
    return {
      success: false,
      error: "Failed to issue certificate",
    }
  }
}

export async function getComplianceItems(): Promise<
  ActionResult<
    {
      id: string
      applicationNo: string
      applicantName: string
      condition: string
      status: "DUE" | "COMPLIED" | "VIOLATION"
    }[]
  >
> {
  try {
    const certificates = await db.landConversionCertificate.findMany({
      include: {
        application: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const items = certificates.map((cert) => ({
      id: cert.id,
      applicationNo: cert.application.applicationNo,
      applicantName: cert.application.applicantName,
      condition: "As per certificate conditions", // Placeholder text
      status: "DUE" as const,
    }))

    return {
      success: true,
      data: items,
    }
  } catch (error) {
    console.error("Error fetching compliance items:", error)
    return {
      success: false,
      error: "Failed to load compliance items",
    }
  }
}

export async function updateComplianceStatus(
  certificateId: string,
  status: "COMPLIED" | "VIOLATION",
  note: string,
): Promise<ActionResult> {
  try {
    const certificate = await db.landConversionCertificate.findUnique({
      where: { id: certificateId },
      include: {
        application: true,
      },
    })

    if (!certificate) {
      return {
        success: false,
        error: "Certificate not found",
      }
    }

    if (status === "VIOLATION") {
      await db.landConversionApplication.update({
        where: { id: certificate.applicationId },
        data: {
          status: LandConversionStatus.CANCELLED,
        },
      })
    }

    // Note can be logged later into a dedicated audit table if needed

    revalidatePath("/admindashboard/manage-land-conversion/compliance")

    return {
      success: true,
      message:
        status === "COMPLIED"
          ? "Compliance recorded successfully."
          : "Violation flagged and application cancelled.",
    }
  } catch (error) {
    console.error("Error updating compliance status:", error)
    return {
      success: false,
      error: "Failed to update compliance status",
    }
  }
}

export async function getApplicationById(applicationId: string) {
  try {
    const application = await db.landConversionApplication.findUnique({
      where: { id: applicationId },
      include: {
        landDetails: true,
        documents: true,
      },
    })
    if (!application) {
      return { success: false as const, error: "Application not found" }
    }
    return { success: true as const, data: application }
  } catch (error) {
    console.error("Error fetching land conversion application:", error)
    return { success: false as const, error: "Failed to load application" }
  }
}

function formatCertificateDate(value: Date | string | null | undefined): string {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-GB")
}

function buildLandConversionPdfInputs(
  certificateData: LandConversionCertificatePrintData,
  logoBase64: string | null,
) {
  const paragraph1 = `This is to certify that ${certificateData.applicantName}, residing at ${certificateData.applicantAddress}, has been granted a No Objection Certificate for conversion of the land described below.`

  const landDetails = certificateData.lands
    .map((land, index) => {
      return `${index + 1}. Khatian No: ${land.khatianNo}, Plot No: ${land.plotNo}, Mouza: ${land.mouza}, JL No: ${land.jlNo}, Area: ${land.landAreaDec} dec, Present use: ${land.presentLandUse}, Proposed use: ${land.proposedLandUse}`
    })
    .join("\n")

  const conversionDetails =
    "The above land is hereby permitted to be converted from its present use to the proposed use, subject to compliance with the conditions mentioned below and applicable laws."

  return [
    {
      logo: logoBase64,
      certificateNumber: certificateData.certificateNo,
      memoNumber: certificateData.memoNumber,
      issueDate: formatCertificateDate(certificateData.issueDate),
      applicantName: certificateData.applicantName,
      applicantAddress: certificateData.applicantAddress,
      applicantPhone: certificateData.applicantPhone,
      paragraph1,
      landDetails,
      conversionDetails,
      signatoryName: certificateData.signatoryName || "",
      signatoryDesignation: certificateData.signatoryDesignation || "",
    },
  ]
}

async function loadLandConversionTemplate() {
  const templateFilePath = path.join(
    process.cwd(),
    "public",
    "templates",
    "land-conversion-certificate.json",
  )
  const templateRaw = await fs.readFile(templateFilePath, "utf8")
  return JSON.parse(templateRaw)
}

async function loadLogoBase64() {
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "logo.png")
    const logoBuffer = await fs.readFile(logoPath)
    return `data:image/png;base64,${logoBuffer.toString("base64")}`
  } catch (error) {
    console.error("Failed to load logo for land conversion certificate:", error)
    return null
  }
}

export async function getIssuedCertificatesForPrint(): Promise<
  ActionResult<
    {
      id: string
      applicationId: string
      applicationNo: string
      applicantName: string
      certificateNo: string
      memoNumber: string
      issueDate: Date
      pdfUrl: string | null
    }[]
  >
> {
  try {
    const certificates = await db.landConversionCertificate.findMany({
      include: { application: true },
      orderBy: { createdAt: "desc" },
    })

    return {
      success: true,
      data: certificates.map((c) => ({
        id: c.id,
        applicationId: c.applicationId,
        applicationNo: c.application.applicationNo,
        applicantName: c.application.applicantName,
        certificateNo: c.certificateNo,
        memoNumber: c.memoNumber,
        issueDate: c.issueDate,
        pdfUrl: c.pdfUrl,
      })),
    }
  } catch (error) {
    console.error("Error fetching certificates for print:", error)
    return { success: false, error: "Failed to load certificates" }
  }
}

export async function getCertificateForPrint(certificateId: string) {
  try {
    const cert = await db.landConversionCertificate.findUnique({
      where: { id: certificateId },
      include: {
        application: { include: { landDetails: true } },
      },
    })
    if (!cert) return { success: false as const, error: "Certificate not found" }
    const app = cert.application
    const lands = [
      {
        khatianNo: app.khatianNo,
        plotNo: app.plotNo,
        mouza: app.mouza,
        jlNo: app.jlNo,
       
        landAreaDec: app.landAreaDec,
        presentLandUse: app.presentLandUse,
        proposedLandUse: app.proposedLandUse,
      },
      ...app.landDetails.map((l) => ({
        khatianNo: l.khatianNo,
        plotNo: l.plotNo,
        mouza: l.mouza,
        jlNo: l.jlNo,
        
        landAreaDec: l.landAreaDec,
        presentLandUse: l.presentLandUse,
        proposedLandUse: l.proposedLandUse,
      })),
    ]
    return {
      success: true as const,
      data: {
        certificateNo: cert.certificateNo,
        memoNumber: cert.memoNumber,
        issueDate: cert.issueDate,
        signatoryName: cert.signatoryName,
        signatoryDesignation: cert.signatoryDesignation,
        applicantName: app.applicantName,
        applicantAddress: app.applicantAddress,
        applicantPhone: app.applicantPhone,
        lands,
      },
    }
  } catch (error) {
    console.error("Error fetching certificate for print:", error)
    return { success: false as const, error: "Failed to load certificate" }
  }
}

export async function generateAndStoreCertificatePdf(
  certificateId: string,
): Promise<ActionResult<{ pdfUrl: string; certificateNo: string }>> {
  try {
    const cert = await db.landConversionCertificate.findUnique({
      where: { id: certificateId },
      include: {
        application: { include: { landDetails: true } },
      },
    })

    if (!cert) {
      return { success: false, error: "Certificate not found" }
    }

    if (cert.pdfUrl) {
      return {
        success: true,
        data: {
          pdfUrl: cert.pdfUrl,
          certificateNo: cert.certificateNo,
        },
      }
    }

    const app = cert.application
    const lands = [
      {
        khatianNo: app.khatianNo,
        plotNo: app.plotNo,
        mouza: app.mouza,
        jlNo: app.jlNo,
        landAreaDec: app.landAreaDec,
        presentLandUse: app.presentLandUse,
        proposedLandUse: app.proposedLandUse,
      },
      ...app.landDetails.map((l) => ({
        khatianNo: l.khatianNo,
        plotNo: l.plotNo,
        mouza: l.mouza,
        jlNo: l.jlNo,
        landAreaDec: l.landAreaDec,
        presentLandUse: l.presentLandUse,
        proposedLandUse: l.proposedLandUse,
      })),
    ]

    const certificateData: LandConversionCertificatePrintData = {
      certificateNo: cert.certificateNo,
      memoNumber: cert.memoNumber,
      issueDate: cert.issueDate,
      signatoryName: cert.signatoryName,
      signatoryDesignation: cert.signatoryDesignation,
      applicantName: app.applicantName,
      applicantAddress: app.applicantAddress,
      applicantPhone: app.applicantPhone,
      lands,
    }

    const template = await loadLandConversionTemplate()
    const logoBase64 = await loadLogoBase64()
    const inputs = buildLandConversionPdfInputs(certificateData, logoBase64)

    const pdfBuffer = await generate({
      template,
      inputs,
      plugins: {
        text,
        image,
        table,
        line,
        multiVariableText,
        rectangle,
      },
    })

    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64")
    const uploadResult = await uploadToCloudinary(
      `data:application/pdf;base64,${pdfBase64}`,
      "land_conversion/certificates",
    )

    await db.landConversionCertificate.update({
      where: { id: cert.id },
      data: {
        pdfUrl: uploadResult.url,
        pdfKey: uploadResult.public_id,
      },
    })

    revalidatePath("/admindashboard/manage-land-conversion/print")

    return {
      success: true,
      data: {
        pdfUrl: uploadResult.url,
        certificateNo: cert.certificateNo,
      },
    }
  } catch (error) {
    console.error("Error generating and storing land conversion PDF:", error)
    return {
      success: false,
      error: "Failed to generate and store certificate PDF",
    }
  }
}
