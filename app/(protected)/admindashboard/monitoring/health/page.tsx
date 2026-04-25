import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSystemHealth } from "@/action/monitoring-actions";
import { formatDistanceToNow } from "date-fns";

export default async function HealthMonitoringPage() {
  const healthResult = await getSystemHealth();
  const healthData = healthResult.success ? healthResult.data : null;

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-green-700 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Admin: System Health Monitoring
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Monitor the real-time health and status of critical system
            components.
          </p>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4 space-y-8">
          {/* Database Health */}
          <Card>
            <CardHeader>
              <CardTitle>Database Health</CardTitle>
            </CardHeader>
            <CardContent>
              {!healthResult.success ? (
                <div className="text-center py-4">
                  <p className="text-red-600">Error: {healthResult.error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Status
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          healthData?.database.status === "Online"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {healthData?.database.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium text-gray-600">
                      Response Time
                    </div>
                    <div className="text-lg font-semibold">
                      {healthData?.database.responseTime}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium text-gray-600">
                      Uptime
                    </div>
                    <div className="text-lg font-semibold">
                      {healthData?.database.uptime}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium text-gray-600">
                      Last Checked
                    </div>
                    <div className="text-sm">
                      {healthData?.database.lastChecked
                        ? formatDistanceToNow(
                            new Date(healthData.database.lastChecked),
                            { addSuffix: true }
                          )
                        : "Unknown"}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {healthResult.success && healthData?.userStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="text-sm font-medium text-gray-600">
                      Total Users
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {healthData.userStats.totalUsers}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50">
                    <div className="text-sm font-medium text-gray-600">
                      Active Users
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {healthData.userStats.activeUsers}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-purple-50">
                    <div className="text-sm font-medium text-gray-600">
                      Admin Users
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {healthData.userStats.adminUsers}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-orange-50">
                    <div className="text-sm font-medium text-gray-600">
                      Staff Users
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {healthData.userStats.staffUsers}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">
                    Unable to load user statistics
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>System Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {healthResult.success && healthData?.systemMetrics ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Warish Applications */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">
                      Warish Applications
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total:</span>
                        <span className="font-medium">
                          {healthData.systemMetrics.warishApplications.total}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pending:</span>
                        <span className="font-medium text-orange-600">
                          {healthData.systemMetrics.warishApplications.pending}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bookings */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">
                      Service Bookings
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total:</span>
                        <span className="font-medium">
                          {healthData.systemMetrics.bookings.total}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pending:</span>
                        <span className="font-medium text-orange-600">
                          {healthData.systemMetrics.bookings.pending}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Works */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">
                      Works Management
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total:</span>
                        <span className="font-medium">
                          {healthData.systemMetrics.works.total}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active:</span>
                        <span className="font-medium text-green-600">
                          {healthData.systemMetrics.works.active}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Unable to load system metrics</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {healthResult.success &&
              healthData?.recentActivity?.recentLogs ? (
                <div className="space-y-3">
                  {healthData.recentActivity.recentLogs
                    .slice(0, 5)
                    .map((log: any) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {log.user?.name ||
                              log.user?.email ||
                              "Unknown User"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {log.action}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(log.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No recent activity found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
