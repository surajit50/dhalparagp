import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaveAdminClient } from "./LeaveAdminClient";


const AdminLeavePage = async () => {
  const user = await currentUser();

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
        Unauthorized! Only admins can access this page.
      </div>
    );
  }

  // Fetch all pending leave applications with user details
  const pendingLeaves = await db.leave.findMany({
    where: { status: "pending" },
    include: {
      User: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch recently processed leaves
  const processedLeaves = await db.leave.findMany({
    where: {
      status: {
        in: ["approved", "rejected"],
      },
    },
    include: {
      User: {
        select: {
          name: true,
          email: true,
        },
      },
      approver: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leave Management (Admin)</h1>
        <p className="text-muted-foreground">
          Review and process employee leave applications.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Applications ({pendingLeaves.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <LeaveAdminClient initialLeaves={JSON.parse(JSON.stringify(pendingLeaves))} />
          </CardContent>
        </Card>

        {processedLeaves.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recently Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Employee</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Dates</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Type</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Processed By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {processedLeaves.map((leave) => (
                      <tr key={leave.id}>
                        <td className="px-4 py-2">
                          <div className="font-medium text-gray-900">{leave.User?.name || "Unknown"}</div>
                          <div className="text-xs text-gray-500">{leave.User?.email}</div>
                        </td>
                        <td className="px-4 py-2">
                          {format(new Date(leave.startDate), "dd MMM")} - {format(new Date(leave.endDate), "dd MMM yyyy")}
                          <div className="text-xs text-gray-500">{leave.durationInDays} days</div>
                        </td>
                        <td className="px-4 py-2 text-gray-700">{leave.leaveType || "-"}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            leave.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-500">{leave.approver?.name || "System"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminLeavePage;
