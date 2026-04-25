import { Prisma } from "@prisma/client";

export type PaymentDetail = {
  id: string;
  nitDetails: {
    memoNumber: number;
  } | null;
  AwardofContract: {
    workorderdetails: Array<{
      Bidagency: {
        agencydetails: {
          id: string;
          name: string;
          mobileNumber: string | null;
          email: string | null;
          pan: string | null;
          tin: string | null;
          gst: string | null;
          contactDetails: string;
        } | null;
      } | null;
    }> | null;
  } | null;
  paymentDetails: Array<{
    workcompletaitiondate: string | null;
  }> | null;
  ApprovedActionPlanDetails: {
    id: string;
  } | null;
};

export type paymentdetailsProps = Prisma.WorksDetailGetPayload<{
  include: {
    nitDetails: true;
    biddingAgencies: true;
    paymentDetails: {
      include: {
        lessIncomeTax: true;
        lessLabourWelfareCess: true;
        lessTdsCgst: true;
        lessTdsSgst: true;
        securityDeposit: true;
      };
    };
    ApprovedActionPlanDetails: true;
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
  };
}>;
