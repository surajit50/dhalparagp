// app/(protected)/admindashboard/tubewell/work-orders/create/page.tsx
import {
  getRepairRequests,
  getMistris,
  getTubewellMaterials,
} from "@/action/tubewell";
import WorkOrderForm from "./work-order-form";

interface PageProps {
  searchParams: Promise<{ reqId?: string }>;
}

const Page = async ({ searchParams }: PageProps) => {
  // Await the searchParams to access its properties
  const { reqId: initialReqId } = await searchParams;

  // Fetch all necessary data in parallel
  const [requests, mistris, materials] = await Promise.all([
    getRepairRequests(),
    getMistris(),
    getTubewellMaterials(),
  ]);

  return (
    <WorkOrderForm
      requests={requests}
      mistris={mistris}
      materials={materials}
      initialReqId={initialReqId}
    />
  );
};

export default Page;
