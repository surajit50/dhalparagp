import { db } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingApplicationsTable from "./pending-applications-table";
import AssignedApplicationsTable from "./assigned-applications-table";


export default async function WarishManagement() {
  const [pending, assigned] = await Promise.all([
    db.warishApplication.findMany({
      where: {
        warishApplicationStatus: "submitted",
        User: { NOT: { role: "user" } },
      },
      include: { User: true },
      orderBy: { createdAt: "desc" },
    }),
    db.warishApplication.findMany({
      where: {
        warishApplicationStatus: "process",
        assingstaffId: { not: null },
      },
      include: { User: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const staffMembers = await db.user.findMany({
    where: {
      role: "staff",
      userStatus: "active"
    },
    select: {
      id: true,
      name: true
    },
  });
  

  // Filter out staff members with null names
  const validStaffMembers = staffMembers.filter(
    (staff): staff is { id: string; name: string } => staff.name !== null
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="assigned">
            Assigned ({assigned.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Applications */}
        <TabsContent value="pending">
          <PendingApplicationsTable
            applications={pending}
            staffMembers={validStaffMembers}
          />
        </TabsContent>

        {/* Assigned Applications */}
        <TabsContent value="assigned">
          <AssignedApplicationsTable
            applications={assigned}
            staffMembers={validStaffMembers}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
