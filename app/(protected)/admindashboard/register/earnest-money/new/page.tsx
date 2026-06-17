import { db } from "@/lib/db";
import ClientNewEmdPage from "./ClientPage";

export default async function NewEmdPage() {
  const bidders = await db.bidagency.findMany({
    include: {
      agencydetails: true,
      WorksDetail: {
        include: {
          nitDetails: true,
        },
      },
    },
  });

  return <ClientNewEmdPage bidders={bidders} />;
}
