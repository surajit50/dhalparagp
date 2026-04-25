import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LeaveHistoryPage = async () => {
  const user = await currentUser();

  if (!user?.id) {
    return (
      <div className="rounded-md bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        User not found or not logged in.
      </div>
    );
  }

  const leaves = await db.leave.findMany({
    where: { userId: user.id },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/employeedashboard/leave">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Leave History</h1>
          <p className="text-sm text-gray-600">
            View all your past and current leave applications.
          </p>
        </div>
      </div>

      {leaves.length === 0 ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No leave records found for your account yet.</p>
            <Button asChild variant="link" className="mt-2">
              <Link href="/employeedashboard/leave/apply">Apply for your first leave</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Leave Type</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700 uppercase tracking-wider">Applied On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{leave.leaveType || "General"}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(leave.startDate, "dd MMM yyyy")} - {format(leave.endDate, "dd MMM yyyy")}
                    </div>
                    <div className="text-xs text-gray-500">
                      {leave.durationInDays || 0} days
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        leave.status === "approved"
                          ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                          : leave.status === "pending"
                          ? "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200"
                          : leave.status === "rejected"
                          ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                          : "bg-gray-50 text-gray-700 ring-1 ring-gray-200"
                      }`}
                    >
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-700 line-clamp-2 max-w-xs">{leave.reason}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {format(leave.createdAt, "dd MMM yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaveHistoryPage;

