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
      color: "from-orange-600 to-orange-700",
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
      color: "from-orange-600 to-orange-700",
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
      <section className="bg-gradient-to-r from-gray-800 to-orange-700 text-white py-16">
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
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-orange-700">
                  {applicationsData?.statistics?.total || 0}
                </div>
                <div className="text-sm text-orange-600">Total Applications</div>
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

          {/* Report Categories Section */}
          <div className="space-y-12">
            
            {/* Analytics & Insights */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-orange-600 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-800">Analytics & Insights</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {reportTypes.map((report, index) => (
                  <Link key={index} href={report.href}>
                    <Card className="h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white shadow-md rounded-xl overflow-hidden group">
                      <div className={`h-2 w-full bg-gradient-to-r ${report.color}`}></div>
                      <CardHeader className="bg-gray-50/50 pb-4">
                        <CardTitle className="text-lg text-gray-800 font-semibold group-hover:text-orange-600 transition-colors">{report.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-5">
                        <p className="text-gray-500 text-sm mb-5 min-h-[40px]">{report.description}</p>
                        {report.stats && (
                          <div className="space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-100">
                            {report.stats.total !== undefined && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Total</span>
                                <span className="font-bold text-gray-800">{report.stats.total}</span>
                              </div>
                            )}
                            {report.stats.pending !== undefined && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Pending</span>
                                <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{report.stats.pending}</span>
                              </div>
                            )}
                            {report.stats.approved !== undefined && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Approved</span>
                                <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">{report.stats.approved}</span>
                              </div>
                            )}
                            {report.stats.totalBudget !== undefined && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Budget</span>
                                <span className="font-bold text-gray-800">₹{report.stats.totalBudget.toLocaleString()}</span>
                              </div>
                            )}
                            {report.stats.utilizationRate !== undefined && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Utilization</span>
                                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{report.stats.utilizationRate}%</span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="mt-5 flex items-center text-sm font-semibold text-gray-400 group-hover:text-orange-600 transition-colors">
                          View Report <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Statutory Forms */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-800">Gram Panchayat Statutory Forms</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { title: "Form 35 (Artho)", href: "/admindashboard/reports/form-35-artho", color: "from-blue-500 to-indigo-600" },
                  { title: "Form 35 (Krishi)", href: "/admindashboard/reports/form-35-kopsb", color: "from-green-500 to-emerald-600" },
                  { title: "Form 35 (Nari & Sishu)", href: "/admindashboard/reports/form-35-nosu", color: "from-pink-500 to-rose-600" },
                  { title: "Form 35 (Samaj)", href: "/admindashboard/reports/form-35-sj", color: "from-purple-500 to-violet-600" },
                  { title: "Form 35 (Shilpa)", href: "/admindashboard/reports/form-35-sp", color: "from-amber-500 to-orange-600" },
                  { title: "Form 36 (Budget)", href: "/admindashboard/reports/form-36", color: "from-slate-700 to-gray-900" },
                  { title: "Form 37 (Expenditure)", href: "/admindashboard/reports/form-37", color: "from-red-500 to-rose-700" },
                  { title: "Form 38 (Monthly Cash)", href: "/admindashboard/reports/form-38", color: "from-teal-500 to-cyan-700" },
                  { title: "Internal Audit Report (Annexure 7)", href: "/admindashboard/reports/internal-audit", color: "from-blue-700 to-indigo-900" },
                ].map((form, index) => (
                  <Link key={index} href={form.href}>
                    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-gray-200 group">
                      <CardContent className="p-0 flex items-stretch">
                        <div className={`w-3 bg-gradient-to-b ${form.color} rounded-l-xl`}></div>
                        <div className="p-4 flex-1 flex justify-between items-center bg-white rounded-r-xl group-hover:bg-gray-50/50 transition-colors">
                          <span className="font-semibold text-gray-700 group-hover:text-black">{form.title}</span>
                          <span className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">→</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

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
