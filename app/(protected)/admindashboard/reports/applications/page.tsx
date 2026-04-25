import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApplicationsReport } from "@/action/reports-actions";
import { formatDistanceToNow } from "date-fns";
import {
  getCurrentFinancialYear,
  getFinancialYearDateRange,
} from "@/utils/financialYear";
import { FinancialYearSelector } from "../_components/financial-year-selector";

export default async function ApplicationsReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;
  const financialYear =
    (resolved?.financialYear as string) || getCurrentFinancialYear();
  const { financialYearStart, financialYearEnd } =
    getFinancialYearDateRange(financialYear);

  const applicationsResult = await getApplicationsReport(
    1,
    10,
    financialYearStart,
    financialYearEnd
  );
  const applicationsData = applicationsResult.success
    ? applicationsResult.data
    : null;

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Admin: Applications Report
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Review and track all submitted warish applications and their
            statuses.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 space-y-8">
          <div className="flex justify-end mb-4">
            <FinancialYearSelector />
          </div>
          {/* Statistics Overview */}
          {applicationsData?.statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-700">
                    {applicationsData.statistics.total}
                  </div>
                  <div className="text-sm text-blue-600">
                    Total Applications
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-orange-700">
                    {applicationsData.statistics.pending}
                  </div>
                  <div className="text-sm text-orange-600">Pending</div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-700">
                    {applicationsData.statistics.approved}
                  </div>
                  <div className="text-sm text-green-600">Approved</div>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-red-700">
                    {applicationsData.statistics.rejected}
                  </div>
                  <div className="text-sm text-red-600">Rejected</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Warish Applications</span>
                <span className="text-sm text-gray-500">
                  {applicationsData?.applications?.length || 0} applications
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!applicationsResult.success ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">
                    Error: {applicationsResult.error}
                  </p>
                  <p className="text-gray-500">
                    Unable to load applications data. Please try again later.
                  </p>
                </div>
              ) : !applicationsData?.applications ||
                applicationsData.applications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No warish applications found. Applications will appear here
                    once submitted.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-3 border text-left">
                          Acknowledgment No.
                        </th>
                        <th className="px-4 py-3 border text-left">
                          Applicant Name
                        </th>
                        <th className="px-4 py-3 border text-left">
                          Deceased Name
                        </th>
                        <th className="px-4 py-3 border text-left">Status</th>
                        <th className="px-4 py-3 border text-left">
                          Submitted By
                        </th>
                        <th className="px-4 py-3 border text-left">
                          Date of Death
                        </th>
                        <th className="px-4 py-3 border text-left">
                          Submitted At
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicationsData.applications.map((app) => (
                        <tr key={app.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 border">
                            <div className="font-medium">
                              {app.acknowlegment}
                            </div>
                            {app.warishRefNo && (
                              <div className="text-sm text-gray-500">
                                Ref: {app.warishRefNo}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 border">
                            <div>
                              <div className="font-medium">
                                {app.applicantName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {app.applicantMobileNumber}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 border">
                            <div>
                              <div className="font-medium">
                                {app.nameOfDeceased}
                              </div>
                              <div className="text-sm text-gray-500">
                                {app.relationwithdeceased}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 border">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                app.warishApplicationStatus === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : app.warishApplicationStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : app.warishApplicationStatus === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {app.warishApplicationStatus
                                .charAt(0)
                                .toUpperCase() +
                                app.warishApplicationStatus.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 border">
                            <div>
                              <div className="font-medium">
                                {app.User?.name || "Not specified"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {app.User?.email || "No email"}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 border text-sm">
                            {new Date(app.dateOfDeath).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 border text-sm text-gray-600">
                            <div>
                              <div>
                                {formatDistanceToNow(new Date(app.createdAt), {
                                  addSuffix: true,
                                })}
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(app.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {applicationsResult.success &&
                applicationsData?.applications &&
                applicationsData.applications.length > 0 && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Showing {applicationsData.applications.length} most recent
                      applications
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
