"use server";

import { db } from "@/lib/db";
import { getFinancialYearDateRange } from "@/utils/financialYear";
import { Workorderdetails } from "@/types/tender-manage";
import { currentUser } from "@/lib/auth";
import { Agreement } from "@/types/agreement";
import { CompletationCertificate, PaymentDetilsType, workdetailsforprint } from "@/types";
import { workCoverPageType, scrutneesheettype } from "@/types/worksdetails";
import { comparativeStatementProps } from "@/types";

export type NitOption = {
  value: string;
  label: string;
};

export type WorkSlOption = {
  value: string;
  label: string;
};

export type WorkOrderDetailsResult = {
  agencyName: string;
  workOrderDetails: Workorderdetails;
  isSupply: boolean;
  agreement: Agreement | null;
  workDetailForCoverPage: workCoverPageType | null;
  workDetailForCompletion: CompletationCertificate | null;
  workDetailForPayment: PaymentDetilsType | null;
  workDetailForScrutiny: workdetailsforprint | null;
  workDetailForComparative: comparativeStatementProps | null;
};

export async function getNitOptions(
  financialYear: string
): Promise<{ success: true; data: NitOption[] } | { success: false; error: string }> {
  try {
    const user = await currentUser();
    const loginAgencyId = user?.agencyDetailsId || undefined;
    if (!financialYear) {
      return { success: false, error: "Financial year is required" };
    }

    const { financialYearStart, financialYearEnd } = getFinancialYearDateRange(financialYear);

    // Fetch NIT numbers for the financial year that have work orders (both work and supply)
    const nitDetails = await db.nitDetails.findMany({
      where: {
        memoDate: {
          gte: financialYearStart,
          lte: financialYearEnd,
        },
        WorksDetail: {
          some: {
            biddingAgencies: {
              some: {
                ...(loginAgencyId ? { agencyDetailsId: loginAgencyId } : {}),
                workorderdetails: {
                  some: {},
                },
              },
            },
          },
        },
      },
      select: {
        memoNumber: true,
        memoDate: true,
      },
      orderBy: {
        memoNumber: "desc",
      },
    });

    // Get unique NIT numbers (in case there are duplicates)
    const uniqueNits = new Map<number, Date>();
    nitDetails.forEach((nit) => {
      if (!uniqueNits.has(nit.memoNumber)) {
        uniqueNits.set(nit.memoNumber, nit.memoDate);
      }
    });

    const nitOptions = Array.from(uniqueNits.entries())
      .map(([memoNumber, memoDate]) => ({
        value: memoNumber.toString(),
        label: `${memoNumber}/DGP/${new Date(memoDate).getFullYear()} - ${new Date(memoDate).toLocaleDateString("en-IN")}`,
      }))
      .sort((a, b) => parseInt(b.value) - parseInt(a.value));

    return { success: true, data: nitOptions };
  } catch (error: any) {
    console.error("Error fetching NIT options:", error);
    return {
      success: false,
      error: error?.message || "Internal server error",
    };
  }
}

export async function getWorkSlOptions(
  financialYear: string,
  nitNo: string
): Promise<{ success: true; data: WorkSlOption[] } | { success: false; error: string }> {
  try {
    const user = await currentUser();
    const loginAgencyId = user?.agencyDetailsId || undefined;
    if (!financialYear || !nitNo) {
      return {
        success: false,
        error: "Financial year and NIT number are required",
      };
    }

    const { financialYearStart, financialYearEnd } = getFinancialYearDateRange(financialYear);
    const nitNumber = parseInt(nitNo);

    if (isNaN(nitNumber)) {
      return { success: false, error: "Invalid NIT number" };
    }

    // Fetch work SL numbers for the selected NIT
    const works = await db.worksDetail.findMany({
      where: {
        nitDetails: {
          memoNumber: nitNumber,
          memoDate: {
            gte: financialYearStart,
            lte: financialYearEnd,
          },
        },
        biddingAgencies: {
          some: {
            ...(loginAgencyId ? { agencyDetailsId: loginAgencyId } : {}),
            workorderdetails: {
              some: {},
            },
          },
        },
      },
      select: {
        workslno: true,
        ApprovedActionPlanDetails: {
          select: {
            activityDescription: true,
          },
        },
      },
      orderBy: {
        workslno: "asc",
      },
    });

    const workSlOptions = works.map((work) => ({
      value: work.workslno.toString(),
      label: `SL No: ${work.workslno} - ${work.ApprovedActionPlanDetails?.activityDescription || "N/A"}`,
    }));

    return { success: true, data: workSlOptions };
  } catch (error: any) {
    console.error("Error fetching work SL options:", error);
    return {
      success: false,
      error: error?.message || "Internal server error",
    };
  }
}

export async function getWorkOrderDetails(
  financialYear: string,
  nitNo: string,
  workSlNo: string
): Promise<
  | { success: true; data: WorkOrderDetailsResult }
  | { success: false; error: string }
> {
  try {
    const user = await currentUser();
    const loginAgencyId = user?.agencyDetailsId || undefined;
    if (!financialYear || !nitNo || !workSlNo) {
      return {
        success: false,
        error: "Financial year, NIT number, and Work SL number are required",
      };
    }

    const { financialYearStart, financialYearEnd } = getFinancialYearDateRange(financialYear);
    const nitNumber = parseInt(nitNo);
    const workSlNumber = parseInt(workSlNo);

    if (isNaN(nitNumber) || isNaN(workSlNumber)) {
      return { success: false, error: "Invalid NIT number or Work SL number" };
    }

    // Fetch work order details
    const workOrderDetails = await db.workorderdetails.findFirst({
      where: {
        Bidagency: {
          ...(loginAgencyId ? { agencyDetailsId: loginAgencyId } : {}),
          WorksDetail: {
            workslno: workSlNumber,
            nitDetails: {
              memoNumber: nitNumber,
              memoDate: {
                gte: financialYearStart,
                lte: financialYearEnd,
              },
            },
          },
        },
      },
      include: {
        awardofcontractdetails: true,
        Bidagency: {
          include: {
            agencydetails: true,
            WorksDetail: {
              include: {
                ApprovedActionPlanDetails: true,
                nitDetails: true,
              },
            },
          },
        },
      },
    });

    if (!workOrderDetails) {
      return { success: false, error: "Work order not found" };
    }

    const agencyName = workOrderDetails.Bidagency?.agencydetails?.name || "";
    const isSupply = workOrderDetails.Bidagency?.WorksDetail?.nitDetails?.isSupply || false;
    const worksDetailId = workOrderDetails.Bidagency?.WorksDetail?.id;

    // Fetch all additional data needed for different print types
    const [agreement, workDetailForCoverPage, workDetailForCompletion, workDetailForPayment, workDetailForScrutiny, workDetailForComparative] = await Promise.all([
      // Agreement
      workOrderDetails.bidagencyId
        ? db.aggrementModel.findFirst({
            where: {
              bidagencyId: workOrderDetails.bidagencyId,
            },
            select: {
              id: true,
              aggrementno: true,
              aggrementdate: true,
              workdetails: {
                select: {
                  activityDescription: true,
                },
              },
              acceptagency: {
                select: {
                  agencydetails: {
                    select: {
                      name: true,
                      contactDetails: true,
                    },
                  },
                  WorksDetail: {
                    select: {
                      workslno: true,
                      nitDetails: {
                        select: {
                          memoNumber: true,
                          memoDate: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          })
        : Promise.resolve(null),

      // Work detail for cover page
      worksDetailId
        ? db.worksDetail.findUnique({
            where: { id: worksDetailId },
            include: {
              nitDetails: true,
              ApprovedActionPlanDetails: true,
              biddingAgencies: {
                include: {
                  agencydetails: true,
                  workorderdetails: true,
                },
              },
              AwardofContract: {
                include: {
                  workorderdetails: {
                    include: {
                      Bidagency: {
                        include: {
                          AggrementModel: true,
                          agencydetails: true,
                        },
                      },
                    },
                  },
                },
              },
              paymentDetails: {
                include: {
                  lessIncomeTax: true,
                  lessLabourWelfareCess: true,
                  lessTdsCgst: true,
                  lessTdsSgst: true,
                  securityDeposit: true,
                },
              },
              workPhotos: true,
            },
          })
        : Promise.resolve(null),

      // Work detail for completion certificate
      worksDetailId
        ? db.worksDetail.findUnique({
            where: { id: worksDetailId },
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
              paymentDetails: {
                include: {
                  lessIncomeTax: true,
                  lessLabourWelfareCess: true,
                  lessTdsCgst: true,
                  lessTdsSgst: true,
                  securityDeposit: true,
                },
              },
            },
          })
        : Promise.resolve(null),

      // Work detail for payment certificate (same as completion)
      worksDetailId
        ? db.worksDetail.findUnique({
            where: { id: worksDetailId },
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
              paymentDetails: {
                include: {
                  lessIncomeTax: true,
                  lessLabourWelfareCess: true,
                  lessTdsCgst: true,
                  lessTdsSgst: true,
                  securityDeposit: true,
                },
              },
            },
          })
        : Promise.resolve(null),

      // Work detail for scrutiny sheet
      worksDetailId
        ? db.worksDetail.findUnique({
            where: { id: worksDetailId },
            include: {
              nitDetails: true,
              ApprovedActionPlanDetails: true,
              biddingAgencies: {
                include: {
                  agencydetails: true,
                  technicalEvelution: {
                    include: {
                      credencial: true,
                      validityofdocument: true,
                    },
                  },
                },
              },
            },
          })
        : Promise.resolve(null),

      // Work detail for comparative statement
      worksDetailId
        ? db.worksDetail.findUnique({
            where: { id: worksDetailId },
            include: {
              nitDetails: true,
              ApprovedActionPlanDetails: true,
              biddingAgencies: {
                include: {
                  agencydetails: true,
                },
              },
            },
          })
        : Promise.resolve(null),
    ]);

    return {
      success: true,
      data: {
        agencyName,
        workOrderDetails,
        isSupply,
        agreement: agreement as Agreement | null,
        workDetailForCoverPage: workDetailForCoverPage as workCoverPageType | null,
        workDetailForCompletion: workDetailForCompletion as CompletationCertificate | null,
        workDetailForPayment: workDetailForPayment as PaymentDetilsType | null,
        workDetailForScrutiny: workDetailForScrutiny as workdetailsforprint | null,
        workDetailForComparative: workDetailForComparative as comparativeStatementProps | null,
      },
    };
  } catch (error: any) {
    console.error("Error fetching work order details:", error);
    return {
      success: false,
      error: error?.message || "Internal server error",
    };
  }
}
