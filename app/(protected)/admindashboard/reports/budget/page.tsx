import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  FileText,
} from "lucide-react";
import { getBudgetReport } from "@/action/reports-actions";
import {
  getCurrentFinancialYear,
  generateFinancialYears,
} from "@/utils/financialYear";
import { FinancialYearSelector } from "../_components/financial-year-selector";

export default async function AdminBudgetReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;
  const financialYear =
    (resolved?.financialYear as string) || getCurrentFinancialYear();
  const budgetResult = await getBudgetReport(financialYear);
  const budgetData = budgetResult.success ? budgetResult.data : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Budget Report Header */}
      <section className="bg-gradient-to-r from-blue-800 to-green-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Admin: Budget & Finance Report
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Internal financial overview and budget allocation for administrative
            review
          </p>
        </div>
      </section>

      {/* Budget Overview */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-end mb-4">
            <FinancialYearSelector />
          </div>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Budget Overview
            </h2>
            <p className="text-lg text-gray-600">
              Total Budget: ₹
              {budgetData?.summary?.totalBudget?.toLocaleString() || "0"}
            </p>
          </div>

          {budgetData?.summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-1">
                  ₹{(budgetData.summary.totalGeneralFund / 100000).toFixed(1)}L
                </div>
                <div className="text-gray-700">General Fund</div>
                <div className="text-xs text-gray-500">
                  {budgetData.summary.totalBudget > 0
                    ? Math.round(
                        (budgetData.summary.totalGeneralFund /
                          budgetData.summary.totalBudget) *
                          100
                      )
                    : 0}
                  % of total
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700 mb-1">
                  ₹{(budgetData.summary.totalScFund / 100000).toFixed(1)}L
                </div>
                <div className="text-gray-700">SC Fund</div>
                <div className="text-xs text-gray-500">
                  {budgetData.summary.totalBudget > 0
                    ? Math.round(
                        (budgetData.summary.totalScFund /
                          budgetData.summary.totalBudget) *
                          100
                      )
                    : 0}
                  % of total
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-700 mb-1">
                  ₹{(budgetData.summary.totalStFund / 100000).toFixed(1)}L
                </div>
                <div className="text-gray-700">ST Fund</div>
                <div className="text-xs text-gray-500">
                  {budgetData.summary.totalBudget > 0
                    ? Math.round(
                        (budgetData.summary.totalStFund /
                          budgetData.summary.totalBudget) *
                          100
                      )
                    : 0}
                  % of total
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-700 mb-1">
                  ₹{(budgetData.summary.totalSpent / 100000).toFixed(1)}L
                </div>
                <div className="text-gray-700">Total Spent</div>
                <div className="text-xs text-gray-500">
                  {budgetData.summary.utilizationRate}% utilization
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tabs for Admin Budget Details */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
              <TabsTrigger value="current">Current Budget</TabsTrigger>
              <TabsTrigger value="expenditure">Expenditure</TabsTrigger>
              <TabsTrigger value="sector">Sector Wise</TabsTrigger>
              <TabsTrigger value="projects">Action Plans</TabsTrigger>
            </TabsList>

            {/* Current Budget */}
            <TabsContent value="current" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Budget Allocation Summary
                </h2>
                <p className="text-lg text-gray-600">
                  Breakdown of budget allocation for internal review
                </p>
              </div>

              {budgetData?.summary ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <PieChart className="mr-2 h-5 w-5 text-green-700" />
                        General Fund - ₹
                        {budgetData.summary.totalGeneralFund.toLocaleString()}
                      </CardTitle>
                      <CardDescription>
                        {budgetData.summary.totalBudget > 0
                          ? Math.round(
                              (budgetData.summary.totalGeneralFund /
                                budgetData.summary.totalBudget) *
                                100
                            )
                          : 0}
                        % of total budget
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Allocated</span>
                          <span className="font-semibold">
                            ₹
                            {budgetData.summary.totalGeneralFund.toLocaleString()}
                          </span>
                        </div>
                        <Progress
                          value={
                            budgetData.summary.totalBudget > 0
                              ? (budgetData.summary.totalGeneralFund /
                                  budgetData.summary.totalBudget) *
                                100
                              : 0
                          }
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5 text-blue-700" />
                        SC Fund - ₹
                        {budgetData.summary.totalScFund.toLocaleString()}
                      </CardTitle>
                      <CardDescription>
                        {budgetData.summary.totalBudget > 0
                          ? Math.round(
                              (budgetData.summary.totalScFund /
                                budgetData.summary.totalBudget) *
                                100
                            )
                          : 0}
                        % of total budget
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Allocated</span>
                          <span className="font-semibold">
                            ₹{budgetData.summary.totalScFund.toLocaleString()}
                          </span>
                        </div>
                        <Progress
                          value={
                            budgetData.summary.totalBudget > 0
                              ? (budgetData.summary.totalScFund /
                                  budgetData.summary.totalBudget) *
                                100
                              : 0
                          }
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-purple-700" />
                        ST Fund - ₹
                        {budgetData.summary.totalStFund.toLocaleString()}
                      </CardTitle>
                      <CardDescription>
                        {budgetData.summary.totalBudget > 0
                          ? Math.round(
                              (budgetData.summary.totalStFund /
                                budgetData.summary.totalBudget) *
                                100
                            )
                          : 0}
                        % of total budget
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Allocated</span>
                          <span className="font-semibold">
                            ₹{budgetData.summary.totalStFund.toLocaleString()}
                          </span>
                        </div>
                        <Progress
                          value={
                            budgetData.summary.totalBudget > 0
                              ? (budgetData.summary.totalStFund /
                                  budgetData.summary.totalBudget) *
                                100
                              : 0
                          }
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="mr-2 h-5 w-5 text-orange-700" />
                        Budget Utilization -{" "}
                        {budgetData.summary.utilizationRate}%
                      </CardTitle>
                      <CardDescription>
                        Total spent: ₹
                        {budgetData.summary.totalSpent.toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Utilization Rate</span>
                          <span className="font-semibold">
                            {budgetData.summary.utilizationRate}%
                          </span>
                        </div>
                        <Progress
                          value={budgetData.summary.utilizationRate}
                          className="h-2"
                        />
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>
                            Remaining: ₹
                            {budgetData.summary.remainingBudget.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No budget data available</p>
                </div>
              )}
            </TabsContent>

            {/* Expenditure */}
            <TabsContent value="expenditure" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Expenditure Analysis
                </h2>
                <p className="text-lg text-gray-600">
                  Detailed breakdown of budget utilization
                </p>
              </div>

              {budgetData?.summary ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Budget vs Expenditure</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="font-medium">Total Budget</span>
                          <span className="text-2xl font-bold text-blue-700">
                            ₹{budgetData.summary.totalBudget.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="font-medium">Total Spent</span>
                          <span className="text-2xl font-bold text-green-700">
                            ₹{budgetData.summary.totalSpent.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                          <span className="font-medium">Remaining</span>
                          <span className="text-2xl font-bold text-orange-700">
                            ₹
                            {budgetData.summary.remainingBudget.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Fund Allocation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                          <span className="font-medium">General Fund</span>
                          <span className="text-2xl font-bold text-purple-700">
                            ₹
                            {budgetData.summary.totalGeneralFund.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                          <span className="font-medium">SC Fund</span>
                          <span className="text-2xl font-bold text-indigo-700">
                            ₹{budgetData.summary.totalScFund.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                          <span className="font-medium">ST Fund</span>
                          <span className="text-2xl font-bold text-teal-700">
                            ₹{budgetData.summary.totalStFund.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No expenditure data available</p>
                </div>
              )}
            </TabsContent>

            {/* Sector Wise */}
            <TabsContent value="sector" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sector-wise Budget Allocation
                </h2>
                <p className="text-lg text-gray-600">
                  Budget distribution across different sectors
                </p>
              </div>

              {budgetData?.sectorData && budgetData.sectorData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {budgetData.sectorData.map((sector, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle>{sector.sector}</CardTitle>
                        <CardDescription>
                          {sector.count} action plans
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Budget</span>
                            <span className="font-semibold">
                              ₹{sector.totalBudget.toLocaleString()}
                            </span>
                          </div>
                          <Progress
                            value={
                              budgetData.summary.totalBudget > 0
                                ? (sector.totalBudget /
                                    budgetData.summary.totalBudget) *
                                  100
                                : 0
                            }
                            className="h-2"
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Spent</span>
                            <span className="font-semibold">
                              ₹{sector.totalSpent.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Utilization:{" "}
                            {sector.totalBudget > 0
                              ? Math.round(
                                  (sector.totalSpent / sector.totalBudget) * 100
                                )
                              : 0}
                            %
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No sector data available</p>
                </div>
              )}
            </TabsContent>

            {/* Action Plans */}
            <TabsContent value="projects" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Approved Action Plans
                </h2>
                <p className="text-lg text-gray-600">
                  Detailed view of all approved action plans
                </p>
              </div>

              {budgetData?.actionPlans && budgetData.actionPlans.length > 0 ? (
                <div className="space-y-6">
                  {budgetData.actionPlans.map((plan, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{plan.activityName}</span>
                          <span className="text-sm text-gray-500">
                            FY: {plan.financialYear}
                          </span>
                        </CardTitle>
                        <CardDescription>
                          {plan.activityDescription}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-700">
                              ₹{plan.generalFund.toLocaleString()}
                            </div>
                            <div className="text-sm text-blue-600">
                              General Fund
                            </div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-lg font-bold text-green-700">
                              ₹{plan.scFund.toLocaleString()}
                            </div>
                            <div className="text-sm text-green-600">
                              SC Fund
                            </div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-lg font-bold text-purple-700">
                              ₹{plan.stFund.toLocaleString()}
                            </div>
                            <div className="text-sm text-purple-600">
                              ST Fund
                            </div>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-lg font-bold text-orange-700">
                              ₹{plan.estimatedCost.toLocaleString()}
                            </div>
                            <div className="text-sm text-orange-600">
                              Total Cost
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                          <div>
                            <strong>Sector:</strong> {plan.sector}
                          </div>
                          <div>
                            <strong>Location:</strong> {plan.locationofAsset}
                          </div>
                          <div>
                            <strong>Duration:</strong> {plan.totalduration}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No action plans available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
