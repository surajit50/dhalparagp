"use server";

import { db } from "@/lib/db";
import { 
  WarishApplicationStatus, 
  BookingStatus, 
  workStatus, 
  EarnestMoneyStatus,
  UserRole
} from "@prisma/client";
import { auth } from "@/auth";

// Type definitions for report responses
interface BaseReportResponse {
  success: boolean;
  error?: string;
}

interface ApplicationsReportData {
  applications: any[];
  statistics: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

interface PerformanceReportData {
  metrics: {
    warishApprovalRate: string;
    bookingCompletionRate: string;
    workCompletionRate: string;
    activeUsers: string;
    totalUsers: string;
  };
  statistics: {
    totalWarishApplications: number;
    approvedWarishApplications: number;
    totalBookings: number;
    completedBookings: number;
    totalWorks: number;
    completedWorks: number;
  };
  recentActivity: any[];
}

interface ExpenditureReportData {
  paymentDetails: any[];
  summary: {
    totalExpenditure: number;
    totalIncomeTax: number;
    totalLabourWelfareCess: number;
    totalTdsCgst: number;
    totalTdsSgst: number;
    totalSecurityDeposit: number;
    netExpenditure: number;
  };
  monthlyData: {
    month: string;
    total: number;
    count: number;
  }[];
}

interface BudgetReportData {
  actionPlans: any[];
  summary: {
    totalBudget: number;
    totalGeneralFund: number;
    totalScFund: number;
    totalStFund: number;
    totalSpent: number;
    remainingBudget: number;
    utilizationRate: number;
  };
  sectorData: {
    sector: string;
    totalBudget: number;
    totalSpent: number;
    count: number;
  }[];
}


interface TechnicalComplianceReportData {
  technicalEvaluations: any[];
  complianceBreakdown: {
    total: number;
    qualified: number;
    disqualified: number;
    qualificationRate: number;
  };
  documentCompliance: {
    sixtyPerAmtPut: number;
    workOrder: number;
    paymentCertificate: number;
    completionCertificate: number;
    itReturn: number;
    gst: number;
    tradeLicense: number;
    pTax: number;
  };
}

interface VendorParticipationReportData {
  bidAgencies: any[];
  summary: {
    totalVendors: number;
    activeVendors: number;
    qualifiedVendors: number;
    participationRate: number;
  };
  vendorPerformance: {
    vendorName: string;
    totalBids: number;
    totalContracts: number;
    totalEarnestMoney: number;
    isQualified: boolean;
    contactInfo: {
      mobile: string;
      email: string;
    };
  }[];
  participationTrends: Record<number, number>;
}

// Authorization helper
async function checkAuthorization(allowedRoles: UserRole[]) {
  const session = await auth();
  if (!session || !allowedRoles.includes(session.user.role)) {
    throw new Error("Unauthorized");
  }
}

// Applications Report with pagination and date filtering
export async function getApplicationsReport(
  page: number = 1,
  pageSize: number = 10,
  startDate?: Date,
  endDate?: Date
): Promise<BaseReportResponse & { data?: ApplicationsReportData }> {
  try {
    

    const skip = (page - 1) * pageSize;
    const where: any = {};
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate
      };
    }

    const [applications, totalApplications] = await Promise.all([
      db.warishApplication.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          User: { select: { name: true, email: true } }
        }
      }),
      db.warishApplication.count({ where })
    ]);

    const statusCounts = await db.warishApplication.groupBy({
      by: ['warishApplicationStatus'],
      where,
      _count: { _all: true }
    });

    const statusMap = new Map(
      statusCounts.map(item => [item.warishApplicationStatus, item._count._all])
    );

    return {
      success: true,
      data: {
        applications,
        statistics: {
          total: totalApplications,
          pending: statusMap.get('pending') || 0,
          approved: statusMap.get('approved') || 0,
          rejected: statusMap.get('rejected') || 0
        }
      }
    };
  } catch (error) {
    console.error('Error fetching applications report:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch applications report" 
    };
  }
}

// Performance Report
export async function getPerformanceReport(
  startDate?: Date,
  endDate?: Date
): Promise<BaseReportResponse & { data?: PerformanceReportData }> {
  try {
    await checkAuthorization(["admin", "superadmin"]);

    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Warish Application statistics
    const totalWarishApplications = await db.warishApplication.count({ where });
    const approvedWarishApplications = await db.warishApplication.count({
      where: {
        ...where,
        warishApplicationStatus: WarishApplicationStatus.approved,
      },
    });

    // Booking statistics
    const totalBookings = await db.booking.count({ where });
    const completedBookings = await db.booking.count({
      where: {
        ...where,
        status: BookingStatus.COMPLETED,
      },
    });

    // Work statistics
    const totalWorks = await db.worksDetail.count({ where });
    const completedWorks = await db.worksDetail.count({
      where: {
        ...where,
        workStatus: workStatus.billpaid,
      },
    });

    // User statistics
    const totalUsers = await db.user.count({
      where: { role: UserRole.user },
    });
    const activeUsers = await db.session.count({
      where: {
        expires: {
          gt: new Date(),
        },
      },
    });

    // Recent activity
    const recentActivity = await db.auditLog.findMany({
      where,
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return {
      success: true,
      data: {
        metrics: {
          warishApprovalRate:
            totalWarishApplications > 0
              ? (
                  (approvedWarishApplications / totalWarishApplications) *
                  100
                ).toFixed(2)
              : "0.00",
          bookingCompletionRate:
            totalBookings > 0
              ? ((completedBookings / totalBookings) * 100).toFixed(2)
              : "0.00",
          workCompletionRate:
            totalWorks > 0
              ? ((completedWorks / totalWorks) * 100).toFixed(2)
              : "0.00",
          activeUsers: activeUsers.toString(),
          totalUsers: totalUsers.toString(),
        },
        statistics: {
          totalWarishApplications,
          approvedWarishApplications,
          totalBookings,
          completedBookings,
          totalWorks,
          completedWorks,
        },
        recentActivity,
      },
    };
  } catch (error) {
    console.error("Error fetching performance report:", error);
    return { success: false, error: "Failed to fetch performance report." };
  }
}

// Expenditure Report with proper date grouping
export async function getExpenditureReport(
  startDate?: Date,
  endDate?: Date
): Promise<BaseReportResponse & { data?: ExpenditureReportData }> {
  try {
   
    const where: any = {};
    if (startDate && endDate) {
      where.billPaymentDate = { gte: startDate, lte: endDate };
    }

    const paymentDetails = await db.paymentDetails.findMany({
      where,
      include: {
        WorksDetail: {
          include: { 
            ApprovedActionPlanDetails: true,
          nitDetails:true,
          biddingAgencies:{
            include:{
              agencydetails:true
            }
          }
          }
          
        },
        lessIncomeTax: true,
        lessLabourWelfareCess: true,
        lessTdsCgst: true,
        lessTdsSgst: true,
        securityDeposit: true
      },
      orderBy: { billPaymentDate: 'desc' }
    });

    // Calculate totals safely
    const totalExpenditure = paymentDetails.reduce((sum, p) => sum + (p.grossBillAmount || 0), 0);
    const totalIncomeTax = paymentDetails.reduce((sum, p) => sum + (p.lessIncomeTax?.incomeTaaxAmount || 0), 0);
    const totalLabourWelfareCess = paymentDetails.reduce((sum, p) => sum + (p.lessLabourWelfareCess?.labourWelfarecessAmt || 0), 0);
    const totalTdsCgst = paymentDetails.reduce((sum, p) => sum + (p.lessTdsCgst?.tdscgstAmt || 0), 0);
    const totalTdsSgst = paymentDetails.reduce((sum, p) => sum + (p.lessTdsSgst?.tdsSgstAmt || 0), 0);
    const totalSecurityDeposit = paymentDetails.reduce((sum, p) => sum + (p.securityDeposit?.securityDepositAmt || 0), 0);
    const netExpenditure = totalExpenditure - totalIncomeTax - totalLabourWelfareCess - totalTdsCgst - totalTdsSgst;

    // Monthly grouping with year
    const monthlyMap = new Map<string, { month: string; total: number; count: number }>();
    
    paymentDetails.forEach(payment => {
      if (!payment.billPaymentDate) return;
      
      const date = new Date(payment.billPaymentDate);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      const existing = monthlyMap.get(monthKey) || { month: monthName, total: 0, count: 0 };
      monthlyMap.set(monthKey, {
        month: monthName,
        total: existing.total + (payment.grossBillAmount || 0),
        count: existing.count + 1
      });
    });

    return {
      success: true,
      data: {
        paymentDetails,
        summary: {
          totalExpenditure,
          totalIncomeTax,
          totalLabourWelfareCess,
          totalTdsCgst,
          totalTdsSgst,
          totalSecurityDeposit,
          netExpenditure
        },
        monthlyData: Array.from(monthlyMap.values())
      }
    };
  } catch (error) {
    console.error('Error fetching expenditure report:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch expenditure report" 
    };
  }
}

// Budget Report with accurate calculations
export async function getBudgetReport(
  financialYear?: string
): Promise<BaseReportResponse & { data?: BudgetReportData }> {
  try {
    

    const where: any = {};
    if (financialYear) where.financialYear = financialYear;

    const actionPlans = await db.approvedActionPlanDetails.findMany({
      where,
      include: {
        WorksDetail: {
          include: {
            paymentDetails: true
          }
        }
      },
      orderBy: { financialYear: 'desc' }
    });

    // Calculate budget statistics
    let totalBudget = 0;
    let totalGeneralFund = 0;
    let totalScFund = 0;
    let totalStFund = 0;
    let totalSpent = 0;

    const sectorMap = new Map<string, { 
      sector: string; 
      totalBudget: number; 
      totalSpent: number; 
      count: number 
    }>();

    actionPlans.forEach(plan => {
      const planBudget = (plan.generalFund || 0) + (plan.scFund || 0) + (plan.stFund || 0);
      totalBudget += planBudget;
      totalGeneralFund += plan.generalFund || 0;
      totalScFund += plan.scFund || 0;
      totalStFund += plan.stFund || 0;

      // Calculate spent for this plan
      let planSpent = 0;
      plan.WorksDetail?.forEach(work => {
        work.paymentDetails?.forEach(payment => {
          planSpent += payment.grossBillAmount || 0;
        });
      });
      totalSpent += planSpent;

      // Sector breakdown
      if (!plan.sector) return;
      
      const sectorData = sectorMap.get(plan.sector) || { 
        sector: plan.sector, 
        totalBudget: 0, 
        totalSpent: 0, 
        count: 0 
      };
      
      sectorMap.set(plan.sector, {
        sector: plan.sector,
        totalBudget: sectorData.totalBudget + planBudget,
        totalSpent: sectorData.totalSpent + planSpent,
        count: sectorData.count + 1
      });
    });

    const remainingBudget = totalBudget - totalSpent;
    const utilizationRate = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    return {
      success: true,
      data: {
        actionPlans,
        summary: {
          totalBudget,
          totalGeneralFund,
          totalScFund,
          totalStFund,
          totalSpent,
          remainingBudget,
          utilizationRate
        },
        sectorData: Array.from(sectorMap.values())
      }
    };
  } catch (error) {
    console.error('Error fetching budget report:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch budget report" 
    };
  }
}

// Fixed Earnest Money Report
// ================= EARNEST MONEY REPORT TYPES =================

interface EarnestMoneyReportData {
  earnestMoneyRecords: any[];
  summary: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    refundedAmount: number;
    forfeitedAmount: number;
  };
  statusBreakdown: {
    paid: number;
    pending: number;
    refunded: number;
    forfeited: number;
  };
  agingSummary: {
    days0to30: number;
    days31to60: number;
    days61to90: number;
    above90: number;
  };
}

// ================= EARNEST MONEY REPORT FUNCTION =================

export async function getEarnestMoneyReport(options?: {
  status?: EarnestMoneyStatus;
  startDate?: Date;
  endDate?: Date;
}): Promise<BaseReportResponse & { data?: EarnestMoneyReportData }> {
  try {
    const { status, startDate, endDate } = options || {};

    const where: any = {};

    if (status) {
      where.paymentstatus = status;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const earnestMoneyRecords = await db.earnestMoneyRegister.findMany({
      where,
      include: {
        bidderName: {
          include: {
            agencydetails: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // ============= STATUS GROUPING =============

    const statusCounts = await db.earnestMoneyRegister.groupBy({
      by: ["paymentstatus"],
      where,
      _count: { _all: true },
      _sum: { earnestMoneyAmount: true },
    });

    const statusMap = new Map(
      statusCounts.map((item) => [
        item.paymentstatus,
        {
          count: item._count._all,
          sum: item._sum.earnestMoneyAmount || 0,
        },
      ])
    );

    // ============= AGING CALCULATION =============

    const today = new Date();

    const agingSummary = {
      days0to30: 0,
      days31to60: 0,
      days61to90: 0,
      above90: 0,
    };

    earnestMoneyRecords.forEach((record) => {
      if (record.paymentstatus !== "pending") return;

      const createdDate = new Date(record.createdAt);

      const diffInDays = Math.floor(
        (today.getTime() - createdDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (diffInDays <= 30) agingSummary.days0to30++;
      else if (diffInDays <= 60) agingSummary.days31to60++;
      else if (diffInDays <= 90) agingSummary.days61to90++;
      else agingSummary.above90++;
    });

    // ============= RETURN DATA =============

    return {
      success: true,
      data: {
        earnestMoneyRecords,
        summary: {
          totalAmount: statusCounts.reduce(
            (sum, item) =>
              sum + (item._sum.earnestMoneyAmount || 0),
            0
          ),
          paidAmount: statusMap.get("paid")?.sum || 0,
          pendingAmount: statusMap.get("pending")?.sum || 0,
          refundedAmount: statusMap.get("refunded")?.sum || 0,
          forfeitedAmount: statusMap.get("forfeited")?.sum || 0,
        },
        statusBreakdown: {
          paid: statusMap.get("paid")?.count || 0,
          pending: statusMap.get("pending")?.count || 0,
          refunded: statusMap.get("refunded")?.count || 0,
          forfeited: statusMap.get("forfeited")?.count || 0,
        },
        agingSummary,
      },
    };
  } catch (error) {
    console.error("Error fetching earnest money report:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch earnest money report",
    };
  }
}

// Technical Compliance Report with null safety
export async function getTechnicalComplianceReport(
  startDate?: Date,
  endDate?: Date
): Promise<BaseReportResponse & { data?: TechnicalComplianceReportData }> {
  try {
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = { gte: startDate, lte: endDate };
    }

    const technicalEvaluations = await db.technicalEvelutiondocument.findMany({
      where,
      include: {
        credencial: true,
        validityofdocument: true,
        Bidagency: {
          include: { agencydetails: true }
        }
      }
    });

    // Compliance statistics
    const totalEvaluations = technicalEvaluations.length;
    const qualifiedEvaluations = technicalEvaluations.filter(e => e.qualify).length;
    const disqualifiedEvaluations = totalEvaluations - qualifiedEvaluations;

    // Document compliance counts
    const documentCompliance = {
      sixtyPerAmtPut: technicalEvaluations.filter(e => e.credencial?.sixtyperamtput).length,
      workOrder: technicalEvaluations.filter(e => e.credencial?.workorder).length,
      paymentCertificate: technicalEvaluations.filter(e => e.credencial?.paymentcertificate).length,
      completionCertificate: technicalEvaluations.filter(e => e.credencial?.comcertificat).length,
      itReturn: technicalEvaluations.filter(e => e.validityofdocument?.itreturn).length,
      gst: technicalEvaluations.filter(e => e.validityofdocument?.gst).length,
      tradeLicense: technicalEvaluations.filter(e => e.validityofdocument?.tradelicence).length,
      pTax: technicalEvaluations.filter(e => e.validityofdocument?.ptax).length
    };

    return {
      success: true,
      data: {
        technicalEvaluations,
        complianceBreakdown: {
          total: totalEvaluations,
          qualified: qualifiedEvaluations,
          disqualified: disqualifiedEvaluations,
          qualificationRate: totalEvaluations > 0 ? 
            Math.round((qualifiedEvaluations / totalEvaluations) * 100) : 0
        },
        documentCompliance
      }
    };
  } catch (error) {
    console.error('Error fetching technical compliance report:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch technical compliance report" 
    };
  }
}

// Vendor Participation Report with null safety
export async function getVendorParticipationReport(
  startDate?: Date,
  endDate?: Date
): Promise<BaseReportResponse & { data?: VendorParticipationReportData }> {
  try {
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = { gte: startDate, lte: endDate };
    }

    const bidAgencies = await db.bidagency.findMany({
      where,
      include: {
        agencydetails: true,
        WorksDetail: true,
        technicalEvelution: true,
        AggrementModel: true,
        earnestMoneyRegister: true
      }
    });

    // Vendor participation metrics
    const totalVendors = bidAgencies.length;
    const activeVendors = bidAgencies.filter(agency => {
      if (Array.isArray(agency.WorksDetail)) {
        return agency.WorksDetail.length > 0;
      } else if (agency.WorksDetail) {
        return true;
      }
      return false;
    }).length;
    const qualifiedVendors = bidAgencies.filter(agency => 
      agency.technicalEvelution?.qualify === true
    ).length;

    // Vendor performance data
    const vendorPerformance = bidAgencies.map(agency => ({
      vendorName: agency.agencydetails?.name || "Unknown Vendor",
      totalBids: Array.isArray(agency.WorksDetail) ? agency.WorksDetail.length : (agency.WorksDetail ? 1 : 0),
      totalContracts: agency.AggrementModel?.length || 0,
      totalEarnestMoney: agency.earnestMoneyRegister?.reduce(
        (sum, em) => sum + (em.earnestMoneyAmount || 0), 0) || 0,
      isQualified: !!agency.technicalEvelution?.qualify,
      contactInfo: {
        mobile: agency.agencydetails?.mobileNumber || "N/A",
        email: agency.agencydetails?.email || "N/A"
      }
    }));

    // Participation trends
    const participationTrends: Record<number, number> = {};
    bidAgencies.forEach(agency => {
      let bidCount = 0;
      if (Array.isArray(agency.WorksDetail)) {
        bidCount = agency.WorksDetail.length;
      } else if (agency.WorksDetail) {
        bidCount = 1;
      }
      participationTrends[bidCount] = (participationTrends[bidCount] || 0) + 1;
    });

    return {
      success: true,
      data: {
        bidAgencies,
        summary: {
          totalVendors,
          activeVendors,
          qualifiedVendors,
          participationRate: totalVendors > 0 ? 
            Math.round((activeVendors / totalVendors) * 100) : 0
        },
        vendorPerformance,
        participationTrends
      }
    };
  } catch (error) {
    console.error('Error fetching vendor participation report:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch vendor participation report" 
    };
  }
}
