"use client"

import { useMemo } from "react"
import type { workdetailfinanicalProps } from "@/types"

interface BidData {
  agencyId: string
  lessPercentage: string
  bidAmount: string
}

export function useBidCalculations(
  bids: BidData[],
  agencies: workdetailfinanicalProps["biddingAgencies"],
  finalEstimateAmount: number,
) {
  const calculations = useMemo(() => {
    const validBids = bids.filter(
      (bid) => !isNaN(Number.parseFloat(bid.bidAmount)) && Number.parseFloat(bid.bidAmount) > 0,
    )

    const lowestBid =
      validBids.length > 0
        ? validBids.reduce((lowest, current) => {
            return Number.parseFloat(current.bidAmount) < Number.parseFloat(lowest.bidAmount) ? current : lowest
          })
        : null

    const lowestBidDetails = lowestBid
      ? {
          agencyName: agencies.find((agency) => agency.id === lowestBid.agencyId)?.agencydetails.name || "Unknown",
          amount: Number.parseFloat(lowestBid.bidAmount),
          percentage: ((Number.parseFloat(lowestBid.bidAmount) / finalEstimateAmount - 1) * -100).toFixed(2),
        }
      : null

    const completionPercentage = (validBids.length / agencies.length) * 100

    return {
      validBids,
      lowestBid: lowestBidDetails,
      completionPercentage,
      totalBids: bids.length,
      completedBids: validBids.length,
    }
  }, [bids, agencies, finalEstimateAmount])

  return calculations
}
