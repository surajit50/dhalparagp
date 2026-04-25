
import { db } from "@/lib/db";
import { TaxTable } from "./tax-table";

async function getData() {
  return await db.incomeTaxRegister.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      PaymentDetails: {
        include: {
          WorksDetail: {
            include: {
              ApprovedActionPlanDetails: true
            }
          }
        }
      }
    }
  });
}

export default async function IncomeTaxPage() {
  const data = await getData();
  return (
    <div className="container mx-auto p-6">
      <TaxTable data={data} />
    </div>
  );
}
