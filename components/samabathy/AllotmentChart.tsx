"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  total: number;
  remaining: number;
}

export default function AllotmentChart({ total, remaining }: Props) {
  const used = total - remaining;

  const data = [
    { name: "Used", value: used },
    { name: "Remaining", value: remaining },
  ];

  const COLORS = ["#ef4444", "#22c55e"];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <p className="text-center text-sm text-muted-foreground mt-2">
        Fund Distribution
      </p>
    </div>
  );
}
