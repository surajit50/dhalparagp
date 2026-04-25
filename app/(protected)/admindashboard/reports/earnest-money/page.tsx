import type { AppPageProps } from "@/types/app-page-props";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEarnestMoneyReport } from "@/action/reports-actions";
import { formatDistanceToNow } from "date-fns";
import {
  getCurrentFinancialYear,
  getFinancialYearDateRange,
} from "@/utils/financialYear";
import { FinancialYearSelector } from "../_components/financial-year-selector";
import { PrintButton } from "../_components/print-button";
import { gpcode } from "@/constants/gpinfor";

export default async function EarnestMoneyReportPage({
  searchParams,
}: AppPageProps) {
  const resolved = await searchParams;

  const financialYear =
    (resolved?.financialYear as string) || getCurrentFinancialYear();

  const { financialYearStart, financialYearEnd } =
    getFinancialYearDateRange(financialYear);

  const result = await getEarnestMoneyReport({
    startDate: financialYearStart,
    endDate: financialYearEnd,
  });

  if (!result.success) {
    return (
      <div className="p-10 text-center text-red-600">
        {result.error || "Failed to load Earnest Money report"}
      </div>
    );
  }

  const data = result.data!;
  const today = new Date();

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* ================= HEADER ================= */}
      <section className="bg-gradient-to-r from-amber-700 via-orange-600 to-red-600 text-white py-10 shadow-md print:bg-white print:text-black">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">
            {gpcode} Gram Panchayat
          </h1>
          <p className="mt-2 text-lg">Earnest Money Deposit (EMD) Report</p>
          <p className="text-sm mt-2">
            Financial Year:{" "}
            <span className="font-semibold">{financialYear}</span>
          </p>
          <p className="text-xs mt-1">
            Generated {formatDistanceToNow(new Date(), { addSuffix: true })}
          </p>
        </div>
      </section>

      {/* ================= CONTROLS ================= */}
      <section className="py-6 container mx-auto px-4 flex justify-between items-center print:hidden">
        <FinancialYearSelector />
        <PrintButton label="Print Report" />
      </section>

      <section className="container mx-auto px-4 pb-12 space-y-10">
        {/* ================= KPI SUMMARY ================= */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="border-l-4 border-blue-600">
            <CardContent className="p-6 text-center">
              <div className="text-xl font-bold text-blue-700">
                ₹{data.summary.totalAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total EMD</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-600">
            <CardContent className="p-6 text-center">
              <div className="text-xl font-bold text-green-700">
                ₹{data.summary.paidAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Paid</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-yellow-600">
            <CardContent className="p-6 text-center">
              <div className="text-xl font-bold text-yellow-700">
                ₹{data.summary.pendingAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-600">
            <CardContent className="p-6 text-center">
              <div className="text-xl font-bold text-purple-700">
                ₹{data.summary.refundedAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Refunded</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-red-600">
            <CardContent className="p-6 text-center">
              <div className="text-xl font-bold text-red-700">
                ₹{data.summary.forfeitedAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Forfeited</div>
            </CardContent>
          </Card>
        </div>

        {/* ================= AGING DASHBOARD ================= */}
        <Card>
          <CardHeader>
            <CardTitle>EMD Aging Analysis (Pending Only)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div className="p-6 bg-green-50 border rounded">
                <div className="text-2xl font-bold text-green-700">
                  {data.agingSummary.days0to30}
                </div>
                <div className="text-sm text-green-600">0 – 30 Days</div>
              </div>

              <div className="p-6 bg-yellow-50 border rounded">
                <div className="text-2xl font-bold text-yellow-700">
                  {data.agingSummary.days31to60}
                </div>
                <div className="text-sm text-yellow-600">31 – 60 Days</div>
              </div>

              <div className="p-6 bg-orange-50 border rounded">
                <div className="text-2xl font-bold text-orange-700">
                  {data.agingSummary.days61to90}
                </div>
                <div className="text-sm text-orange-600">61 – 90 Days</div>
              </div>

              <div className="p-6 bg-red-50 border rounded font-semibold">
                <div className="text-2xl text-red-700">
                  {data.agingSummary.above90}
                </div>
                <div className="text-sm text-red-600">90+ Days (Critical)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ================= TABLE ================= */}
        <Card>
          <CardHeader>
            <CardTitle>Earnest Money Records</CardTitle>
          </CardHeader>
          <CardContent>
            {data.earnestMoneyRecords.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Vendor</th>
                      <th className="p-2 border text-right">Amount</th>
                      <th className="p-2 border text-center">Status</th>
                      <th className="p-2 border text-center">Aging</th>
                      <th className="p-2 border">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.earnestMoneyRecords.map((record) => {
                      const diffInDays = Math.floor(
                        (today.getTime() -
                          new Date(record.createdAt).getTime()) /
                          (1000 * 60 * 60 * 24),
                      );

                      const isCritical =
                        record.paymentstatus === "pending" && diffInDays > 90;

                      return (
                        <tr
                          key={record.id}
                          className={`hover:bg-gray-50 ${
                            isCritical ? "bg-red-50" : ""
                          }`}
                        >
                          <td className="p-2 border">
                            <div className="font-medium">
                              {record.bidderName.agencydetails.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {record.bidderName.agencydetails.mobileNumber ||
                                "N/A"}
                            </div>
                          </td>

                          <td className="p-2 border text-right font-semibold">
                            ₹{record.earnestMoneyAmount.toLocaleString()}
                          </td>

                          <td className="p-2 border text-center">
                            {record.paymentstatus.toUpperCase()}
                          </td>

                          <td className="p-2 border text-center text-xs">
                            {record.paymentstatus === "pending"
                              ? `${diffInDays} days`
                              : "-"}
                          </td>

                          <td className="p-2 border text-xs text-gray-600">
                            {formatDistanceToNow(new Date(record.createdAt), {
                              addSuffix: true,
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No EMD records found for this financial year.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
