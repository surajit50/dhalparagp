"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface LeaseStatusChartProps {
  data: any[];
}

const COLORS = {
  ACTIVE: "#3b82f6",
  COMPLETED: "#22c55e",
  EXPIRED: "#f97316",
  CANCELLED: "#ef4444",
};

export function LeaseStatusChart({ data }: LeaseStatusChartProps) {
  const statusCounts = data.reduce((acc, lease) => {
    acc[lease.status] = (acc[lease.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.name as keyof typeof COLORS]}
            />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
