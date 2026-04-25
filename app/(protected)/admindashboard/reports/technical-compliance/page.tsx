import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTechnicalComplianceReport } from "@/action/reports-actions";
import {
  getCurrentFinancialYear,
  getFinancialYearDateRange,
} from "@/utils/financialYear";
import { FinancialYearSelector } from "../_components/financial-year-selector";

export default async function TechnicalComplianceReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;
  const financialYear =
    (resolved?.financialYear as string) || getCurrentFinancialYear();
  const { financialYearStart, financialYearEnd } =
    getFinancialYearDateRange(financialYear);

  // Note: getTechnicalComplianceReport does not currently support date filtering.
  const complianceResult = await getTechnicalComplianceReport();
  const complianceData = complianceResult.success
    ? complianceResult.data
    : null;

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Admin: Technical Compliance Report
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Monitor technical evaluation compliance and vendor qualification
            status.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 space-y-8">
          <div className="flex justify-end mb-4">
            <FinancialYearSelector />
          </div>
          {/* Compliance Overview */}
          {complianceData?.complianceBreakdown && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-700">
                    {complianceData.complianceBreakdown.total}
                  </div>
                  <div className="text-sm text-blue-600">Total Evaluations</div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-700">
                    {complianceData.complianceBreakdown.qualified}
                  </div>
                  <div className="text-sm text-green-600">
                    Qualified Bidders
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-red-700">
                    {complianceData.complianceBreakdown.disqualified}
                  </div>
                  <div className="text-sm text-red-600">
                    Disqualified Bidders
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-700">
                    {complianceData.complianceBreakdown.qualificationRate}%
                  </div>
                  <div className="text-sm text-purple-600">
                    Qualification Rate
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Document Compliance */}
          {complianceData?.documentCompliance && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Credential Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">60% Amount Put</span>
                      <span className="text-2xl font-bold text-blue-700">
                        {complianceData.documentCompliance.sixtyPerAmtPut}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Work Order</span>
                      <span className="text-2xl font-bold text-green-700">
                        {complianceData.documentCompliance.workOrder}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">Payment Certificate</span>
                      <span className="text-2xl font-bold text-purple-700">
                        {complianceData.documentCompliance.paymentCertificate}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">
                        Completion Certificate
                      </span>
                      <span className="text-2xl font-bold text-orange-700">
                        {
                          complianceData.documentCompliance
                            .completionCertificate
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Document Validity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                      <span className="font-medium">IT Return</span>
                      <span className="text-2xl font-bold text-indigo-700">
                        {complianceData.documentCompliance.itReturn}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                      <span className="font-medium">GST</span>
                      <span className="text-2xl font-bold text-teal-700">
                        {complianceData.documentCompliance.gst}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                      <span className="font-medium">Trade License</span>
                      <span className="text-2xl font-bold text-pink-700">
                        {complianceData.documentCompliance.tradeLicense}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="font-medium">Property Tax</span>
                      <span className="text-2xl font-bold text-yellow-700">
                        {complianceData.documentCompliance.pTax}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Technical Evaluations Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Technical Evaluations</span>
                <span className="text-sm text-gray-500">
                  {complianceData?.technicalEvaluations?.length || 0}{" "}
                  evaluations
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!complianceResult.success ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">
                    Error: {complianceResult.error}
                  </p>
                  <p className="text-gray-500">
                    Unable to load technical compliance data. Please try again
                    later.
                  </p>
                </div>
              ) : !complianceData?.technicalEvaluations ||
                complianceData.technicalEvaluations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No technical evaluations found. Evaluations will appear here
                    once vendors are assessed.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-3 border text-left">
                          Vendor Name
                        </th>
                        <th className="px-4 py-3 border text-left">
                          Qualification Status
                        </th>
                        <th className="px-4 py-3 border text-left">
                          Credentials
                        </th>
                        <th className="px-4 py-3 border text-left">
                          Documents
                        </th>
                        <th className="px-4 py-3 border text-left">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complianceData.technicalEvaluations.map((evaluation) => (
                        <tr key={evaluation.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 border">
                            <div>
                              <div className="font-medium">
                                {evaluation.Bidagency[0]?.agencydetails.name ||
                                  "Unknown Vendor"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {evaluation.Bidagency[0]?.agencydetails
                                  .mobileNumber || "No contact"}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 border">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                evaluation.qualify
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {evaluation.qualify
                                ? "Qualified"
                                : "Disqualified"}
                            </span>
                          </td>
                          <td className="px-4 py-3 border">
                            <div className="space-y-1">
                              <div className="text-sm">
                                <span
                                  className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                    evaluation.credencial.sixtyperamtput
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                ></span>
                                60% Amount:{" "}
                                {evaluation.credencial.sixtyperamtput
                                  ? "Yes"
                                  : "No"}
                              </div>
                              <div className="text-sm">
                                <span
                                  className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                    evaluation.credencial.workorder
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                ></span>
                                Work Order:{" "}
                                {evaluation.credencial.workorder ? "Yes" : "No"}
                              </div>
                              <div className="text-sm">
                                <span
                                  className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                    evaluation.credencial.paymentcertificate
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                ></span>
                                Payment Cert:{" "}
                                {evaluation.credencial.paymentcertificate
                                  ? "Yes"
                                  : "No"}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 border">
                            <div className="space-y-1">
                              <div className="text-sm">
                                <span
                                  className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                    evaluation.validityofdocument.itreturn
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                ></span>
                                IT Return:{" "}
                                {evaluation.validityofdocument.itreturn
                                  ? "Yes"
                                  : "No"}
                              </div>
                              <div className="text-sm">
                                <span
                                  className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                    evaluation.validityofdocument.gst
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                ></span>
                                GST:{" "}
                                {evaluation.validityofdocument.gst
                                  ? "Yes"
                                  : "No"}
                              </div>
                              <div className="text-sm">
                                <span
                                  className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                    evaluation.validityofdocument.tradelicence
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                ></span>
                                Trade License:{" "}
                                {evaluation.validityofdocument.tradelicence
                                  ? "Yes"
                                  : "No"}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 border">
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {evaluation.remarks || "No remarks"}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {complianceResult.success &&
                complianceData?.technicalEvaluations &&
                complianceData.technicalEvaluations.length > 0 && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Showing {complianceData.technicalEvaluations.length}{" "}
                      technical evaluations
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
