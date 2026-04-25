import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPerformanceReport } from "@/action/reports-actions";
import { formatDistanceToNow } from "date-fns";
import {
  getCurrentFinancialYear,
  getFinancialYearDateRange,
} from "@/utils/financialYear";
import { FinancialYearSelector } from "../_components/financial-year-selector";

export default async function PerformanceReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;
  const financialYear =
    (resolved?.financialYear as string) || getCurrentFinancialYear();
  const { financialYearStart, financialYearEnd } =
    getFinancialYearDateRange(financialYear);

  const performanceResult = await getPerformanceReport(
    financialYearStart,
    financialYearEnd
  );
  const performanceData = performanceResult.success
    ? performanceResult.data
    : null;

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-indigo-700 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Admin: Performance Report
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Review key performance indicators and metrics for administrative
            operations.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 space-y-8">
          <div className="flex justify-end mb-4">
            <FinancialYearSelector />
          </div>
          {/* Performance Metrics */}
          {performanceData?.metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">
                    Warish Approval Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700 mb-2">
                    {performanceData.metrics.warishApprovalRate}
                  </div>
                  <div className="text-gray-600">
                    Percentage of warish applications approved
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">
                    Booking Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700 mb-2">
                    {performanceData.metrics.bookingCompletionRate}
                  </div>
                  <div className="text-gray-600">
                    Percentage of service bookings completed
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-800">
                    Work Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-700 mb-2">
                    {performanceData.metrics.workCompletionRate}
                  </div>
                  <div className="text-gray-600">
                    Percentage of works completed successfully
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-800">
                    Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-700 mb-2">
                    {performanceData.metrics.activeUsers}
                  </div>
                  <div className="text-gray-600">
                    Active users in the system
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-teal-50 border-teal-200">
                <CardHeader>
                  <CardTitle className="text-teal-800">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-teal-700 mb-2">
                    {performanceData.metrics.totalUsers}
                  </div>
                  <div className="text-gray-600">Total registered users</div>
                </CardContent>
              </Card>

              <Card className="bg-pink-50 border-pink-200">
                <CardHeader>
                  <CardTitle className="text-pink-800">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-pink-700 mb-2">
                    Excellent
                  </div>
                  <div className="text-gray-600">
                    Overall system performance status
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Detailed Statistics */}
          {performanceData?.statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Application Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">
                        Total Warish Applications
                      </span>
                      <span className="text-2xl font-bold text-blue-700">
                        {performanceData.statistics.totalWarishApplications}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Approved Applications</span>
                      <span className="text-2xl font-bold text-green-700">
                        {performanceData.statistics.approvedWarishApplications}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">Pending Applications</span>
                      <span className="text-2xl font-bold text-orange-700">
                        {performanceData.statistics.totalWarishApplications -
                          performanceData.statistics.approvedWarishApplications}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">Total Bookings</span>
                      <span className="text-2xl font-bold text-purple-700">
                        {performanceData.statistics.totalBookings}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                      <span className="font-medium">Completed Bookings</span>
                      <span className="text-2xl font-bold text-teal-700">
                        {performanceData.statistics.completedBookings}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                      <span className="font-medium">Total Works</span>
                      <span className="text-2xl font-bold text-pink-700">
                        {performanceData.statistics.totalWorks}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                      <span className="font-medium">Completed Works</span>
                      <span className="text-2xl font-bold text-indigo-700">
                        {performanceData.statistics.completedWorks}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Activity */}
          {performanceData?.recentActivity &&
            performanceData.recentActivity.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent System Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {performanceData.recentActivity.map((activity: any) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
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
                          <div className="text-xs text-gray-500">
                            {activity.entityType} -{" "}
                            {activity.entityId.substring(0, 8)}...
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          <div>
                            {formatDistanceToNow(new Date(activity.createdAt), {
                              addSuffix: true,
                            })}
                          </div>
                          <div className="text-xs">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Error State */}
          {!performanceResult.success && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-8 text-center">
                <p className="text-red-600 mb-4">
                  Error: {performanceResult.error}
                </p>
                <p className="text-gray-500">
                  Unable to load performance data. Please try again later.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
