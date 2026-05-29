import EditActionPlanForm from "@/components/form/edit-action-plan-form";

import { db } from "@/lib/db";
import { ActionPlanDetailsProps } from "@/schema/actionplan";
const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const actionplanform = (await db.approvedActionPlanDetails.findUnique({
    where: {
      id,
    },
  })) as ActionPlanDetailsProps;
  return (
    <div className="container mx-auto p-4">
      <EditActionPlanForm initialData={actionplanform} id={id} />
    </div>
  );
};

export default page;
