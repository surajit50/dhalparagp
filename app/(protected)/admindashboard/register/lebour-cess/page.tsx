import { db } from "@/lib/db";
import { CessTable } from "./cess-table";

async function getData() {
  return await db.labourWelfareCess.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      PaymentDetails: {
        include: {
          WorksDetail: {
            include: {
              ApprovedActionPlanDetails: true,
              nitDetails: true,
              AwardofContract: {
                include: {
                  workorderdetails: {
                    include: {
                      Bidagency: {
                        include: {
                          agencydetails: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
}

export default async function LabourCessPage() {
  const data = await getData();
  return (
    <div className="container mx-auto p-6">
      <CessTable data={data} />
    </div>
  );
}
