import { db } from "@/lib/db";
import WorkOrderClient from "./WorkOrderClient";

export default async function WorkOrdersPage() {
  const complaints = await db.streetLightComplaint.findMany({
    where: { status: "ENQUIRY_COMPLETED" },
    include: {
      streetLight: {
        select: {
          lightId: true,
          landmark: true,
          mouza: { select: { mouzaName: true } },
        },
      },
      assignedStaff: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const agencies = await db.agencyDetails.findMany({
    where: { agencyCategory: "ELECTRIC" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Convert complaints to plain objects if they contain Dates to pass them to Client Component
  const formattedComplaints = complaints.map(c => ({
    id: c.id,
    complaintNo: c.complaintNo,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
    assignedStaff: c.assignedStaff,
    streetLight: {
      lightId: c.streetLight.lightId,
      landmark: c.streetLight.landmark,
      mouza: c.streetLight.mouza,
    }
  }));

  return (
    <WorkOrderClient 
      initialComplaints={formattedComplaints}
      agencies={agencies}
    />
  );
}
