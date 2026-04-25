"use client";

import type React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

// Mock interface - replace with your actual Prisma type
interface ApprovedActionPlanDetails {
  id: string;
  financialYear: string;
  schemeName: string;
  activityCode: string;
  activityDescription: string;
  sector: string;
  estimatedCost: number;
  isPublish: boolean;
}

interface WorkListBySchemeProps {
  works: ApprovedActionPlanDetails[];
}

const STAT_COLORS = {
  tender: "#10b981",
  nonTender: "#ef4444",
  tied: "#3b82f6",
  untied: "#f59e0b",
  primary: "#6366f1",
  secondary: "#8b5cf6",
} as const;

const CHART_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#84cc16",
  "#f97316",
  "#64748b",
];

export function WorkListByScheme({ works = [] }: WorkListBySchemeProps) {
  // Memoized years calculation
  const years = useMemo(
    () =>
      Array.from(new Set(works.map((work) => work.financialYear))).sort(
        (a, b) => b.localeCompare(a)
      ),
    [works]
  );

  const [selectedYear, setSelectedYear] = useState(years[0] || "");
  const [selectedScheme, setSelectedScheme] = useState("All");
  const [selectedSector, setSelectedSector] = useState("All");

  // Chart refs for PDF export
  const schemeDistributionRef = useRef<HTMLDivElement>(null);
  const workTypeChartRef = useRef<HTMLDivElement>(null);
  const schemeComparisonRef = useRef<HTMLDivElement>(null);

  // Reset sector when year or scheme changes
  useEffect(() => {
    setSelectedSector("All");
  }, [selectedYear, selectedScheme]);

  // Memoized filtered works
  const filteredWorks = useMemo(
    () =>
      works.filter(
        (work) =>
          work.financialYear === selectedYear &&
          (selectedScheme === "All" || work.schemeName === selectedScheme) &&
          (selectedSector === "All" ||
            work.sector.trim().toLowerCase() ===
              selectedSector.trim().toLowerCase())
      ),
    [works, selectedYear, selectedScheme, selectedSector]
  );

  // Memoized statistics calculation
  const statistics = useMemo(() => {
    const totalWorks = filteredWorks.length;
    const totalTender = filteredWorks.filter((work) => work.isPublish).length;
    const totalNonTender = totalWorks - totalTender;

    // Fixed tied/untied calculation
    const totalTied = filteredWorks.filter(
      (work) =>
        work.sector.toLowerCase().includes("sanitation") ||
        work.sector.toLowerCase().includes("drinking water")
    ).length;
    const totalUntied = totalWorks - totalTied;

    const totalCost = filteredWorks.reduce(
      (sum, work) => sum + work.estimatedCost,
      0
    );
    const avgCost = totalWorks > 0 ? totalCost / totalWorks : 0;

    return {
      totalWorks,
      totalTender,
      totalNonTender,
      totalTied,
      totalUntied,
      totalCost,
      avgCost,
    };
  }, [filteredWorks]);

  // Memoized grouped works
  const groupedWorks = useMemo(() => {
    const groups: Record<
      string,
      {
        schemeName: string;
        tied: {
          sanitation: ApprovedActionPlanDetails[];
          drinkingWater: ApprovedActionPlanDetails[];
        };
        untied: ApprovedActionPlanDetails[];
        tender: number;
        nonTender: number;
        totalCost: number;
      }
    > = {};

    filteredWorks.forEach((work) => {
      const key = work.schemeName;
      if (!groups[key]) {
        groups[key] = {
          schemeName: work.schemeName,
          tied: { sanitation: [], drinkingWater: [] },
          untied: [],
          tender: 0,
          nonTender: 0,
          totalCost: 0,
        };
      }

      // Categorize work
      const sector = work.sector.toLowerCase();
      if (sector.includes("sanitation")) {
        groups[key].tied.sanitation.push(work);
      } else if (sector.includes("drinking water")) {
        groups[key].tied.drinkingWater.push(work);
      } else {
        groups[key].untied.push(work);
      }

      // Count tender status
      if (work.isPublish) {
        groups[key].tender++;
      } else {
        groups[key].nonTender++;
      }

      groups[key].totalCost += work.estimatedCost;
    });

    return groups;
  }, [filteredWorks]);

  // Memoized chart data
  const chartData = useMemo(() => {
    const schemePieData = Object.values(groupedWorks).map((scheme, index) => ({
      name: scheme.schemeName,
      value:
        scheme.tied.sanitation.length +
        scheme.tied.drinkingWater.length +
        scheme.untied.length,
      cost: scheme.totalCost,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));

    const workTypePieData = [
      {
        name: "Tender",
        value: statistics.totalTender,
        color: STAT_COLORS.tender,
      },
      {
        name: "Non-Tender",
        value: statistics.totalNonTender,
        color: STAT_COLORS.nonTender,
      },
      { name: "Tied", value: statistics.totalTied, color: STAT_COLORS.tied },
      {
        name: "Untied",
        value: statistics.totalUntied,
        color: STAT_COLORS.untied,
      },
    ].filter((item) => item.value > 0);

    const schemeBarData = Object.values(groupedWorks).map((scheme) => ({
      name:
        scheme.schemeName.length > 15
          ? scheme.schemeName.substring(0, 15) + "..."
          : scheme.schemeName,
      tender: scheme.tender,
      nonTender: scheme.nonTender,
      cost: scheme.totalCost,
    }));

    return { schemePieData, workTypePieData, schemeBarData };
  }, [groupedWorks, statistics]);

  // Available schemes for filter
  const availableSchemes = useMemo(
    () =>
      Array.from(
        new Set(
          works
            .filter((w) => w.financialYear === selectedYear)
            .map((w) => w.schemeName)
        )
      ),
    [works, selectedYear]
  );

  const sectorOptions = useMemo(() => {
    const sectors = works
      .filter((w) => w.financialYear === selectedYear)
      .map((w) => w.sector?.trim())
      .filter(Boolean);
    return ["All", ...Array.from(new Set(sectors.map((s) => s?.toLowerCase()))).map(
      (s) => sectors.find((sec) => sec?.toLowerCase() === s) || s
    )];
  }, [works, selectedYear]);

  // Chart capture function for PDF export
  const captureChart = async (
    chartRef: React.RefObject<HTMLDivElement | null>,
    chartName: string
  ) => {
    if (!chartRef.current) {
      console.warn(`Chart ref not found for ${chartName}`);
      return null;
    }

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#ffffff",
        scale: 1.5,
        logging: false,
        useCORS: true,
        allowTaint: true,
        height: chartRef.current.offsetHeight,
        width: chartRef.current.offsetWidth,
      });

      return {
        imgData: canvas.toDataURL("image/png", 0.8),
        width: canvas.width,
        height: canvas.height,
      };
    } catch (error) {
      console.error(`Error capturing ${chartName}:`, error);
      return null;
    }
  };

  // PDF Export Function with Charts
  const exportToPDF = async () => {
    try {
      const doc = new jsPDF("landscape", "pt", "a4");
      const date = new Date().toLocaleDateString();

      // Ensure we have valid data
      const yearText = selectedYear || "Unknown Year";
      const schemeText = selectedScheme || "All Schemes";
      const sectorText = selectedSector || "All Sectors";

      // Title - using proper number coordinates
      doc.setFontSize(18);
      doc.text(`Work List Dashboard - ${yearText}`, 20, 30);
      doc.setFontSize(10);
      doc.text(
        `Generated on: ${date} | Selected Year: ${yearText} | Selected Scheme: ${schemeText} | Selected Sector: ${sectorText}`,
        20,
        50
      );

      let finalY = 70;

      // Summary Table
      autoTable(doc, {
        startY: finalY,
        head: [["Metric", "Value"]],
        body: [
          ["Total Works", statistics.totalWorks.toString()],
          ["Tender Works", statistics.totalTender.toString()],
          ["Non-Tender Works", statistics.totalNonTender.toString()],
          ["Tied Works", statistics.totalTied.toString()],
          ["Untied Works", statistics.totalUntied.toString()],
          ["Total Cost", `₹${statistics.totalCost.toLocaleString("en-IN")}`],
          [
            "Average Cost",
            `₹${Math.round(statistics.avgCost).toLocaleString("en-IN")}`,
          ],
        ],
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        didDrawPage: (data) => {
          finalY = data.cursor?.y ? data.cursor.y + 20 : finalY + 200;
        },
      });

      // Capture all charts
      const charts = [
        { ref: schemeDistributionRef, name: "Scheme Distribution" },
        { ref: workTypeChartRef, name: "Work Type Distribution" },
        { ref: schemeComparisonRef, name: "Scheme Comparison" },
      ];

      for (const chart of charts) {
        if (chart.ref.current) {
          try {
            const chartData = await captureChart(chart.ref, chart.name);
            if (chartData) {
              // Add new page if needed
              if (finalY > 500) {
                doc.addPage();
                finalY = 30;
              }

              // Add chart title
              doc.setFontSize(14);
              doc.text(chart.name, 20, finalY);
              finalY += 20;

              // Calculate aspect ratio
              const aspectRatio = chartData.width / chartData.height;
              const chartWidth = 400;
              const chartHeight = chartWidth / aspectRatio;

              // Add chart image
              doc.addImage(
                chartData.imgData,
                "PNG",
                20,
                finalY,
                chartWidth,
                chartHeight
              );
              finalY += chartHeight + 30;
            }
          } catch (error) {
            console.error(`Error adding chart ${chart.name}:`, error);
            // Continue with next chart
          }
        }
      }

      // Scheme-wise tables
      Object.values(groupedWorks).forEach((scheme) => {
        try {
          // Add new page if needed
          if (finalY > 600) {
            doc.addPage();
            finalY = 30;
          }

          doc.setFontSize(14);
          const schemeName = scheme.schemeName || "Unknown Scheme";
          doc.text(`Scheme: ${schemeName}`, 20, finalY);
          finalY += 30;

          // Tied Works Table
          const tiedWorks = [
            ...scheme.tied.sanitation,
            ...scheme.tied.drinkingWater,
          ];
          if (tiedWorks.length > 0) {
            autoTable(doc, {
              startY: finalY,
              head: [
                [
                  "Activity Code",
                  "Activity Description",
                  "Sector",
                  "Cost (₹)",
                  "Status",
                ],
              ],
              body: tiedWorks.map((work) => [
                work.activityCode?.toString() || "",
                work.activityDescription || "",
                work.sector || "",
                work.estimatedCost?.toLocaleString("en-IN") || "0",
                work.isPublish ? "Tender" : "Non-Tender",
              ]),
              theme: "grid",
              headStyles: { fillColor: [52, 152, 219], textColor: 255 },
              didDrawPage: (data) => {
                finalY = data.cursor?.y ? data.cursor.y + 20 : finalY + 100;
              },
            });
          }

          // Untied Works Table
          if (scheme.untied.length > 0) {
            autoTable(doc, {
              startY: finalY,
              head: [
                [
                  "Activity Code",
                  "Activity Description",
                  "Sector",
                  "Cost (₹)",
                  "Status",
                ],
              ],
              body: scheme.untied.map((work) => [
                work.activityCode?.toString() || "",
                work.activityDescription || "",
                work.sector || "",
                work.estimatedCost?.toLocaleString("en-IN") || "0",
                work.isPublish ? "Tender" : "Non-Tender",
              ]),
              theme: "grid",
              headStyles: { fillColor: [155, 89, 182], textColor: 255 },
              didDrawPage: (data) => {
                finalY = data.cursor?.y ? data.cursor.y + 30 : finalY + 100;
              },
            });
          }

          // Add space between schemes
          finalY += 20;
        } catch (error) {
          console.error(`Error adding scheme ${scheme.schemeName}:`, error);
          // Continue with next scheme
        }
      });

      // Save PDF
      const fileName = `work-list-${yearText}-${date.replace(/\//g, "-")}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  // Custom components
  const ProgressBar = ({
    value,
    max,
    color,
  }: {
    value: number;
    max: number;
    color: string;
  }) => (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full transition-all duration-300 ease-in-out rounded-full"
        style={{
          width: `${max > 0 ? (value / max) * 100 : 0}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg border-gray-200">
        <p className="font-semibold text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">Works: {data.value}</p>
        {data.cost !== undefined && (
          <p className="text-sm text-gray-600">
            Total Cost: ₹{data.cost.toLocaleString("en-IN")}
          </p>
        )}
      </div>
    );
  };

  const StatCard = ({
    title,
    value,
    color,
    icon: Icon,
    progress,
  }: {
    title: string;
    value: number;
    color: string;
    icon: any;
    progress?: { current: number; max: number };
  }) => (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2" style={{ color }}>
          {value.toLocaleString("en-IN")}
        </div>
        {progress && (
          <ProgressBar
            value={progress.current}
            max={progress.max}
            color={color}
          />
        )}
      </CardContent>
    </Card>
  );

  // Empty state
  if (works.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Data Available
        </h3>
        <p className="text-gray-600">
          No work data found. Please check your data source.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Work List Dashboard
          </h1>
          <p className="text-gray-600">
            Overview of works by scheme and status
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedScheme} onValueChange={setSelectedScheme}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select Scheme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Schemes</SelectItem>
              {availableSchemes.map((scheme) => (
                <SelectItem key={scheme} value={scheme}>
                  {scheme.length > 25
                    ? scheme.substring(0, 25) + "..."
                    : scheme}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sector Filter Dropdown */}
          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Select Sector" />
            </SelectTrigger>
            <SelectContent>
              {sectorOptions.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={exportToPDF}
            variant="outline"
            className="ml-0 sm:ml-2"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tender Works"
          value={statistics.totalTender}
          color={STAT_COLORS.tender}
          icon={TrendingUp}
          progress={{
            current: statistics.totalTender,
            max: statistics.totalWorks,
          }}
        />
        <StatCard
          title="Non-Tender Works"
          value={statistics.totalNonTender}
          color={STAT_COLORS.nonTender}
          icon={TrendingDown}
          progress={{
            current: statistics.totalNonTender,
            max: statistics.totalWorks,
          }}
        />
        <StatCard
          title="Tied Works"
          value={statistics.totalTied}
          color={STAT_COLORS.tied}
          icon={Activity}
          progress={{
            current: statistics.totalTied,
            max: statistics.totalWorks,
          }}
        />
        <StatCard
          title="Untied Works"
          value={statistics.totalUntied}
          color={STAT_COLORS.untied}
          icon={FileText}
          progress={{
            current: statistics.totalUntied,
            max: statistics.totalWorks,
          }}
        />
      </div>

      {/* Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Cost:</span>
              <span className="font-semibold text-lg">
                ₹{statistics.totalCost.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Cost:</span>
              <span className="font-semibold">
                ₹{Math.round(statistics.avgCost).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Works:</span>
              <span className="font-semibold">{statistics.totalWorks}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Schemes:</span>
              <span className="font-semibold">
                {Object.keys(groupedWorks).length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tender Rate:</span>
              <span className="font-semibold">
                {statistics.totalWorks > 0
                  ? Math.round(
                      (statistics.totalTender / statistics.totalWorks) * 100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tied Rate:</span>
              <span className="font-semibold">
                {statistics.totalWorks > 0
                  ? Math.round(
                      (statistics.totalTied / statistics.totalWorks) * 100
                    )
                  : 0}
                %
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card ref={schemeDistributionRef}>
          <CardHeader>
            <CardTitle>Scheme Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {chartData.schemePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.schemePieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {chartData.schemePieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card ref={workTypeChartRef}>
          <CardHeader>
            <CardTitle>Work Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {chartData.workTypePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.workTypePieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {chartData.workTypePieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scheme Comparison Bar Chart */}
      {chartData.schemeBarData.length > 0 && (
        <Card ref={schemeComparisonRef}>
          <CardHeader>
            <CardTitle>Scheme Comparison - Tender vs Non-Tender</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.schemeBarData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="tender" fill={STAT_COLORS.tender} name="Tender" />
                <Bar
                  dataKey="nonTender"
                  fill={STAT_COLORS.nonTender}
                  name="Non-Tender"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Sector Cost Summary */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Sector Cost Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectorOptions.map((sector) => {
            if (sector === "All") return null;
            const sectorWorks = filteredWorks.filter(
              (work) =>
                work.sector.trim().toLowerCase() === sector.trim().toLowerCase()
            );
            const totalSectorCost = sectorWorks.reduce(
              (sum, work) => sum + work.estimatedCost,
              0
            );
            return (
              <Card
                key={sector}
                className="hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {sector}
                    </CardTitle>
                    <Activity className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-2xl font-bold mb-2"
                    style={{ color: STAT_COLORS.primary }}
                  >
                    ₹{totalSectorCost.toLocaleString("en-IN")}
                  </div>
                  <p className="text-sm text-gray-600">
                    Total Works: {sectorWorks.length}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Scheme Details */}
      {Object.values(groupedWorks).map((scheme) => {
        const totalSchemeWorks =
          scheme.tied.sanitation.length +
          scheme.tied.drinkingWater.length +
          scheme.untied.length;

        return (
          <Card key={scheme.schemeName} className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-xl">{scheme.schemeName}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-white">
                    Total: {totalSchemeWorks}
                  </Badge>
                  <Badge
                    style={{
                      backgroundColor: STAT_COLORS.tender,
                      color: "white",
                    }}
                  >
                    Tender: {scheme.tender}
                  </Badge>
                  <Badge
                    style={{
                      backgroundColor: STAT_COLORS.nonTender,
                      color: "white",
                    }}
                  >
                    Non-Tender: {scheme.nonTender}
                  </Badge>
                  <Badge variant="secondary">
                    Cost: ₹{scheme.totalCost.toLocaleString("en-IN")}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              {/* Tied Works */}
              {(scheme.tied.sanitation.length > 0 ||
                scheme.tied.drinkingWater.length > 0) && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-blue-700">
                    Tied Works (
                    {scheme.tied.sanitation.length +
                      scheme.tied.drinkingWater.length}
                    )
                  </h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px]">
                            Activity
                          </TableHead>
                          <TableHead>Sector</TableHead>
                          <TableHead className="text-right">Cost</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          ...scheme.tied.sanitation,
                          ...scheme.tied.drinkingWater,
                        ].map((work) => (
                          <TableRow key={work.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              {work.activityDescription}-{work.activityCode}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700"
                              >
                                {work.sector}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              ₹{work.estimatedCost.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  work.isPublish ? "default" : "secondary"
                                }
                                className={
                                  work.isPublish
                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                    : "bg-red-100 text-red-800 hover:bg-red-200"
                                }
                              >
                                {work.isPublish ? "Tender" : "Non-Tender"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Untied Works */}
              {scheme.untied.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-amber-700">
                    Untied Works ({scheme.untied.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px]">
                            Activity
                          </TableHead>
                          <TableHead>Sector</TableHead>
                          <TableHead className="text-right">Cost</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scheme.untied.map((work) => (
                          <TableRow key={work.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              {work.activityDescription}-{work.activityCode}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-700"
                              >
                                {work.sector}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              ₹{work.estimatedCost.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  work.isPublish ? "default" : "secondary"
                                }
                                className={
                                  work.isPublish
                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                    : "bg-red-100 text-red-800 hover:bg-red-200"
                                }
                              >
                                {work.isPublish ? "Tender" : "Non-Tender"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
