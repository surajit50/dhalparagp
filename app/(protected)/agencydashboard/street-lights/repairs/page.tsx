import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import RepairClient from "./RepairClient";

export default async function AgencyStreetLightRepairsPage() {
  const user = await currentUser();

  if (!user || user.role !== "agency" || !user.agencyDetailsId) {
    redirect("/auth/login");
  }

  // Fetch complaints assigned to this agency
  const complaints = await db.streetLightComplaint.findMany({
    where: {
      assignedAgencyId: user.agencyDetailsId,
    },
    include: {
      streetLight: {
        select: {
          lightId: true,
          landmark: true,
          mouza: { select: { mouzaName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates for Client Component
  const formattedComplaints = complaints.map(c => ({
    id: c.id,
    complaintNo: c.complaintNo,
    status: c.status,
    priority: c.priority,
    description: c.description || "",
    createdAt: c.createdAt.toISOString(),
    assignedDate: c.assignedDate?.toISOString() || null,
    repairDate: c.repairDate?.toISOString() || null,
    completionImageUrl: c.completionImageUrl || null,
    streetLight: {
      lightId: c.streetLight.lightId,
      landmark: c.streetLight.landmark,
      mouza: c.streetLight.mouza,
    }
  }));

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assigned Street Light Repairs</h1>
        <p className="text-muted-foreground">Manage and resolve street light complaints assigned to your agency.</p>
      </div>

      <RepairClient initialComplaints={formattedComplaints} />
    </div>
  );
}
