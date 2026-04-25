import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Calendar,
  DollarSign,
  Settings,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { format } from "date-fns";

export default async function WaterTankerDashboard() {
  const cUser = await currentUser();
  const isAdmin = cUser?.role === "admin";

  // Fetch statistics
  const [
    totalBookings,
    confirmedBookings,
    pendingBookings,
    completedBookings,
    cancelledBookings,
    upcomingBookings,
    totalRevenue,
  ] = await Promise.all([
    db.booking.count({
      where: { serviceType: "WATER_TANKER" },
    }),
    db.booking.count({
      where: { serviceType: "WATER_TANKER", status: "CONFIRMED" },
    }),
    db.booking.count({
      where: { serviceType: "WATER_TANKER", status: "PENDING" },
    }),
    db.booking.count({
      where: { serviceType: "WATER_TANKER", status: "COMPLETED" },
    }),
    db.booking.count({
      where: { serviceType: "WATER_TANKER", status: "CANCELLED" },
    }),
    db.booking.count({
      where: {
        serviceType: "WATER_TANKER",
        status: { in: ["CONFIRMED", "PENDING"] },
        bookingDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        },
      },
    }),
    db.booking.aggregate({
      where: {
        serviceType: "WATER_TANKER",
        status: { in: ["COMPLETED", "CONFIRMED"] },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const revenue = totalRevenue._sum.amount || 0;

  // Get recent bookings
  const recentBookings = await db.booking.findMany({
    where: { serviceType: "WATER_TANKER" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      bookingDate: true,
      status: true,
      amount: true,
      user: { select: { name: true } },
    },
  });

  const quickLinks = [
    {
      title: "Schedule & Bookings",
      description: "View and manage all bookings",
      icon: Calendar,
      href: "/admindashboard/water-tanker/schedule",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Service Requests",
      description: "Manage new service requests",
      icon: FileText,
      href: "/admindashboard/water-tanker/requests",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Availability",
      description: "Manage service availability",
      icon: CalendarDays,
      href: "/admindashboard/water-tanker/availability",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Fee Management",
      description: "Configure service fees",
      icon: Settings,
      href: "/admindashboard/water-tanker/fees",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const stats = [
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: Truck,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Confirmed",
      value: confirmedBookings,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending",
      value: pendingBookings,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Completed",
      value: completedBookings,
      icon: CheckCircle2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Upcoming (7 days)",
      value: upcomingBookings,
      icon: CalendarDays,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Revenue",
      value: `₹${revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            Water Tanker Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage water tanker services, bookings, and deliveries
          </p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link key={index} href={link.href}>
                <Card className="hover:shadow-md transition-all cursor-pointer h-full">
                  <CardHeader>
                    <div className={`${link.bgColor} p-3 rounded-lg w-fit mb-2`}>
                      <Icon className={`h-6 w-6 ${link.color}`} />
                    </div>
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest water tanker bookings</CardDescription>
            </div>
            <Link href="/admindashboard/water-tanker/schedule">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No bookings found
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {booking.user?.name || booking.name || "Unknown User"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.bookingDate), "PPP 'at' p")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">₹{booking.amount}</p>
                      <p
                        className={`text-xs ${
                          booking.status === "COMPLETED"
                            ? "text-blue-600"
                            : booking.status === "CONFIRMED"
                            ? "text-green-600"
                            : booking.status === "PENDING"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {booking.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

