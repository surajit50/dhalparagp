"use server"

import { db } from "@/lib/db";

export const addFinancialDetails = async (
  agencyid: string,
  bidamount: string,
  tenderid: string
) => {
  try {
    // Validate inputs
    if (!agencyid || !bidamount || !tenderid) {
      return { error: "Missing required parameters" };
    }

    if (!agencyid.trim() || !tenderid.trim()) {
      return { error: "Invalid agency or tender ID" };
    }

    // Parse and validate bid amount
    const intBid = parseInt(bidamount);
    if (isNaN(intBid) || intBid <= 0) {
      return { error: "Bid amount must be a positive number" };
    }

    // Use transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      // Find the work associated with the tender ID
      const work = await tx.worksDetail.findUnique({
        where: { id: tenderid },
      });

      // If no work found, throw error
      if (!work) {
        throw new Error("Invalid tender ID");
      }

      // Update the bidding amount for the agency
      const updatedBidAgency = await tx.bidagency.update({
        where: { id: agencyid },
        data: { biddingAmount: intBid },
      });

      // Update the tender status
      await tx.worksDetail.update({
        where: { id: tenderid },
        data: { tenderStatus: "FinancialEvaluation" },
      });

      return updatedBidAgency;
    });

    return { success: "Financial details updated successfully", data: result };
  } catch (error) {
    console.error("Error updating financial details:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      // Check for specific Prisma errors
      if (error.message.includes("RecordNotFound")) {
        return { error: "Agency or tender not found" };
      }
      return { error: error.message };
    }
    
    return { error: "An error occurred while updating financial details" };
  }
};
