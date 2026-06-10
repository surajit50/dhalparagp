"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function addBidder(quotationId: string, data: { agencyId: string, bidAmount: number, remarks?: string }) {
  try {
    const bidder = await db.procurementBidder.create({
      data: {
        quotationId,
        agencyId: data.agencyId,
        bidAmount: data.bidAmount,
        remarks: data.remarks
      }
    })

    // Auto-rank bidders
    await rankBidders(quotationId)

    revalidatePath(`/admindashboard/manage-quotation/bidders`)
    return { success: true, data: bidder }
  } catch (error) {
    console.error("Error adding bidder:", error)
    return { success: false, error: "Failed to add bidder" }
  }
}

async function rankBidders(quotationId: string) {
  const bidders = await db.procurementBidder.findMany({
    where: { quotationId, isQualified: true },
    orderBy: { bidAmount: "asc" }
  })

  for (let i = 0; i < bidders.length; i++) {
    await db.procurementBidder.update({
      where: { id: bidders[i].id },
      data: { rank: i + 1 }
    })
  }
}

export async function generateComparativeStatement(quotationId: string, remarks?: string) {
  try {
    const statement = await db.procurementComparativeStatement.create({
      data: {
        quotationId,
        remarks
      }
    })
    
    // Mark quotation as evaluated (status update)
    await db.procurementQuotation.update({
      where: { id: quotationId },
      data: { status: "CLOSED" } // Or a new status like EVALUATED
    })

    revalidatePath(`/admindashboard/manage-quotation/comparative-statement`)
    return { success: true, data: statement }
  } catch (error) {
    console.error("Error generating comparative statement:", error)
    return { success: false, error: "Failed to generate statement" }
  }
}

export async function getBiddersByQuotation(quotationId: string) {
  try {
    return await db.procurementBidder.findMany({
      where: { quotationId },
      include: { agency: true },
      orderBy: { rank: "asc" }
    })
  } catch (error) {
    console.error("Error fetching bidders:", error)
    return []
  }
}
