import { db } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";

export const apareport = async (financialyear: string) => {
  // Validate financial year format
  const yearParts = financialyear.split("-");
  if (yearParts.length !== 2) {
    throw new Error("Invalid financial year format. Use 'YYYY-YYYY'");
  }

  const startYear = parseInt(yearParts[0]);
  const endYear = parseInt(yearParts[1]);

  if (isNaN(startYear) || isNaN(endYear) || endYear !== startYear + 1) {
    throw new Error(
      "Invalid financial year. Must be consecutive years (e.g., '2023-2024')"
    );
  }

  // 1. Award period: Full financial year (April 1 to March 31)
  const awardPeriodStart = startOfDay(new Date(startYear, 3, 1)); // April 1, 00:00:00
  const awardPeriodEnd = endOfDay(new Date(endYear, 2, 31)); // March 31, 23:59:59

  // 2. Payment period: Q1 (April 1 to June 30)
  const paymentPeriodStart = startOfDay(new Date(startYear, 3, 1)); // April 1, 00:00:00
  const paymentPeriodEnd = endOfDay(new Date(startYear, 5, 30)); // June 30, 23:59:59

  return await db.worksDetail.findMany({
    where: {
      AwardofContract: {
        workordeermemodate: {
          gte: awardPeriodStart,
          lte: awardPeriodEnd,
        },
      },

    },
    include: {
      nitDetails: true,
      ApprovedActionPlanDetails: true,
      AwardofContract: {
        include: {
          workorderdetails: {
            include: {
              Bidagency: {
                include: {
                  agencydetails: true,
                },
              },
            },
          },
        },
      },
      paymentDetails: true,
    },
  });
};


export const workdetailsbyid = async(workid: string)=>{

  const work = await db.worksDetail.findUnique({
    where: {
      id: workid
    },
    include:{
      nitDetails: true,
      ApprovedActionPlanDetails: true,
      biddingAgencies:{
        orderBy: {
          biddingAmount : "asc"
        },
          include:{
              agencydetails:true,
          }
      }
  }
    
     
  })
  
  return work
}