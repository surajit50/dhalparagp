import type { AppPageProps } from "@/types/app-page-props";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVendorParticipationReport } from "@/action/reports-actions";
import {
  getCurrentFinancialYear,
  getFinancialYearDateRange,
} from "@/utils/financialYear";
import { FinancialYearSelector } from "../_components/financial-year-selector";
import { PrintButton } from "../_components/print-button";
import { formatDistanceToNow } from "date-fns";
import { gpcode } from "@/constants/gpinfor";

export default async function VendorParticipationReportPage({
  searchParams,
}: AppPageProps) {
  const resolved = await searchParams;

  const financialYear =
    (resolved?.financialYear as string) || getCurrentFinancialYear();

  const { financialYearStart, financialYearEnd } =
    getFinancialYearDateRange(financialYear);

  const vendorResult = await getVendorParticipationReport(
    financialYearStart,
    financialYearEnd,
  );

  const vendorData = vendorResult.success ? vendorResult.data : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <section className="bg-gradient-to-r from-indigo-800 to-purple-600 text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold">{gpcode} Gram Panchayat</h1>
          <p className="mt-2">Vendor Participation Report</p>
          <p className="text-sm mt-2">Financial Year: {financialYear}</p>
          <p className="text-xs mt-1">
            Generated {formatDistanceToNow(new Date(), { addSuffix: true })}
          </p>
        </div>
      </section>

      <section className="py-6 container mx-auto px-4 flex justify-between">
        <FinancialYearSelector />
        <PrintButton />
      </section>

      <section className="container mx-auto px-4 pb-12 space-y-8">
        {/* SUMMARY CARDS */}
        {vendorData?.summary && (
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-xl font-bold text-blue-700">
                  {vendorData.summary.totalVendors}
                </div>
                <div className="text-sm text-gray-600">Total Vendors</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-xl font-bold text-green-700">
                  {vendorData.summary.activeVendors}
                </div>
                <div className="text-sm text-gray-600">Active Vendors</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-xl font-bold text-purple-700">
                  {vendorData.summary.qualifiedVendors}
                </div>
                <div className="text-sm text-gray-600">Qualified Vendors</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-xl font-bold text-orange-700">
                  {vendorData.summary.participationRate}%
                </div>
                <div className="text-sm text-gray-600">Participation Rate</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {vendorData?.vendorPerformance?.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Vendor</th>
                      <th className="p-2 border text-center">Bids</th>
                      <th className="p-2 border text-center">Contracts</th>
                      <th className="p-2 border text-right">Earnest Money</th>
                      <th className="p-2 border text-center">Qualified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorData.vendorPerformance.map((vendor, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-2 border font-medium">
                          {vendor.vendorName}
                        </td>
                        <td className="p-2 border text-center">
                          {vendor.totalBids}
                        </td>
                        <td className="p-2 border text-center">
                          {vendor.totalContracts}
                        </td>
                        <td className="p-2 border text-right">
                          ₹{vendor.totalEarnestMoney.toLocaleString()}
                        </td>
                        <td className="p-2 border text-center">
                          {vendor.isQualified ? "Yes" : "No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No vendor data found.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
