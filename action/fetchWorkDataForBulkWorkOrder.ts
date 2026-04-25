import { db } from "@/lib/db";
import { getWorkOrderCertificateInput } from "@/lib/pdf-utils";
import { Workorderdetails } from "@/types/tender-manage";

/**
 * Fetches and transforms work order data for bulk PDF generation.
 * @param workIds Array of workorderdetails IDs
 * @returns Array of input objects for the PDF template
 */
export async function fetchWorkDataForBulkWorkOrder(workIds: string[]) {
  // Fetch all workorderdetails with necessary relations
  const works: Workorderdetails[] = await db.workorderdetails.findMany({
    where: { id: { in: workIds } },
    include: {
      awardofcontractdetails: true,
      Bidagency: {
        include: {
          agencydetails: true,
          WorksDetail: {
            include: {
              ApprovedActionPlanDetails: true,
              nitDetails: true,
            },
          },
        },
      },
    },
  });

  // Transform each work into the input format for the PDF template
  const inputs = await Promise.all(
    works.map(async (work) => await getWorkOrderCertificateInput(work))
  );

  return inputs;
} 