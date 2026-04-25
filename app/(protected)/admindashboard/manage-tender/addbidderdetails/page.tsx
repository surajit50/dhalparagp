import React from "react";
import { db } from "@/lib/db";
import { NitDetailsClient } from "./NitDetailsClient";

const NitDetailsPage = async () => {
  const dateover = await db.nitDetails.findMany({
    where: {
      technicalBidOpeningDate: {
        lt: new Date(),
      },
    },
    include: {
      WorksDetail: {
        where: {
          tenderStatus: {
            in: ["published", "TechnicalBidOpening"],
          },
        },
        include: {
          ApprovedActionPlanDetails: true,
        },
      },
    },
  });

  return <NitDetailsClient data={dateover} />;
};

export default NitDetailsPage;
