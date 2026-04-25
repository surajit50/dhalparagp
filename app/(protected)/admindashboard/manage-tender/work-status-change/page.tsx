import { db } from "@/lib/db";
import ClientPage from "./ClientPage";

const WorkStatusChangePage = async () => {
  const workList = await db.worksDetail.findMany({
    where: {
      tenderStatus: {
        not: "Cancelled",
      },
    },
    include: {
      nitDetails: true,
      ApprovedActionPlanDetails: true,
    },
  });

  return <ClientPage workList={workList} />;
};

export default WorkStatusChangePage;
