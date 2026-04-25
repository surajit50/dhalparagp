import EditActionPlanForm from "@/components/form/edit-action-plan-form";
import Modal from "@/components/Modal";
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
    <Modal>
      <EditActionPlanForm initialData={actionplanform} id={id} />
    </Modal>
  );
};

export default page;
