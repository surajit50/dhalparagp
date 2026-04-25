"use client";

import useSWR from "swr";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Activity } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

export default function LiveCharts() {
  const { data, isLoading } = useSWR("/api/dashboard", fetcher, {
    refreshInterval: 5000, // 🔥 auto refresh every 5 sec
    revalidateOnFocus: true,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse text-sm">
          Loading live metrics...
        </p>
      </div>
    );
  }

  const applicationData = [
    { name: "Approved", value: data.approvedWarish },
    { name: "Pending", value: data.pendingWarish },
    { name: "Rejected", value: data.rejectedWarish },
    { name: "Process", value: data.processWarish },
  ];

  const workData = [
    { name: "Completed", value: data.completedWorks },
    { name: "In Progress", value: data.inProgressWorks },
    { name: "Approved", value: data.approvedWorks },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-8 mb-12">
      {/* PIE CHART */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Application Status
            </h3>
            <p className="text-sm text-slate-500">Live distribution</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              Live
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={applicationData}
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {applicationData.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                  className="outline-none"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* BAR CHART */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Work Progress</h3>
            <p className="text-sm text-slate-500">Project status tracking</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              Live
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={workData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            />
            <Bar
              dataKey="value"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* LAST UPDATED */}
      <div className="col-span-full flex justify-end items-center gap-2 text-xs font-medium text-slate-400">
        <Activity className="w-3 h-3" />
        Last updated: {new Date(data.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
