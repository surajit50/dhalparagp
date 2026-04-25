"use server"
import { currentUser } from "./auth";
import { db } from "./db";

export async function getPaymentDetails() {
  const user = await currentUser();
  const loginAgencyId = user?.agencyDetailsId;

  if (!loginAgencyId) return [];

  return await db.paymentDetails.findMany({
    where: {
      WorksDetail: {
        AwardofContract: {
          workorderdetails: {
            some: {
              Bidagency: {
                agencyDetailsId: loginAgencyId,
              },
            },
          },
        },
      },
    },
    include: {
      WorksDetail: {
        include: {
          ApprovedActionPlanDetails: true,
          nitDetails: true,
        },
      },
      lessIncomeTax: true,
      lessLabourWelfareCess: true,
      lessTdsCgst: true,
      lessTdsSgst: true,
      securityDeposit: true,
    },
  });
}

export async function getAllAgencies() {
  return await db.agencyDetails.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getAcceptedNitsForPayment() {
  const user = await currentUser();
  const loginAgencyId = user?.agencyDetailsId;

  if (!loginAgencyId) return [];

  return await db.worksDetail.findMany({
    where: {
      AwardofContract: {
        workorderdetails: {
          some: {
            Bidagency: {
              agencyDetailsId: loginAgencyId,
            },
          },
        },
      },
    },
    include: {
      nitDetails: true,
      ApprovedActionPlanDetails: true,
      AwardofContract: true,
      paymentDetails: true,
    },
  });
}

export async function getDeposits() {
  const user = await currentUser();
  const loginAgencyId = user?.agencyDetailsId;

  if (!loginAgencyId) return [];

  return await db.secrutityDeposit.findMany({
    where: {
      PaymentDetails: {
        some: {
          WorksDetail: {
            AwardofContract: {
              workorderdetails: {
                some: {
                  Bidagency: {
                    agencyDetailsId: loginAgencyId,
                  },
                },
              },
            },
          },
        },
      },
    },
    include: {
      PaymentDetails: {
        include: {
          WorksDetail: {
            include: {
              ApprovedActionPlanDetails: true,
              nitDetails: true,
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
            },
          },
        },
      },
    },
  });
}

export async function getAgencyDashboardData(agencyDetailsId?: string) {
  let id = agencyDetailsId;
  if (!id) {
    const user = await currentUser();
    id = user?.agencyDetailsId ?? undefined;
  }
  if (!id) return null;

  return await db.agencyDetails.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          mobileNumber: true,
          role: true,
          userStatus: true,
         
        },
      },
      Bidagency: {
        include: {
          WorksDetail: {
            include: {
              paymentDetails: {
                include: {
                  WorksDetail: {
                    include: {
                      nitDetails: true,
                    },
                  },
                  securityDeposit: true,
                  lessIncomeTax: true,
                  lessLabourWelfareCess: true,
                  lessTdsCgst: true,
                  lessTdsSgst: true,
                },
              },
              AOCDetails: true,
              AwardofContract: true,
              ApprovedActionPlanDetails: true,
              nitDetails: true,
              workEstimateItems: true,
              workMeasurementBooks: true,
              workBillAbstracts: {
                include: {
                  deductions: true,
                },
              },
            },
          },
          workorderdetails: {
            include: {
              awardofcontractdetails: {
                include: {
                  WorksDetail: {
                    include: {
                      nitDetails: true,
                    },
                  },
                },
              },
            },
          },
          technicalEvelution: {
            include: {
              credencial: true,
              validityofdocument: true,
            },
          },
          earnestMoneyRegister: true,
        },
      },
      Bid: {
        include: {
          quotation: true,
        },
      },
      Order: {
        include: {
          items: true,
          timeline: true,
          documents: true,
        },
      },
    },
  });
}
