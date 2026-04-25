"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const populationData = [
  { year: 1991, population: 15000 },
  { year: 2001, population: 19000 },
  { year: 2011, population: 22000 },
  { year: 2021, population: 25000 },
  { year: 2031, population: 28000 }, // Projected
];

export default function PopulationTrends() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Population Trends</h1>
      <p className="text-xl mb-8">
        Analyzing population growth and projections for Dhalpara Gram Panchayat.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Population Growth Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              population: {
                label: "Population",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={populationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="population"
                  stroke="var(--color-population)"
                  name="Population"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Annual Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-center">1.3%</p>
            <p className="text-center text-sm">(2011-2021)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Projected Population (2031)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-center">28,000</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Migration Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-center">+0.5%</p>
            <p className="text-center text-sm">per year</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
