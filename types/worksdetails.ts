import { Prisma } from "@prisma/client";

export type scrutneesheettype = Prisma.WorksDetailGetPayload<{
  include: {
    nitDetails: true;
    ApprovedActionPlanDetails: true;
    biddingAgencies: {
      include: {
        agencydetails: true;
        technicalEvelution: {
          include: {
            credencial: true;
            validityofdocument: true;
          };
        };
      };
    };
  };
}>;

export type workdetailstype = Prisma.WorksDetailGetPayload<{
  include: {
    nitDetails: true;
    ApprovedActionPlanDetails: true;
    biddingAgencies: {
      include: {
        agencydetails: true;
        workorderdetails: true;
      };
    };
    AwardofContract: {
      include: {
        workorderdetails: {
          include: {
            Bidagency: {
              include: {
                agencydetails: true;
              };
            };
          };
        };
      };
    };
    paymentDetails: {
      include: {
        securityDeposit: true;
      };
    };
  };
}>;

// export type workdetailsreporttype = Prisma.NitDetailsGetPayload<{
//   include: {
//     WorksDetail: {
//       include: {
//         ApprovedActionPlanDetails: {
//           select: {
//             activityDescription: true;
//             activityCode: true;
//             schemeName: true;
//           };
//         };

//         AwardofContract: {
//           include: {
//             workorderdetails: {
//               include: {
//                 Bidagency: {
//                   include: {
//                     agencydetails: true;
//                   };
//                 };
//               };
//             };
//           };
//         };

//         paymentDetails: true;
//       };
//     };
//   };
// }>;

export type workdetailsreporttype = Prisma.WorksDetailGetPayload<{
  include: {
    nitDetails: true;
    ApprovedActionPlanDetails: true;
    biddingAgencies: {
      include: {
        agencydetails: true;
        workorderdetails: true;
      };
    };
    AwardofContract: {
      include: {
        workorderdetails: {
          include: {
            Bidagency: {
              include: {
                agencydetails: true;
              };
            };
          };
        };
      };
    };
    paymentDetails: true;
  };
}>;

export type workCoverPageType = Prisma.WorksDetailGetPayload<{
  include: {
    nitDetails: true;
    ApprovedActionPlanDetails: true;
    biddingAgencies: {
      include: {
        agencydetails: true;
        workorderdetails: true;
      };
    };
    AwardofContract: {
      include: {
        workorderdetails: {
          include: {
            Bidagency: {
              include: {
                AggrementModel: true;
                agencydetails: true;
              };
            };
          };
        };
      };
    };
    paymentDetails: {
      include: {
        lessIncomeTax: true;
        lessLabourWelfareCess: true;
        lessTdsCgst: true;
        lessTdsSgst: true;
        securityDeposit: true;
      };
    };
    workPhotos: true;
  };
}>;
