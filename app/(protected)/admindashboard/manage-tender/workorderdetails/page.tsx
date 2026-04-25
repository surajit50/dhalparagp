import { db } from "@/lib/db";
import FinancialWorkDetailsTable from "./FinancialWorkDetailsTable";

export default async function FinancialWorkDetails() {
  const financialWorkDetails = await db.worksDetail.findMany({
    where: {
      tenderStatus: "FinancialEvaluation",
    },
    include: {
      nitDetails: true,
      ApprovedActionPlanDetails: true,
    },
  });

  return (
    <FinancialWorkDetailsTable financialWorkDetails={financialWorkDetails} />
  );
}
