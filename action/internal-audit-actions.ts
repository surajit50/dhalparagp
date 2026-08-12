"use server";

import { db } from "@/lib/db";
import { internalAuditReportSchema, InternalAuditReportInput } from "@/schema/internal-audit";
import { revalidatePath } from "next/cache";

import {
  saveGpMemberStats,
  saveGpUpaSamitis,
  saveGpStaffList,
} from "@/action/gp-profile-actions";

export async function saveInternalAuditReport(
  data: InternalAuditReportInput,
  id?: string
) {
  try {
    const validated = internalAuditReportSchema.parse(data);

    let report;
    if (id) {
      report = await db.internalAuditReport.update({
        where: { id },
        data: {
          reportNo: validated.reportNo,
          financialYear: validated.financialYear,
          quarter: validated.quarter,
          gpName: validated.gpName,
          blockAndDistrict: validated.blockAndDistrict,
          riskCategory: validated.riskCategory,
          gpAddressAndPhone: validated.gpAddressAndPhone,
          auditPartyMembers: validated.auditPartyMembers,
          auditPartyContact: validated.auditPartyContact,
          auditPartyEmail: validated.auditPartyEmail,
          auditPeriod: validated.auditPeriod,
          auditDuration: validated.auditDuration,
          totalFindings: validated.totalFindings,

          pastObservations: validated.pastObservations,
          pendingCompliances: validated.pendingCompliances,
          reportSummaries: validated.reportSummaries,
          observations: validated.observations,

          gpMembersCount: validated.gpMembersCount,
          upaSamitiDetails: validated.upaSamitiDetails,
          gpStaffDetails: validated.gpStaffDetails,
          fundUsage: validated.fundUsage,
          procurementList: validated.procurementList,
          otherExpenditureList: validated.otherExpenditureList,
          propertyTaxOSR: validated.propertyTaxOSR,
          tradeLicenceOSR: validated.tradeLicenceOSR,
          otherInfoStats: validated.otherInfoStats,

          auditorDesignation: validated.auditorDesignation,
          auditorOfficeAddress: validated.auditorOfficeAddress,
          status: validated.status,
        },
      });
    } else {
      // Upsert by reportNo or create
      report = await db.internalAuditReport.upsert({
        where: { reportNo: validated.reportNo },
        update: {
          financialYear: validated.financialYear,
          quarter: validated.quarter,
          gpName: validated.gpName,
          blockAndDistrict: validated.blockAndDistrict,
          riskCategory: validated.riskCategory,
          gpAddressAndPhone: validated.gpAddressAndPhone,
          auditPartyMembers: validated.auditPartyMembers,
          auditPartyContact: validated.auditPartyContact,
          auditPartyEmail: validated.auditPartyEmail,
          auditPeriod: validated.auditPeriod,
          auditDuration: validated.auditDuration,
          totalFindings: validated.totalFindings,

          pastObservations: validated.pastObservations,
          pendingCompliances: validated.pendingCompliances,
          reportSummaries: validated.reportSummaries,
          observations: validated.observations,

          gpMembersCount: validated.gpMembersCount,
          upaSamitiDetails: validated.upaSamitiDetails,
          gpStaffDetails: validated.gpStaffDetails,
          fundUsage: validated.fundUsage,
          procurementList: validated.procurementList,
          otherExpenditureList: validated.otherExpenditureList,
          propertyTaxOSR: validated.propertyTaxOSR,
          tradeLicenceOSR: validated.tradeLicenceOSR,
          otherInfoStats: validated.otherInfoStats,

          auditorDesignation: validated.auditorDesignation,
          auditorOfficeAddress: validated.auditorOfficeAddress,
          status: validated.status,
        },
        create: {
          reportNo: validated.reportNo,
          financialYear: validated.financialYear,
          quarter: validated.quarter,
          gpName: validated.gpName,
          blockAndDistrict: validated.blockAndDistrict,
          riskCategory: validated.riskCategory,
          gpAddressAndPhone: validated.gpAddressAndPhone,
          auditPartyMembers: validated.auditPartyMembers,
          auditPartyContact: validated.auditPartyContact,
          auditPartyEmail: validated.auditPartyEmail,
          auditPeriod: validated.auditPeriod,
          auditDuration: validated.auditDuration,
          totalFindings: validated.totalFindings,

          pastObservations: validated.pastObservations,
          pendingCompliances: validated.pendingCompliances,
          reportSummaries: validated.reportSummaries,
          observations: validated.observations,

          gpMembersCount: validated.gpMembersCount,
          upaSamitiDetails: validated.upaSamitiDetails,
          gpStaffDetails: validated.gpStaffDetails,
          fundUsage: validated.fundUsage,
          procurementList: validated.procurementList,
          otherExpenditureList: validated.otherExpenditureList,
          propertyTaxOSR: validated.propertyTaxOSR,
          tradeLicenceOSR: validated.tradeLicenceOSR,
          otherInfoStats: validated.otherInfoStats,

          auditorDesignation: validated.auditorDesignation,
          auditorOfficeAddress: validated.auditorOfficeAddress,
          status: validated.status,
        },
      });
    }

    // Sync to separate master models in background
    if (validated.gpMembersCount) {
      saveGpMemberStats(validated.gpMembersCount).catch((err) =>
        console.error("Failed to sync GP member stats:", err)
      );
    }
    if (validated.upaSamitiDetails && Array.isArray(validated.upaSamitiDetails)) {
      saveGpUpaSamitis(validated.upaSamitiDetails as any).catch((err) =>
        console.error("Failed to sync Upa-Samitis:", err)
      );
    }
    if (validated.gpStaffDetails && Array.isArray(validated.gpStaffDetails)) {
      saveGpStaffList(validated.gpStaffDetails as any).catch((err) =>
        console.error("Failed to sync GP staff list:", err)
      );
    }

    revalidatePath("/admindashboard/reports/internal-audit");
    return { success: true, data: report };
  } catch (error: any) {
    console.error("Error saving internal audit report:", error);
    return {
      success: false,
      error: error.message || "Failed to save internal audit report",
    };
  }
}

export async function getInternalAuditReports(
  financialYear?: string,
  quarter?: string
) {
  try {
    const where: any = {};
    if (financialYear && financialYear !== "all") {
      where.financialYear = financialYear;
    }
    if (quarter && quarter !== "all") {
      where.quarter = quarter;
    }

    const reports = await db.internalAuditReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: reports };
  } catch (error: any) {
    console.error("Error getting internal audit reports:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch internal audit reports",
      data: [],
    };
  }
}

export async function getInternalAuditReportById(id: string) {
  try {
    const report = await db.internalAuditReport.findUnique({
      where: { id },
    });

    if (!report) {
      return { success: false, error: "Report not found", data: null };
    }

    return { success: true, data: report };
  } catch (error: any) {
    console.error("Error getting internal audit report by id:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch audit report",
      data: null,
    };
  }
}

export async function deleteInternalAuditReport(id: string) {
  try {
    await db.internalAuditReport.delete({
      where: { id },
    });

    revalidatePath("/admindashboard/reports/internal-audit");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting internal audit report:", error);
    return {
      success: false,
      error: error.message || "Failed to delete audit report",
    };
  }
}

import { getQuarterDateRange } from "@/utils/financialYear";

export async function fetchProcurementFromPayments(
  financialYear?: string,
  quarter?: string
) {
  try {
    const where: any = {};

    if (financialYear && quarter) {
      const { startDate, endDate } = getQuarterDateRange(financialYear, quarter);
      where.billPaymentDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const payments = await db.paymentDetails.findMany({
      where,
      include: {
        WorksDetail: {
          include: {
            nitDetails: true,
            ApprovedActionPlanDetails: true,
            AwardofContract: true,
          },
        },
      },
      orderBy: { billPaymentDate: "desc" },
      take: 100,
    });

    if (!payments || payments.length === 0) {
      return { success: true, data: [] };
    }

    // Exclude APAS scheme payments as APAS is implemented by Block, not GP
    const filteredPayments = payments.filter((payment) => {
      const schemeName = payment.WorksDetail?.ApprovedActionPlanDetails?.schemeName || "";
      const fundType = payment.WorksDetail?.ApprovedActionPlanDetails?.fundType || "";
      const isApas = schemeName.toUpperCase().includes("APAS") || fundType.toUpperCase().includes("APAS");
      return !isApas;
    });

    const procurementItems = filteredPayments.map((payment, idx) => {
      const works = payment.WorksDetail;
      const nit = works?.nitDetails;
      const plan = works?.ApprovedActionPlanDetails;
      const aoc = works?.AwardofContract;

      return {
        slNo: idx + 1,
        fund: plan?.schemeName || plan?.fundType || "",
        nitNo: nit?.memoNumber ? `${nit.memoNumber}` : "",
        nitDate: nit?.memoDate ? new Date(nit.memoDate).toLocaleDateString("en-IN") : "",
        activityName: plan?.activityDescription || plan?.activityName || "",
        typeOfProcurement: nit?.isSupply ? "Goods" : "Works",
        typeOfWork: plan?.workType || plan?.sector || "Roads",
        estimatedValue: plan?.estimatedCost || works?.finalEstimateAmount || 0,
        contractValue: works?.finalEstimateAmount || payment.grossBillAmount || 0,
        contractDate: aoc?.workordeermemodate ? new Date(aoc.workordeermemodate).toLocaleDateString("en-IN") : "",
        billValue: payment.grossBillAmount || payment.netAmt || 0,
        planPlusValue: plan?.estimatedCost || 0,
        sample: "Y",
      };
    });

    return { success: true, data: procurementItems };
  } catch (error: any) {
    console.error("Error fetching procurement from payments:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch procurement from payments",
      data: [],
    };
  }
}

