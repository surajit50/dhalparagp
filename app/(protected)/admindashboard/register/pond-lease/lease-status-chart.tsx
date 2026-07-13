"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

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
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          itemStyle={{ fontWeight: 500 }}
        />
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          fill="#8884d8"
          dataKey="value"
          stroke="none"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.name as keyof typeof COLORS]}
            />
          ))}
        </Pie>
        <Legend iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}
