import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Receipt from "./receipt";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const page = async ({ params }: PageProps) => {
  const { id } = await params;
  const emd = await db.earnestMoneyRegister.findUnique({
    where: {
      id,
    },
    include: {
      bidderName: {
        include: {
          WorksDetail: {
            include: {
              nitDetails: true,
              biddingAgencies: {
                include: {
                  agencydetails: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!emd) {
    notFound();
  }

  const agencyDetails =
    emd.bidderName?.WorksDetail?.biddingAgencies[0]?.agencydetails;
  const nitDetails = emd.bidderName?.WorksDetail?.nitDetails;

  return (
    <div className="receipt-content">
      <Receipt
        emd={emd}
        agencyDetails={agencyDetails}
        nitDetails={nitDetails}
      />
    </div>
  );
};

export default page;
