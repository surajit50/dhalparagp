
"use server";

import { db } from "@/lib/db";

interface ReportParams {
  fiscalYear: string;
  month: string;
  fundType?: string;
}

export const workReport = async ({ fiscalYear, month, fundType }: ReportParams) => {
  try {
    // Validate inputs
    if (!fiscalYear || !month) {
      return { success: false, message: "Missing required parameters" };
    }

    // Date calculations
    const [startYear, endYear] = fiscalYear.split("-").map(Number);
    const startOfYear = new Date(startYear, 3, 1); // April 1st
    const endOfYear = new Date(endYear, 2, 31, 23, 59, 59, 999); // March 31st

    let dateFilter = { gte: startOfYear, lte: endOfYear };

    if (month !== "0") {
      const monthNum = Number(month);
      const selectedMonth = monthNum - 1;
      const isJanToMar = selectedMonth < 3;
      const targetYear = isJanToMar ? endYear : startYear;

      dateFilter = {
        gte: new Date(targetYear, selectedMonth, 1),
        lte: new Date(targetYear, selectedMonth + 1, 0, 23, 59, 59, 999)
      };
    }

    // Build query filter
    const whereClause: any = {
      AND: [
        { nitDetails: { memoDate: dateFilter } },
        { tenderStatus: { not: "Cancelled" } }
      ]
    };

    // Add fund type filter for 1:1 relationship
    if (fundType && fundType !== "All") {
      whereClause.AND.push({
        ApprovedActionPlanDetails: {
          is: {
            schemeName: { 
              equals: fundType.trim(),
              mode: "insensitive"
            }
          }
        }
      });
    }

    console.log("Executing Query:", JSON.stringify(whereClause, null, 2));

    const workDetails = await db.worksDetail.findMany({
      where: whereClause,
      include: {
        nitDetails: true,
        ApprovedActionPlanDetails: true,
        biddingAgencies: {
          include: { agencydetails: true, workorderdetails: true }
        },
        AwardofContract: {
          include: {
            workorderdetails: {
              include: { 
                Bidagency: { 
                  include: { 
                    agencydetails: true 
                  } 
                } 
              }
            }
          }
        },
        paymentDetails: true
      },
    });

    return {
      success: true,
      data: workDetails,
    };

  } catch (error) {
    console.error("Database Error:", error);
    return { 
      success: false, 
      message: `Query Error: ${(error as Error).message}` 
    };
  }
};
