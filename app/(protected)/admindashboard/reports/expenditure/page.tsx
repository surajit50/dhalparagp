import type { AppPageProps } from "@/types/app-page-props";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExpenditureReport } from "@/action/reports-actions";
import { formatDistanceToNow } from "date-fns";
import {
  getCurrentFinancialYear,
  getFinancialYearDateRange,
} from "@/utils/financialYear";
import { FinancialYearSelector } from "../_components/financial-year-selector";
import { PrintButton } from "../_components/print-button";
import { gpcode } from "@/constants/gpinfor";

export default async function AdminExpenditureReportPage({
  searchParams,
}: AppPageProps) {
  const resolved = await searchParams;

  const financialYear =
    (resolved?.financialYear as string) || getCurrentFinancialYear();

  const { financialYearStart, financialYearEnd } =
    getFinancialYearDateRange(financialYear);

  const expenditureResult = await getExpenditureReport(
    financialYearStart,
    financialYearEnd,
  );

  const expenditureData = expenditureResult.success
    ? expenditureResult.data
    : null;

  const totalExpenditure = expenditureData?.summary?.totalExpenditure || 0;

  const netExpenditure = expenditureData?.summary?.netExpenditure || 0;

  const totalDeductions = totalExpenditure - netExpenditure;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <section className="bg-gradient-to-r from-red-800 to-yellow-600 text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold">{gpcode} Gram Panchayat</h1>
          <p className="mt-2">Administrative Expenditure Report</p>
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

      <section className="container mx-auto px-4 pb-12">
        {expenditureData?.summary ? (
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-xl font-bold text-green-700">
                  ₹ {totalExpenditure.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Expenditure</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-xl font-bold text-orange-700">
                  ₹ {netExpenditure.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Net Expenditure</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-xl font-bold text-orange-700">
                  ₹ {totalDeductions.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Deductions</div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No expenditure data available
          </p>
        )}
      </section>
    </div>
  );
}
