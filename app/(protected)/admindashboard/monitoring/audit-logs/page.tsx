import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuditLogs } from "@/action/monitoring-actions";
import { formatDistanceToNow } from "date-fns";

export default async function AuditLogsPage() {
  const auditLogsResult = await getAuditLogs(100);
  const auditLogs = auditLogsResult.success ? auditLogsResult.data : [];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-gray-800 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Admin: Audit Logs Monitoring
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Track and review all critical actions performed by users for
            security and compliance.
          </p>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Audit Logs</span>
                <span className="text-sm text-gray-500">
                  {auditLogs?.length || 0} entries
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!auditLogsResult.success ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">
                    Error: {auditLogsResult.error}
                  </p>
                  <p className="text-gray-500">
                    Unable to load audit logs. Please try again later.
                  </p>
                </div>
              ) : !auditLogs || auditLogs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No audit logs found. Activity will appear here once users
                    perform actions.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-3 border text-left">User</th>
                        <th className="px-4 py-3 border text-left">Action</th>
                        <th className="px-4 py-3 border text-left">Entity</th>
                        <th className="px-4 py-3 border text-left">Details</th>
                        <th className="px-4 py-3 border text-left">
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 border">
                            <div>
                              <div className="font-medium">
                                {log.user?.name ||
                                  log.user?.email ||
                                  "Unknown User"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {log.user?.role || "Unknown Role"}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 border">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-3 border">
                            <div>
                              <div className="font-medium">
                                {log.entityType}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {log.entityId.substring(0, 8)}...
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 border">
                            <div className="max-w-xs truncate">
                              {log.details || "No details provided"}
                            </div>
                          </td>
                          <td className="px-4 py-3 border text-sm text-gray-600">
                            <div>
                              <div>
                                {formatDistanceToNow(new Date(log.createdAt), {
                                  addSuffix: true,
                                })}
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(log.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {auditLogsResult.success && auditLogs && auditLogs.length > 0 && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    Showing {auditLogs.length} most recent audit log entries
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
