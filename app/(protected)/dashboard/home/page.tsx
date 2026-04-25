import { CheckCircle, FileText, XCircle, Layers, AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function Dashboard() {
  const cuser = await currentUser();

  // Improved Unauthenticated State
  if (!cuser) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-gray-100 p-4">
          <Layers className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Access Denied</h2>
        <p className="text-sm text-gray-500">
          Please log in to view your application dashboard.
        </p>
      </div>
    );
  }

  try {
    const statusGroups = await db.warishApplication.groupBy({
      where: { userId: cuser.id },
      by: ["warishApplicationStatus"],
      _count: { _all: true },
    });

    const statusCounts = {
      APPROVED: 0,
      SUBMITTED: 0,
      REJECTED: 0,
    };

    statusGroups.forEach(({ warishApplicationStatus, _count }) => {
      const status =
        warishApplicationStatus.toUpperCase() as keyof typeof statusCounts;

      if (status in statusCounts) {
        statusCounts[status] = _count._all;
      }
    });

    const totalApplications =
      statusCounts.APPROVED +
      statusCounts.SUBMITTED +
      statusCounts.REJECTED;

    // Integrated "Total" into the stats array for a cleaner grid layout
    const stats = [
      {
        title: "Total Applications",
        value: totalApplications,
        icon: Layers,
        iconColor: "text-indigo-600",
        iconBg: "bg-indigo-100",
        borderColor: "border-indigo-500",
      },
      {
        title: "Approved",
        value: statusCounts.APPROVED,
        icon: CheckCircle,
        iconColor: "text-emerald-600",
        iconBg: "bg-emerald-100",
        borderColor: "border-emerald-500",
      },
      {
        title: "Submitted",
        value: statusCounts.SUBMITTED,
        icon: FileText,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-100",
        borderColor: "border-blue-500",
      },
      {
        title: "Rejected",
        value: statusCounts.REJECTED,
        icon: XCircle,
        iconColor: "text-rose-600",
        iconBg: "bg-rose-100",
        borderColor: "border-rose-500",
      },
    ];

    return (
      <main className="flex flex-1 flex-col bg-gray-50/50 p-6 sm:p-8">
        <div className="mx-auto w-full max-w-7xl space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and track your Warish applications.
              </p>
            </div>

            {/* User Profile Pill */}
            <div className="flex w-fit items-center gap-3 rounded-full border bg-white py-1.5 pl-1.5 pr-4 shadow-sm">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-blue-600 text-sm font-medium text-white">
                  {cuser.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-none text-gray-900">
                  {cuser.name || "User"}
                </span>
                <span className="mt-1 text-xs font-medium leading-none text-gray-500">
                  Citizen
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className={`overflow-hidden border-l-4 border-y-0 border-r-0 shadow-sm transition-all hover:shadow-md ${stat.borderColor}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold tracking-tight text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`rounded-full p-3 ${stat.iconBg}`}>
                      <stat.icon className={`h-6 w-6 ${stat.iconColor}`} strokeWidth={2.5} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Placeholder for future content (e.g., Recent Applications Table) */}
          <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <p className="text-sm text-gray-500">
              Recent applications list can go here...
            </p>
          </div>

        </div>
      </main>
    );
  } catch (error) {
    console.error("Database error:", error);

    // Improved Error State
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-red-50 p-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Something went wrong</h2>
        <p className="text-sm text-gray-500">
          We could not load your dashboard data. Please try refreshing the page.
        </p>
      </div>
    );
  }
}
