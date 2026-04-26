"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AllotmentTrend({ data }: { data: any[] }) {
  const chartData = data.map((item) => ({
    date: new Date(item.receivedDate).toLocaleDateString("en-IN"),
    amount: item.amount,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="amount" stroke="#6366f1" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
