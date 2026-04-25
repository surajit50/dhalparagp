// model workorderdetails {
//     id                     String          @id @default(auto()) @map("_id") @db.ObjectId
//     awardofcontractdetails AwardofContract @relation(fields: [awardofContractId], references: [id])
//     Bidagency              Bidagency?      @relation(fields: [bidagencyId], references: [id])
//     bidagencyId            String?         @db.ObjectId
//     awardofContractId      String          @db.ObjectId
//   }
import { Prisma } from "@prisma/client";
export type Workorderdetails = Prisma.workorderdetailsGetPayload<{
  include: {
    awardofcontractdetails: true;
    Bidagency: {
      include: {
        agencydetails: true;
        WorksDetail: {
          include: {
            ApprovedActionPlanDetails: true;
            nitDetails: true;
          };
        };
      };
    };
  };
}>;

export type NitDetailsProps = Prisma.NitDetailsGetPayload<{
  include: {
    WorksDetail: {
      include: {
        ApprovedActionPlanDetails: true;
      };
    };
  };
}>;

export type financialdetailsProps = Prisma.WorksDetailGetPayload<{
  include: {
    ApprovedActionPlanDetails: true;
    nitDetails: true;
  };
}>;
