"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, TrendingUp, FileText } from "lucide-react";
import { PieChart, Pie, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { gpcode } from "@/constants/gpinfor";
interface SummaryItem {
  financialYear: string;
  formattedNit: string;
  nitDate: Date;
  totalPaid: number;
  totalPending: number;
  workCount: number;
}

interface SummaryCardProps {
  summaryData: Record<string, SummaryItem>;
  grandTotalPaid: number;
  grandTotalPending: number;
  totalWorks: number;
}

export default function SummaryCard({
  summaryData,
  grandTotalPaid,
  grandTotalPending,
  totalWorks,
}: SummaryCardProps) {
  const nitEntries = Object.entries(summaryData);
  const totalAmount = grandTotalPaid + grandTotalPending;

  // Bug fix: Handle division by zero
  const paidPercentage =
    totalAmount > 0 ? (grandTotalPaid / totalAmount) * 100 : 0;
  const pendingPercentage =
    totalAmount > 0 ? (grandTotalPending / totalAmount) * 100 : 0;

  const chartConfig = {
    paid: {
      label: "Paid",
      color: "hsl(var(--chart-1))",
    },
    pending: {
      label: "Pending",
      color: "hsl(var(--chart-2))",
    },
  };

  const pieData = [
    {
      name: "paid",
      label: "Paid",
      value: grandTotalPaid,
      percentage: paidPercentage,
      fill: "var(--color-paid)",
    },
    {
      name: "pending",
      label: "Pending",
      value: grandTotalPending,
      percentage: pendingPercentage,
      fill: "var(--color-pending)",
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Financial Summary
          </CardTitle>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total Works</p>
                <p className="text-lg font-bold">{totalWorks}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total Value</p>
                <CurrencyDisplay
                  value={totalAmount}
                  className="text-lg font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Enhanced Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-muted/30 rounded-xl border">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Payment Distribution
            </h3>
            <ChartContainer
              config={chartConfig}
              className="aspect-square max-h-[250px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          <div className="space-y-4">
            <h4 className="text-md font-medium text-center lg:text-left">
              Breakdown
            </h4>
            {pieData.map((entry) => (
              <div
                key={entry.name}
                className="flex items-center justify-between p-4 bg-background rounded-lg border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-background shadow-sm"
                    style={{ backgroundColor: entry.fill }}
                  />
                  <div>
                    <span className="font-medium text-foreground">
                      {entry.label}
                    </span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {entry.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <CurrencyDisplay
                  value={entry.value}
                  className={`text-sm font-semibold ${
                    entry.name === "paid"
                      ? "text-green-600 dark:text-green-400"
                      : "text-orange-600 dark:text-orange-400"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Table Section */}
        <div className="border rounded-xl overflow-hidden bg-background">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">
                    Financial Year
                  </TableHead>
                  <TableHead className="font-semibold">NIT Number</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="text-center font-semibold">
                    Works
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    Paid Amount
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    Pending Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nitEntries.map(([memo, data]) => (
                  <TableRow
                    key={memo}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <Badge variant="outline">{data.financialYear}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {data.formattedNit}/{gpcode}/{data.nitDate.getFullYear()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {data.nitDate.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{data.workCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <CurrencyDisplay
                        value={data.totalPaid}
                        className="text-green-600 dark:text-green-400 font-medium"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <CurrencyDisplay
                        value={data.totalPending}
                        className="text-orange-600 dark:text-orange-400 font-medium"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableCell colSpan={3} className="font-bold text-lg">
                    Grand Total
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="default" className="font-bold">
                      {totalWorks}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <CurrencyDisplay
                      value={grandTotalPaid}
                      className="text-green-600 dark:text-green-400 font-bold text-lg"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <CurrencyDisplay
                      value={grandTotalPending}
                      className="text-orange-600 dark:text-orange-400 font-bold text-lg"
                    />
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced CurrencyDisplay Component
export const CurrencyDisplay = ({
  value,
  className = "",
  showSymbol = true,
}: {
  value: number;
  className?: string;
  showSymbol?: boolean;
}) => (
  <div className={`flex items-center justify-end gap-1 ${className}`}>
    {showSymbol && (
      <IndianRupee className="h-4 w-4 text-current flex-shrink-0" />
    )}
    <span className="font-medium tabular-nums">
      {value.toLocaleString("en-IN", {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      })}
    </span>
  </div>
);
