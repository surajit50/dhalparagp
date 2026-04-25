import { db } from "@/lib/db"
import { WorkDetailsClient } from "./work-details-client"

async function fetchWorkDetails() {
  try {
    return await db.worksDetail.findMany({
      where: {
        tenderStatus: "AOC",
        awardofContractId: { not: null },
        paymentDetails: { none: { isfinalbill: true } },
      },
      include: {
        nitDetails: true,
        paymentDetails: true,
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
    console.error("Failed to fetch work details:", error)
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

export default async function WorkDetailsPage() {
  const [workDetails, schemeNames] = await Promise.all([fetchWorkDetails(), fetchSchemeNames()])

  return <WorkDetailsClient initialWorkDetails={workDetails} schemeNames={schemeNames} />
}
