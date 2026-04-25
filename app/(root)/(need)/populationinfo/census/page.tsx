"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { villageData } from "@/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Page() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVillages = villageData.filter((village) =>
    village.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPopulation = villageData.reduce(
    (sum, village) => sum + village.totalPopulation,
    0
  );
  const totalHouseholds = villageData.reduce(
    (sum, village) => sum + village.households,
    0
  );
  const averageVillagePopulation = Math.round(
    totalPopulation / villageData.length
  );

  const top5Villages = [...villageData]
    .sort((a, b) => b.totalPopulation - a.totalPopulation)
    .slice(0, 5);

  const genderData = [
    {
      name: "Male",
      value: villageData.reduce(
        (sum, village) => sum + village.malePopulation,
        0
      ),
    },
    {
      name: "Female",
      value: villageData.reduce(
        (sum, village) => sum + village.femalePopulation,
        0
      ),
    },
  ];

  const literacyData = [
    {
      name: "Literate",
      value: villageData.reduce(
        (sum, village) => sum + village.totalLiterate,
        0
      ),
    },
    {
      name: "Illiterate",
      value: villageData.reduce(
        (sum, village) => sum + village.illiteratePopulation,
        0
      ),
    },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">
        Dhalpara Gram Panchayat: Village-wise Census Data (2011)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Villages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{villageData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Population
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPopulation.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Households
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalHouseholds.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="population" className="mb-8">
        <TabsList>
          <TabsTrigger value="population">Population</TabsTrigger>
          <TabsTrigger value="gender">Gender Distribution</TabsTrigger>
          <TabsTrigger value="literacy">Literacy</TabsTrigger>
        </TabsList>
        <TabsContent value="population">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Villages by Population</CardTitle>
              <CardDescription>
                Largest villages in Dhalpara Gram Panchayat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  population: {
                    label: "Population",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top5Villages}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey="totalPopulation"
                      fill="var(--color-population)"
                      name="Population"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="gender">
          <Card>
            <CardHeader>
              <CardTitle>Gender Distribution</CardTitle>
              <CardDescription>
                Male vs Female population in Dhalpara Gram Panchayat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {genderData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="literacy">
          <Card>
            <CardHeader>
              <CardTitle>Literacy Rate</CardTitle>
              <CardDescription>
                Literate vs Illiterate population in Dhalpara Gram Panchayat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={literacyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {literacyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Village Data</CardTitle>
          <CardDescription>
            Detailed census data for each village in Dhalpara Gram Panchayat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search villages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>JL No</TableHead>
                  <TableHead>Village Name</TableHead>
                  <TableHead>Households</TableHead>
                  <TableHead>Total Population</TableHead>
                  <TableHead>Male</TableHead>
                  <TableHead>Female</TableHead>
                  <TableHead>Literate</TableHead>
                  <TableHead>SC Population</TableHead>
                  <TableHead>ST Population</TableHead>
                  <TableHead>Illiterate</TableHead>
                  <TableHead>Child Population (0-6)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVillages.map((village) => (
                  <TableRow key={village.jlNo}>
                    <TableCell>{village.jlNo}</TableCell>
                    <TableCell className="font-medium">
                      {village.name}
                    </TableCell>
                    <TableCell>{village.households}</TableCell>
                    <TableCell>{village.totalPopulation}</TableCell>
                    <TableCell>{village.malePopulation}</TableCell>
                    <TableCell>{village.femalePopulation}</TableCell>
                    <TableCell>{village.totalLiterate}</TableCell>
                    <TableCell>{village.scPopulation}</TableCell>
                    <TableCell>{village.stPopulation}</TableCell>
                    <TableCell>{village.illiteratePopulation}</TableCell>
                    <TableCell>{village.childPopulation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Dhalpara Gram Panchayat consists of {villageData.length} villages.
            </li>
            <li>
              The total population of the Gram Panchayat is{" "}
              {totalPopulation.toLocaleString()}.
            </li>
            <li>
              There are {totalHouseholds.toLocaleString()} households across all
              villages.
            </li>
            <li>
              The average population per village is {averageVillagePopulation}.
            </li>
            <li>
              The largest village by population is {top5Villages[0].name} with{" "}
              {top5Villages[0].totalPopulation.toLocaleString()} residents.
            </li>
            <li>
              The smallest village is{" "}
              {
                villageData.reduce((min, village) =>
                  village.totalPopulation < min.totalPopulation ? village : min
                ).name
              }{" "}
              with only{" "}
              {
                villageData.reduce((min, village) =>
                  village.totalPopulation < min.totalPopulation ? village : min
                ).totalPopulation
              }{" "}
              residents.
            </li>
            <li>
              The gender distribution shows{" "}
              {((genderData[0].value / totalPopulation) * 100).toFixed(2)}% male
              and {((genderData[1].value / totalPopulation) * 100).toFixed(2)}%
              female population.
            </li>
            <li>
              The literacy rate in the Gram Panchayat is{" "}
              {((literacyData[0].value / totalPopulation) * 100).toFixed(2)}
              %.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
