"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import type { ApiResponse } from "@/lib/types"

interface BidInput {
  bidderId: string
  amount: number
  remarks?: string
}

export async function addBidsToQuotation(quotationId: string, bids: BidInput[], userId: string): Promise<ApiResponse> {
  try {
    // Validate quotation exists and is published
    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
      include: { bids: true },
    })

    if (!quotation) {
      return {
        success: false,
        error: "Quotation not found",
      }
    }

    if (quotation.status !== "PUBLISHED") {
      return {
        success: false,
        error: "Can only add bids to published quotations",
      }
    }

    // Check for duplicate bidders
    const existingBidderIds = quotation.bids.map((bid) => bid.agencyDetailsId)
    const newBidderIds = bids.map((bid) => bid.bidderId)
    const duplicates = newBidderIds.filter((id) => existingBidderIds.includes(id))

    if (duplicates.length > 0) {
      return {
        success: false,
        error: "Some bidders have already submitted bids for this quotation",
      }
    }

    // Create bids in transaction
    const createdBids = await db.$transaction(async (tx) => {
      const bidPromises = bids.map((bid) =>
        tx.bid.create({
          data: {
            quotationId,
            agencyDetailsId: bid.bidderId,
            amount: bid.amount,
            remarks: bid.remarks,
            submittedAt: new Date(),
          },
          include: {
            agencyDetails: true,
          },
        }),
      )

      return Promise.all(bidPromises)
    })

 

    

    revalidatePath("/quotations/comparative-statement")

    return {
      success: true,
      data: createdBids,
      message: `Successfully added ${createdBids.length} bid(s)`,
    }
  } catch (error) {
    console.error("Error adding bids:", error)
    return {
      success: false,
      error: "Failed to add bids",
    }
  }
}

export async function getAvailableBidders(): Promise<ApiResponse> {
  try {
    const bidders = await db.agencyDetails.findMany({
     
      orderBy: {
        name: "asc",
      },
    })

    return {
      success: true,
      data: bidders,
    }
  } catch (error) {
    console.error("Error fetching bidders:", error)
    return {
      success: false,
      error: "Failed to fetch bidders",
    }
  }
}
