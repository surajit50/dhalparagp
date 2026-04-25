import { Prisma } from "@prisma/client";
export interface NitDetail {
  id: string;
  memoNumber: number;
  publishingDate: Date;
  endTime: Date;
  publishhardcopy: string | null;
}

export type fetchnitdetailsType = Prisma.NitDetailsGetPayload<{
  include: {
    WorksDetail: {
      include: {
        ApprovedActionPlanDetails: true;
      };
    };
  };
}>;

