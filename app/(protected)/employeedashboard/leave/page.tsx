import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  History, 
  PlusCircle, 
  Wallet,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import Link from "next/link";

const LeaveDashboard = async () => {
  const user = await currentUser();

  if (!user?.id) {
    return (
      <div className="rounded-md bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        User not found or not logged in.
      </div>
    );
  }

  // Fetch leave statistics
  const leaves = await db.leave.findMany({
    where: { userId: user.id },
  });

  const stats = {
    pending: leaves.filter(l => l.status === "pending").length,
    approved: leaves.filter(l => l.status === "approved").length,
    rejected: leaves.filter(l => l.status === "rejected").length,
    total: leaves.length
  };

  const quickLinks = [
    {
      title: "Apply for Leave",
      description: "Submit a new leave request",
      href: "/employeedashboard/leave/apply",
      icon: PlusCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Leave History",
      description: "View your past leave applications",
      href: "/employeedashboard/leave/history",
      icon: History,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Leave Balance",
      description: "Check your remaining leave quota",
      href: "/employeedashboard/leave/balance",
      icon: Wallet,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
        <p className="text-muted-foreground">
          Manage your leave applications and view your balance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Leaves</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Leaves</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {quickLinks.map((link) => (
          <Link key={link.title} href={link.href}>
            <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className={`${link.bgColor} ${link.color} w-12 h-12 rounded-lg flex items-center justify-center mb-2`}>
                  <link.icon className="h-6 w-6" />
                </div>
                <CardTitle>{link.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {link.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {leaves.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaves.slice(0, 5).map((leave) => (
                <div key={leave.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-medium">{leave.leaveType || "General Leave"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      leave.status === "approved" ? "bg-green-100 text-green-800" :
                      leave.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/employeedashboard/leave/history">View All History</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeaveDashboard;
