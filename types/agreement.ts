export type Agreement = {
  id: string;
  aggrementno: string;
  aggrementdate: Date;
  workdetails: {
    activityDescription: string;
  };
  acceptagency: {
    WorksDetail: {
      workslno: number;
      nitDetails: {
        memoNumber: number;
        memoDate: Date;
      };
    } | null;
    agencydetails: {
      name: string;
      contactDetails: string;
    };
  };
};
export type CreateAgreementInput = {
  aggrementno: string;
  aggrementdate: string;
  approvedActionPlanDetailsId: string;
  bidagencyId: string;
};
