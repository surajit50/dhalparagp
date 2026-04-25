
"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import type { ApiResponse } from "@/lib/types"

export async function getQuotationsWithBids(): Promise<ApiResponse> {
  try {
    console.log("🔍 Starting to fetch quotations with bids...")

    // First, let's check if we have any quotations at all
    const allQuotations = await db.quotation.findMany({
      select: {
        id: true,
        nitNo: true,
        status: true,
        publishedAt: true,
        quotationType: true, // Correct field name
      },
    })

    console.log(`📊 Total quotations in database: ${allQuotations.length}`)
    console.log(
      "📋 All quotations:",
      allQuotations.map((q) => ({
        nitNo: q.nitNo,
        status: q.status,
        quotationType: q.quotationType,
        publishedAt: q.publishedAt,
      })),
    )

    // Check published quotations
    const publishedQuotations = allQuotations.filter((q) => q.status === "PUBLISHED")
    console.log(`✅ Published quotations: ${publishedQuotations.length}`)

    // Now get published quotations with their bids
    const quotations = await db.quotation.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        bids: {
          include: {
            agencyDetails: true,
          },
        },
        comparativeStatement: true,
        createdBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    console.log(`📦 Found ${quotations.length} published quotations with includes`)

    // Check which quotations have bids
    quotations.forEach((q) => {
      console.log(`📝 Quotation ${q.nitNo} (${q.quotationType}): ${q.bids.length} bids`)
    })

    // Process all published quotations (with and without bids)
    const processedQuotations = quotations.map((quotation) => {
      // Sort bids based on quotation type
      const sortedBids = [...quotation.bids].sort((a, b) => {
        if (quotation.quotationType === "SALE") {
          // For SALE: highest amount first (descending order)
          return b.amount - a.amount
        } else {
          // For WORK and SUPPLY: lowest amount first (ascending order)
          return a.amount - b.amount
        }
      })

      // Assign ranks based on sorted order
      const rankedBids = sortedBids.map((bid, index) => ({
        ...bid,
        rank: index + 1,
      }))

      // Determine best bid based on type
      const bestBid = rankedBids.length > 0 ? rankedBids[0] : null
      const bestBidAmount = bestBid ? bestBid.amount : 0

      return {
        ...quotation,
        bids: rankedBids,
        hasComparative: !!quotation.comparativeStatement,
        bestBid: bestBidAmount, // Best bid based on quotation type
        lowestBid: bestBidAmount, // Keep for backward compatibility
        publishedAt: quotation.publishedAt,
        daysPublished: quotation.publishedAt
          ? Math.floor((new Date().getTime() - new Date(quotation.publishedAt).getTime()) / (1000 * 60 * 60 * 24))
          : 0,
        hasBids: quotation.bids.length > 0,
      }
    })

    console.log(`🎯 Final result: ${processedQuotations.length} published quotations`)

    return {
      success: true,
      data: processedQuotations,
      message: `Found ${processedQuotations.length} published quotations`,
    }
  } catch (error) {
    console.error("❌ Error fetching quotations:", error)
    return {
      success: false,
      error: `Failed to fetch quotations: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function getAllPublishedQuotations(): Promise<ApiResponse> {
  try {
    const quotations = await db.quotation.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        bids: {
          include: {
            agencyDetails: true,
          },
        },
        createdBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Process quotations with proper ranking
    const processedQuotations = quotations.map((quotation) => {
      // Sort bids based on quotation type
      const sortedBids = [...quotation.bids].sort((a, b) => {
        if (quotation.quotationType === "SALE") {
          // For SALE: highest amount first (descending order)
          return b.amount - a.amount
        } else {
          // For WORK and SUPPLY: lowest amount first (ascending order)
          return a.amount - b.amount
        }
      })

      // Assign ranks based on sorted order
      const rankedBids = sortedBids.map((bid, index) => ({
        ...bid,
        rank: index + 1,
      }))

      return {
        ...quotation,
        bids: rankedBids,
      }
    })

    return {
      success: true,
      data: processedQuotations,
    }
  } catch (error) {
    console.error("Error fetching published quotations:", error)
    return {
      success: false,
      error: "Failed to fetch published quotations",
    }
  }
}

export async function createComparativeStatement(
  quotationId: string,
  userId: string,
  remarks?: string,
): Promise<ApiResponse> {
  try {
    // Check if quotation exists and has bids
    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
      include: {
        bids: true,
        comparativeStatement: true,
      },
    })

    if (!quotation) {
      return {
        success: false,
        error: "Quotation not found",
      }
    }

    if (quotation.bids.length === 0) {
      return {
        success: false,
        error: "Cannot create comparative statement for quotation without bids",
      }
    }

    if (quotation.comparativeStatement) {
      return {
        success: false,
        error: "Comparative statement already exists for this quotation",
      }
    }

    // Create comparative statement
    const comparativeStatement = await db.comparativeStatement.create({
      data: {
        quotationId,
        remarks,
      },
    })

    revalidatePath("/quotations/comparative-statement")

    return {
      success: true,
      data: comparativeStatement,
      message: "Comparative statement created successfully",
    }
  } catch (error) {
    console.error("Error creating comparative statement:", error)
    return {
      success: false,
      error: "Failed to create comparative statement",
    }
  }
}

export async function exportComparativeStatement(quotationId: string): Promise<ApiResponse> {
  try {
    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
      include: {
        bids: {
          include: {
            agencyDetails: true,
          },
        },
        comparativeStatement: true,
        createdBy: true,
      },
    })

    if (!quotation) {
      return {
        success: false,
        error: "Quotation not found",
      }
    }

    // Sort bids based on quotation type for export
    const sortedBids = [...quotation.bids].sort((a, b) => {
      if (quotation.quotationType === "SALE") {
        // For SALE: highest amount first (descending order)
        return b.amount - a.amount
      } else {
        // For WORK and SUPPLY: lowest amount first (ascending order)
        return a.amount - b.amount
      }
    })

    // Generate export data with proper ranking
    const exportData = {
      quotation: {
        nitNo: quotation.nitNo,
        workName: quotation.workName,
        estimatedAmount: quotation.estimatedAmount,
        nitDate: quotation.nitDate,
        submissionDate: quotation.submissionDate,
        openingDate: quotation.openingDate,
        publishedAt: quotation.publishedAt,
        quotationType: quotation.quotationType,
      },
      bids: sortedBids.map((bid, index) => ({
        rank: index + 1,
        bidderName: bid.agencyDetails.name,
        bidAmount: bid.amount,
        differenceFromEstimate: bid.amount - quotation.estimatedAmount,
        percentageDifference: ((bid.amount - quotation.estimatedAmount) / quotation.estimatedAmount) * 100,
      })),
      statistics: {
        totalBids: sortedBids.length,
        bestBid: sortedBids.length > 0 ? sortedBids[0].amount : 0,
        worstBid: sortedBids.length > 0 ? sortedBids[sortedBids.length - 1].amount : 0,
        // For backward compatibility, keep these but with proper context
        lowestBid: Math.min(...sortedBids.map((bid) => bid.amount)),
        highestBid: Math.max(...sortedBids.map((bid) => bid.amount)),
        averageBid:
          sortedBids.length > 0 ? sortedBids.reduce((sum, bid) => sum + bid.amount, 0) / sortedBids.length : 0,
        quotationType: quotation.quotationType,
      },
      createdAt: new Date().toISOString(),
    }

    return {
      success: true,
      data: exportData,
    }
  } catch (error) {
    console.error("Error exporting comparative statement:", error)
    return {
      success: false,
      error: "Failed to export comparative statement",
    }
  }
}

export async function generateComparativeStatementPDFAction(quotationId: string): Promise<ApiResponse> {
  try {
    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
      include: {
        bids: {
          include: {
            agencyDetails: true,
          },
        },
        comparativeStatement: true,
        createdBy: true,
      },
    })

    if (!quotation) {
      return {
        success: false,
        error: "Quotation not found",
      }
    }

    if (quotation.bids.length === 0) {
      return {
        success: false,
        error: "Cannot generate PDF for quotation without bids",
      }
    }

    // Sort bids based on quotation type for PDF
    const sortedBids = [...quotation.bids].sort((a, b) => {
      if (quotation.quotationType === "SALE") {
        // For SALE: highest amount first (descending order)
        return b.amount - a.amount
      } else {
        // For WORK and SUPPLY: lowest amount first (ascending order)
        return a.amount - b.amount
      }
    })

    // Prepare data for PDF generation
    const pdfData = {
      quotation: {
        nitNo: quotation.nitNo,
        workName: quotation.workName,
        estimatedAmount: quotation.estimatedAmount,
        nitDate: quotation.nitDate,
        submissionDate: quotation.submissionDate,
        openingDate: quotation.openingDate,
        publishedAt: quotation.publishedAt,
        quotationType: quotation.quotationType,
      },
      bids: sortedBids.map((bid, index) => ({
        rank: index + 1,
        bidderName: bid.agencyDetails.name,
        bidAmount: bid.amount,
        differenceFromEstimate: bid.amount - quotation.estimatedAmount,
        percentageDifference: ((bid.amount - quotation.estimatedAmount) / quotation.estimatedAmount) * 100,
        // Add context for better understanding
        isWinning: index === 0, // First in sorted order is the winning bid
      })),
      statistics: {
        totalBids: sortedBids.length,
        winningBid: sortedBids[0].amount,
        winningBidder: sortedBids[0].agencyDetails.name,
        // For context in PDF
        lowestBid: Math.min(...sortedBids.map((bid) => bid.amount)),
        highestBid: Math.max(...sortedBids.map((bid) => bid.amount)),
        averageBid: sortedBids.reduce((sum, bid) => sum + bid.amount, 0) / sortedBids.length,
        quotationType: quotation.quotationType,
        rankingCriteria: getRankingCriteria(quotation.quotationType),
      },
      createdAt: new Date().toISOString(),
      remarks: quotation.comparativeStatement?.remarks,
    }

    return {
      success: true,
      data: pdfData,
      message: "PDF data prepared successfully",
    }
  } catch (error) {
    console.error("Error generating PDF data:", error)
    return {
      success: false,
      error: "Failed to generate PDF data",
    }
  }
}

// Helper function to get ranking criteria description
function getRankingCriteria(quotationType: string): string {
  switch (quotationType) {
    case "SALE":
      return "Highest to Lowest (Best price for seller)"
    case "WORK":
      return "Lowest to Highest (Best price for work contract)"
    case "SUPPLY":
      return "Lowest to Highest (Best price for supply contract)"
    default:
      return "Lowest to Highest"
  }
}
