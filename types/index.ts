import { UserRole, WarishDocument } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";
import {
  Gender,
  MaritialStatus,
  LivingStatus,
  WarishApplicationStatus,
  FamilyRelationship,
  Prisma,
} from "@prisma/client";
import type { User } from "next-auth";
import "next-auth/jwt";

export type DateOverWithDetails = Prisma.NitDetailsGetPayload<{
  include: {
    WorksDetail: {
      include: {
        ApprovedActionPlanDetails: true;
      };
    };
  };
}>;

// Define a recursive type for WarishDetailProps that handles nested children

// Define WarishDetailProps with Prisma's type and merge the recursive structure

export type workdetailsProps = Prisma.WorksDetailGetPayload<{
  include: {
    paymentDetails: true;
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



export type workdetailsforprint = Prisma.WorksDetailGetPayload<{
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

// const list = await db.secrutityDeposit.findMany({
//   include: {
//       PaymentDetails: {
//           include: {
//               WorksDetail: {
//                   include: {
//                       workorderdetails: true
//                   }
//               }
//           }
//       }
//   }
// })
export type SignedURLResponse = Promise<
  | { failure?: undefined; success: { url: string; id: number } }
  | { failure: string; success?: undefined }
>;

export type GetSignedURLParams = {
  fileType: string;
  fileSize: number;
  checksum: string;
};

export type WarishDetailProps = {
  id: string;
  name: string;
  gender: Gender;
  relation: FamilyRelationship;
  livingStatus: LivingStatus;
  maritialStatus: MaritialStatus;
  hasbandName: string | null;
  children: WarishDetailProps[];
  parentId: string | null;
  warishApplicationId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WarishApplicationProps = {
 
  id: string;
  reportingDate: Date;
  acknowlegment: string;
  applicantName: string;
  applicantMobileNumber: string;
  relationwithdeceased: string;
  nameOfDeceased: string;
  dateOfDeath: Date;
  gender: Gender;
  maritialStatus: MaritialStatus;
  fatherName: string;
  spouseName: string | null;
  villageName: string;
  postOffice: string;
  warishDetails: WarishDetailProps[];
  assingstaffId: string | null;
  fieldreportRemark: string | null;
  adminNoteRemark: string | null;
  warishRefNo: string | null;
  warishRefDate: Date | null;
  approvalYear: string | null;
  renewdate: Date | null;
  userId: string | null;
  warishApplicationStatus: WarishApplicationStatus;
  warishdocumentverified: boolean;
  digitallySigned: boolean;
  createdAt: Date;
  updatedAt: Date;
  WarishDocument?: any[];
};
export type WarishApplicationPayloadProps = Prisma.WarishApplicationGetPayload<{
  include: {
    warishDetails: {
      include: {
        children: true;
      };
    };
  };
}>;

export type WarishDetailPayloadProps = Prisma.WarishDetailGetPayload<{
  include: {
    children: true;
  };
}>;

export type WorkDetailsProps = Prisma.WorksDetailGetPayload<{
  include: {
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

// model WorksDetail {
//   id                          String           @id @default(auto()) @map("_id") @db.ObjectId
//   workslno                    Int
//   participationFee            Int
//   earnestMoneyFee             Int
//   finalEstimateAmount         Int
//   tenderStatus                TenderStatus
//   nitDetailsId                String           @db.ObjectId
//   nitDetails                  NitDetails       @relation(fields: [nitDetailsId], references: [id])
//   biddingAgencies             Bidagency[]
//   completionDate              DateTime?
//   createdAt                   DateTime         @default(now())
//   updatedAt                   DateTime         @updatedAt
//   AwardofContract             AwardofContract? @relation(fields: [awardofContractId], references: [id])
//   approvedActionPlanDetailsId String           @db.ObjectId
//   paymentDetails              PaymentDetails[]

//   ApprovedActionPlanDetails ApprovedActionPlanDetails @relation(fields: [approvedActionPlanDetailsId], references: [id])
//   awardofContractId         String?                   @db.ObjectId
// }
export type PaymentDetilsType = Prisma.WorksDetailGetPayload<{
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

export type CompletationCertificate = Prisma.WorksDetailGetPayload<{
  include: {
    nitDetails: true;
    paymentDetails: true;
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

export type WarishApplicationtype = Prisma.WarishApplicationGetPayload<{
  include: {
    warishDetails: {
      include: {
        children: true;
      };
    };
  };
}>;

// Define the types based on your Prisma schema


export type GetPaymentDetailstype = Prisma.WorksDetailGetPayload<{
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
      },
    },
    ApprovedActionPlanDetails: true;
    AwardofContract: {
      include: {
        workorderdetails: {
          include: {
            Bidagency: {
              include: {
                agencydetails: true;
              },
            },
          },
        },
      },
    },
  },


}>

export type Deposit = Prisma.SecrutityDepositGetPayload<{
  include: {
    PaymentDetails: {
      include: {
        WorksDetail: {
          
          include: {
          ApprovedActionPlanDetails:true;  
            nitDetails: true;
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
        };
      };
    };
  };
}>;



export type Certificate = {
  id: string;
  certificateNo: string;
  status: CertificateStatus;
  issueDate?: Date;
  expiryDate?: Date;
  validityMonths: number;

  // Applicant Information
  applicantName: string;
  applicantPhone: string;
  applicantEmail?: string;
  applicantAddress: string;

  // Ancestor Information
  ancestorName: string;
  casteCategory: string;

  // Address Information
  village: string;
  postOffice: string;
  block: string;
  district: string;
  state: string;

  // Authority Information
  issuedBy?: string;
  designation?: string;

  // Relations
  familyMembers?: FamilyMember[];
  fieldEnquiry?: FieldEnquiry;
  approvals?: Approval[];
  renewals?: Renewal[];

  createdAt: Date;
  updatedAt: Date;
};

export type FieldEnquiry = {
  id: string;
  certificateId: string;
  enquiryOfficer: string;
  enquiryDate: Date;
  findings: string;
  recommendations: string;
  status: EnquiryStatus;
  witnessNames: string[];
  documentsVerified: string[];
  communityVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Approval = {
  id: string;
  certificateId: string;
  approverName: string;
  designation: string;
  approvalDate: Date;
  status: ApprovalStatus;
  comments?: string;
  level: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Renewal = {
  id: string;
  originalCertificateId: string;
  renewalDate: Date;
  newExpiryDate: Date;
  renewalReason: string;
  status: RenewalStatus;
  additionalNotes?: string;
  processedBy?: string;
  processedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export enum CertificateStatus {
  DRAFT = "DRAFT",
  FIELD_ENQUIRY_PENDING = "FIELD_ENQUIRY_PENDING",
  FIELD_ENQUIRY_COMPLETED = "FIELD_ENQUIRY_COMPLETED",
  APPROVAL_PENDING = "APPROVAL_PENDING",
  APPROVED = "APPROVED",
  ISSUED = "ISSUED",
  EXPIRED = "EXPIRED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export enum EnquiryStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
}

export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  RETURNED_FOR_CLARIFICATION = "RETURNED_FOR_CLARIFICATION",
}

export enum RenewalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  COMPLETED = "COMPLETED",
}

export type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export interface FamilyMember {
  id?: string;
  name: string;
  relation: string;
  age?: number;
  occupation?: string;
  children?: FamilyMember[];
  parentId?: string | null;
}

export interface CertificateFormData {
  applicantName: string;
  applicantPhone: string;
  applicantEmail?: string;
  applicantAddress: string;
  ancestorName: string;
  casteCategory: string;
  village: string;
  postOffice: string;
  block: string;
  district: string;
  state: string;
  familyMembers: FamilyMember[];
}



export interface ReportDataItem {
  id: string | number;
  slNo: number;
  workActivityId: string | number;
  sourceOfFund: string;
  schemeName?: string;
  workActivityName: string;
  nitNumber: string | number;
  nitDate: Date | null;
  workOrderIssueDate: Date | null;
  workOrderValue: number;
  paymentsInPeriod: number;
  periodPaymentDates?: string;
  paymentsAfterPeriod: number;
  afterPeriodPaymentDates?: string;
  completionDate: Date | null;
  workStatus: string;
  remarks: string;
  physicalCompletionPercentage: number | null;
  physicalCompletionDisplay: string;
}
// Define the types based on your Prisma schema
// Define the types based on your Prisma schema
export type AddFinancialDetailsType = {
  id: string
  workslno: number
  finalEstimateAmount: number
  tenderStatus: string
  ApprovedActionPlanDetails: {
    activityDescription: string
  }
  nitDetails: {
    memoNumber: number
    memoDate: Date
  }
  biddingAgencies: Array<{
    id: string
    biddingAmount: number | null
    agencydetails: {
      name: string
    }
  }>
}

// Alias for the original type name used in your bid form
export type workdetailfinanicalProps = AddFinancialDetailsType


export type comparativeStatementProps = Prisma.WorksDetailGetPayload<{
  include: {
    nitDetails: true;
   ApprovedActionPlanDetails: true;
    biddingAgencies: {
      include: {
        agencydetails: true;
      };
    };
    
         
}}>

export type TubewellWorkOrderWithRelations = Prisma.TubewellWorkOrderGetPayload<{
  include: {
    mistri: true;
    request: true;
    materials: {
      include: {
        material: true;
      };
    };
    masterRollEntries: {
      include: {
        items: true;
      };
    };
  };
}>;

export type TubewellBillWithRelations = Prisma.TubewellBillGetPayload<{
  include: {
    workOrders: {
      include: {
        mistri: true;
        request: true;
        materials: {
          include: {
            material: true;
          };
        };
        masterRollEntries: {
          include: {
            items: true;
          };
        };
      };
    };
  };
}>;



