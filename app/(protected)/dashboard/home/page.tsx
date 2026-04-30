import {
  CheckCircle,
  FileText,
  XCircle,
  Layers,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function Dashboard() {
  const cuser = await currentUser();

  // 🔒 Unauthenticated State
  if (!cuser) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-gray-100 p-4">
          <Layers className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          Access Denied
        </h2>
        <p className="text-sm text-gray-500">
          Please log in to view your dashboard.
        </p>
      </div>
    );
  }

  try {
    // 📊 Fetch Data
    const warishGroups = await db.warishApplication.groupBy({
      where: { userId: cuser.id },
      by: ["warishApplicationStatus"],
      _count: { _all: true },
    });

    const lcGroups = await db.landConversionApplication.groupBy({
      where: { createdById: cuser.id },
      by: ["status"],
      _count: { _all: true },
    });

    const statusCounts = {
      APPROVED: 0,
      SUBMITTED: 0,
      REJECTED: 0,
    };

    warishGroups.forEach(({ warishApplicationStatus, _count }) => {
      const status =
        warishApplicationStatus.toUpperCase() as keyof typeof statusCounts;
      if (status in statusCounts) {
        statusCounts[status] += _count._all;
      }
    });

    lcGroups.forEach(({ status, _count }) => {
      const s = status.toUpperCase();
      if (s === "ISSUED" || s === "APPROVED") {
        statusCounts.APPROVED += _count._all;
      } else if (
        s === "REJECTED" ||
        s === "VERIFICATION_REJECTED" ||
        s === "INSPECTION_REJECTED"
      ) {
        statusCounts.REJECTED += _count._all;
      } else if (s !== "DRAFT" && s !== "CANCELLED") {
        statusCounts.SUBMITTED += _count._all;
      }
    });

    const totalApplications =
      statusCounts.APPROVED +
      statusCounts.SUBMITTED +
      statusCounts.REJECTED;

    const stats = [
      {
        title: "Total Applications",
        value: totalApplications,
        icon: Layers,
        color: "indigo",
      },
      {
        title: "Approved",
        value: statusCounts.APPROVED,
        icon: CheckCircle,
        color: "emerald",
      },
      {
        title: "Submitted",
        value: statusCounts.SUBMITTED,
        icon: FileText,
        color: "blue",
      },
      {
        title: "Rejected",
        value: statusCounts.REJECTED,
        icon: XCircle,
        color: "rose",
      },
    ];

    return (
      <main className="flex flex-1 flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6 sm:p-8">
        <div className="mx-auto w-full max-w-7xl space-y-10">

          {/* 🔥 Header */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {cuser.name?.split(" ")[0]} 👋
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Here s whats happening with your applications.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* ➕ Action Button */}
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
                <Plus className="h-4 w-4" />
                New Application
              </button>

              {/* 👤 Profile */}
              <div className="flex items-center gap-3 rounded-xl bg-white/70 backdrop-blur px-4 py-2 shadow">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {cuser.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {cuser.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {cuser.role}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 📊 Stats */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Card
                key={i}
                className={`
                  group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
                  ${i === 0 ? "lg:col-span-2 bg-gradient-to-br from-indigo-50 to-white" : ""}
                `}
              >
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Updated recently
                    </p>
                  </div>

                  <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                    <stat.icon
                      className={`h-6 w-6 text-${stat.color}-600 group-hover:rotate-6 transition`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 📄 Recent Applications */}
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="p-4 border-b font-semibold text-gray-700">
              Recent Applications
            </div>

            <div className="divide-y">
              {[1, 2, 3].map((_, i) => (
                <div
                  key={i}
                  className="p-4 flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Application #{i + 1}
                    </p>
                    <p className="text-xs text-gray-500">
                      Submitted recently
                    </p>
                  </div>

                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    Submitted
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error(error);

    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-red-100 p-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          Something went wrong
        </h2>
        <p className="text-sm text-gray-500">
          Please refresh the page.
        </p>
      </div>
    );
  }
}
