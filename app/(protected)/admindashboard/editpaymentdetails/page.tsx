import { db } from "@/lib/db"
import { EditWorkDetailsClient } from "./work-details-client"

async function fetchWorkDetails() {
  try {
    // For edit, show works which already have at least one payment record
    return await db.worksDetail.findMany({
      where: {
        paymentDetails: {
          some: {}, // at least one paymentDetails entry
        },
      },
      include: {
        nitDetails: true,
        paymentDetails: {
          include: {
            lessIncomeTax: true,
            lessLabourWelfareCess: true,
            lessTdsCgst: true,
            lessTdsSgst: true,
            securityDeposit: true,
          },
        },
        ApprovedActionPlanDetails: true,
        AwardofContract: {
          include: {
            workorderdetails: {
              include: {
                Bidagency: { include: { agencydetails: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Failed to fetch work details for editing:", error)
    throw new Error("Failed to fetch work details. Please try again later.")
  }
}

async function fetchSchemeNames() {
  try {
    const schemes = await db.approvedActionPlanDetails.findMany({
      select: {
        schemeName: true,
      },
      distinct: ["schemeName"],
      where: {
        schemeName: {
          not: ""
        },
      },
      orderBy: {
        schemeName: "asc",
      },
    })
    return schemes.map((scheme) => scheme.schemeName).filter((name): name is string => name !== null && name !== "")
  } catch (error) {
    console.error("Failed to fetch scheme names:", error)
    return []
  }
}

export default async function EditWorkDetailsPage() {
  const [workDetails, schemeNames] = await Promise.all([fetchWorkDetails(), fetchSchemeNames()])

  return <EditWorkDetailsClient initialWorkDetails={workDetails} schemeNames={schemeNames} />
}

