import { db } from "@/lib/db";
import WorkOrderHistoryClient from "./WorkOrderHistoryClient";


export default async function WorkOrdersHistoryPage() {
  const complaints = await db.streetLightComplaint.findMany({
    where: {
      assignedAgencyId: { not: null }
    },
    include: {
      streetLight: {
        select: {
          lightId: true,
          landmark: true,
          mouza: { select: { mouzaName: true } },
        },
      },
      assignedAgency: { select: { name: true, contactDetails: true } },
    },
    orderBy: { assignedDate: "desc" },
  });

  const agencies = await db.agencyDetails.findMany({
    where: { agencyCategory: "ELECTRIC" },
    select: { id: true, name: true, contactDetails: true },
    orderBy: { name: "asc" },
  });

  const formattedComplaints = complaints.map(c => ({
    id: c.id,
    complaintNo: c.complaintNo,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
    assignedDate: c.assignedDate ? c.assignedDate.toISOString() : null,
    assignedAgencyId: c.assignedAgencyId,
    assignedAgency: c.assignedAgency,
    streetLight: {
      lightId: c.streetLight.lightId,
      landmark: c.streetLight.landmark,
      mouza: c.streetLight.mouza,
    }
  }));

  return (
    <WorkOrderHistoryClient
      initialComplaints={formattedComplaints}
      agencies={agencies}
    />
  );
}
