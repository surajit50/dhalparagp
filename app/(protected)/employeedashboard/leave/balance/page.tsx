import React from 'react';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Info } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

const LeaveBalancePage = async () => {
  const user = await currentUser();

  if (!user?.id) {
    return (
      <div className="rounded-md bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        User not found or not logged in.
      </div>
    );
  }

  // Fetch all approved leaves for the current year
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31);

  const approvedLeaves = await db.leave.findMany({
    where: {
      userId: user.id,
      status: "approved",
      startDate: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
  });

  // Default leave quotas (could be moved to a config or DB later)
  const quotas = [
    { type: "CL", name: "Casual Leave", total: 12 },
    { type: "EL", name: "Earned Leave", total: 30 },
    { type: "SL", name: "Sick Leave", total: 10 },
    { type: "ML", name: "Maternity Leave", total: 180 },
    { type: "PL", name: "Paternity Leave", total: 15 },
  ];

  const balanceData = quotas.map(quota => {
    const used = approvedLeaves
      .filter(l => l.leaveType === quota.type)
      .reduce((acc, curr) => acc + (curr.durationInDays || 0), 0);
    
    return {
      ...quota,
      used,
      remaining: Math.max(0, quota.total - used),
      percentage: Math.min(100, (used / quota.total) * 100)
    };
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
          <h1 className="text-2xl font-semibold text-gray-900">Leave Balance</h1>
          <p className="text-sm text-gray-600">
            Your remaining leave quota for the year {currentYear}.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {balanceData.map((item) => (
          <Card key={item.type}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold">{item.name}</CardTitle>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">
                  {item.type}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Used</span>
                <span className="font-semibold">{item.used} / {item.total} Days</span>
              </div>
              <Progress value={item.percentage} className="h-2" />
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-muted-foreground">Remaining</span>
                <span className="text-xl font-bold text-primary">{item.remaining} Days</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex gap-3 items-start">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Leave Policy Note:</p>
            <ul className="list-disc list-inside space-y-1 opacity-90">
              <li>Leave quotas are refreshed on January 1st every year.</li>
              <li>Earned Leaves (EL) can be carried forward up to 300 days.</li>
              <li>Sick Leaves (SL) require a medical certificate for more than 3 consecutive days.</li>
              <li>All leave applications are subject to approval by the department head.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveBalancePage;
