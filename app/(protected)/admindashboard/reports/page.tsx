import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getApplicationsReport,
  getPerformanceReport,
  getBudgetReport,
} from "@/action/reports-actions";
import Link from "next/link";
import {
  getCurrentFinancialYear,
  getFinancialYearDateRange,
} from "@/utils/financialYear";
import { FinancialYearSelector } from "./_components/financial-year-selector";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;
  const financialYear =
    (resolved?.financialYear as string) || getCurrentFinancialYear();
  const { financialYearStart, financialYearEnd } =
    getFinancialYearDateRange(financialYear);

  // Fetch data for overview
  const applicationsResult = await getApplicationsReport(
    1,
    10,
    financialYearStart,
    financialYearEnd
  );
  const performanceResult = await getPerformanceReport(
    financialYearStart,
    financialYearEnd
  );
  const budgetResult = await getBudgetReport(financialYear);

  const applicationsData = applicationsResult.success
    ? applicationsResult.data
    : null;
  const performanceData = performanceResult.success
    ? performanceResult.data
    : null;
  const budgetData = budgetResult.success ? budgetResult.data : null;

  const reportTypes = [
    {
      title: "Applications Report",
      description: "Warish applications and their status",
      href: "/admindashboard/reports/applications",
      stats: applicationsData?.statistics
        ? {
            total: applicationsData.statistics.total,
            pending: applicationsData.statistics.pending,
            approved: applicationsData.statistics.approved,
          }
        : null,
      color: "from-blue-600 to-blue-700",
    },
    {
      title: "Performance Report",
      description: "System performance metrics and KPIs",
      href: "/admindashboard/reports/performance",
      stats: performanceData?.statistics
        ? {
            totalUsers: performanceData.statistics.totalWarishApplications,
            activeUsers: performanceData.statistics.totalBookings,
            completionRate: performanceData.statistics.totalWorks,
          }
        : null,
      color: "from-green-600 to-green-700",
    },
    {
      title: "Budget Report",
      description: "Financial budget allocation and utilization",
      href: "/admindashboard/reports/budget",
      stats: budgetData?.summary
        ? {
            totalBudget: budgetData.summary.totalBudget,
            totalSpent: budgetData.summary.totalSpent,
            utilizationRate: budgetData.summary.utilizationRate,
          }
        : null,
      color: "from-purple-600 to-purple-700",
    },
    {
      title: "Expenditure Report",
      description: "Detailed expenditure analysis and payments",
      href: "/admindashboard/reports/expenditure",
      color: "from-red-600 to-red-700",
    },
    {
      title: "Earnest Money Report",
      description: "Earnest money collection and status",
      href: "/admindashboard/reports/earnest-money",
      color: "from-yellow-600 to-yellow-700",
    },
    {
      title: "Technical Compliance",
      description: "Technical evaluation and compliance status",
      href: "/admindashboard/reports/technical-compliance",
      color: "from-indigo-600 to-indigo-700",
    },
    {
      title: "Vendor Participation",
      description: "Vendor participation and performance",
      href: "/admindashboard/reports/vendor-participation",
      color: "from-pink-600 to-pink-700",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-gray-800 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Admin: Reports Dashboard
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Comprehensive reports and analytics for administrative
            decision-making.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-end mb-4">
            <FinancialYearSelector />
          </div>
          {/* Quick Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-blue-700">
                  {applicationsData?.statistics?.total || 0}
                </div>
                <div className="text-sm text-blue-600">Total Applications</div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-green-700">
                  {performanceData?.statistics?.totalWarishApplications || 0}
                </div>
                <div className="text-sm text-green-600">
                  Warish Applications
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-purple-700">
                  ₹{budgetData?.summary?.totalBudget?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-purple-600">Total Budget</div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-orange-700">
                  {performanceData?.statistics?.totalBookings || 0}
                </div>
                <div className="text-sm text-orange-600">Service Bookings</div>
              </CardContent>
            </Card>
          </div>

          {/* Report Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((report, index) => (
              <Link key={index} href={report.href}>
                <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <CardHeader
                    className={`bg-gradient-to-r ${report.color} text-white rounded-t-lg`}
                  >
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4">{report.description}</p>

                    {report.stats && (
                      <div className="space-y-2">
                        {report.stats.total !== undefined && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Total:</span>
                            <span className="font-medium">
                              {report.stats.total}
                            </span>
                          </div>
                        )}
                        {report.stats.pending !== undefined && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Pending:</span>
                            <span className="font-medium text-orange-600">
                              {report.stats.pending}
                            </span>
                          </div>
                        )}
                        {report.stats.approved !== undefined && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Approved:</span>
                            <span className="font-medium text-green-600">
                              {report.stats.approved}
                            </span>
                          </div>
                        )}
                        {report.stats.totalBudget !== undefined && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Budget:</span>
                            <span className="font-medium">
                              ₹{report.stats.totalBudget.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {report.stats.utilizationRate !== undefined && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Utilization:</span>
                            <span className="font-medium">
                              {report.stats.utilizationRate}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 text-blue-600 text-sm font-medium">
                      View Report →
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Recent Activity */}
          {performanceData?.recentActivity && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceData.recentActivity
                    .slice(0, 5)
                    .map((activity: any) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {activity.user?.name ||
                              activity.user?.email ||
                              "Unknown User"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {activity.action}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
