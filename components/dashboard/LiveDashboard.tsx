"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  FileText,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  Receipt,
  ClipboardList,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Activity,
  Calendar,
  Layers,
  LayoutGrid,
  Filter,
  UserCheck,
  UserX,
  Maximize2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

const YEARS = ["all", "2026", "2025", "2024", "2023"];

export default function LiveDashboard() {
  const [selectedYear, setSelectedYear] = useState("all");

  const { data, isLoading } = useSWR(
    `/api/dashboard?year=${selectedYear}`,
    fetcher,
    {
      refreshInterval: 5000,
    },
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          Syncing live data...
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

  const kpis = [
    {
      label: "Total Applications",
      value: data.totalWarish,
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
      border: "border-blue-100",
    },
    {
      label: "Active Works",
      value: data.totalWorks,
      icon: Briefcase,
      color: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-100",
    },
    {
      label: "NITs Created",
      value: data.totalNITs,
      icon: Layers,
      color: "bg-amber-50 text-amber-600",
      border: "border-amber-100",
    },
    {
      label: "Total Bookings",
      value: data.totalBookings,
      icon: Calendar,
      color: "bg-purple-50 text-purple-600",
      border: "border-purple-100",
    },
  ];

  const dashboardSections = [
    {
      title: "Warish Applications",
      cards: [
        {
          title: "Total",
          value: data.totalWarish,
          icon: FileText,
          link: "/admindashboard/manage-warish",
        },
        {
          title: "Approved",
          value: data.approvedWarish,
          icon: CheckCircle2,
          link: "/admindashboard/manage-warish",
        },
        {
          title: "Pending",
          value: data.pendingWarish,
          icon: Clock,
          link: "/admindashboard/manage-warish",
        },
        {
          title: "Rejected",
          value: data.rejectedWarish,
          icon: XCircle,
          link: "/admindashboard/manage-warish",
        },
        {
          title: "Verified Docs",
          value: data.totalverify,
          icon: FileCheck,
          link: "/admindashboard/manage-warish",
        },
        {
          title: "Unverified",
          value: data.verifypending,
          icon: AlertCircle,
          link: "/admindashboard/manage-warish",
        },
      ],
    },
    {
      title: "Works",
      cards: [
        {
          title: "Total Works",
          value: data.totalWorks,
          icon: Briefcase,
          link: "/admindashboard/manage-tender",
        },
        {
          title: "In Progress",
          value: data.inProgressWorks,
          icon: TrendingUp,
          link: "/admindashboard/manage-tender",
        },
        {
          title: "Completed",
          value: data.completedWorks,
          icon: CheckCircle2,
          link: "/admindashboard/manage-tender",
        },
        {
          title: "Work Orders",
          value: data.workOrders,
          icon: ClipboardList,
          link: "/admindashboard/generate/work-order",
        },
      ],
    },
    {
      title: "Finance & Agencies",
      cards: [
        {
          title: "Agencies",
          value: data.totalAgencies,
          icon: Users,
          link: "/admindashboard/manage-tender",
        },
        {
          title: "Bids",
          value: data.totalBids,
          icon: Briefcase,
          link: "/admindashboard/manage-tender",
        },
        {
          title: "Payments",
          value: data.totalPayments,
          icon: Receipt,
          link: "/admindashboard/fundstatus",
        },
      ],
    },
  ];

  return (
    <div className="space-y-10 p-6 md:p-8">
      {/* FILTER & ACTIONS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg">
            <Filter className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Time Period
            </p>
            <h3 className="text-sm font-bold text-slate-700">
              Filter Year Wise
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
            {YEARS.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedYear === year
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }`}
              >
                {year === "all" ? "All Time" : year}
              </button>
            ))}
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-100">
                <Users className="w-4 h-4" />
                Staff Attendance
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl w-[95vw] h-[90vh] overflow-y-auto bg-slate-50 p-0 border-none shadow-2xl">
              <div className="p-6 md:p-10 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Today&apos;s Staff Attendance</h2>
                    <p className="text-slate-500 font-medium mt-1 text-lg">Live status of all GP employees</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-emerald-100 shadow-sm">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <UserCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Present</p>
                        <p className="text-xl font-black text-emerald-700">
                          {data.staffAttendance?.filter((s: any) => s.attendance?.checkIn).length}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-rose-100 shadow-sm">
                      <div className="p-2 bg-rose-50 rounded-lg">
                        <UserX className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Absent</p>
                        <p className="text-xl font-black text-rose-700">
                          {data.staffAttendance?.filter((s: any) => !s.attendance?.checkIn).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employee</th>
                          <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Designation</th>
                          <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Check In</th>
                          <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Check Out</th>
                          <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.staffAttendance?.map((staff: any) => (
                          <tr key={staff.id} className="hover:bg-slate-50/80 transition-all group">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-100">
                                  {staff.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-800 text-base block">{staff.name}</span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Employee ID: {staff.id.slice(-6)}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                                {staff.designation?.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              {staff.attendance?.checkIn ? (
                                <div className="flex items-center gap-2.5 bg-emerald-50 w-fit px-3 py-1.5 rounded-full border border-emerald-100">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Present</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2.5 bg-rose-50 w-fit px-3 py-1.5 rounded-full border border-rose-100">
                                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                  <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Absent</span>
                                </div>
                              )}
                            </td>
                            <td className="px-8 py-5">
                              {staff.attendance?.checkIn ? (
                                <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm bg-slate-50 px-3 py-1.5 rounded-xl w-fit">
                                  <Clock className="w-4 h-4 text-blue-500" />
                                  {new Date(staff.attendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </div>
                              ) : (
                                <span className="text-slate-300 font-bold tracking-widest">--:--</span>
                              )}
                            </td>
                            <td className="px-8 py-5">
                              {staff.attendance?.checkOut ? (
                                <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm bg-slate-50 px-3 py-1.5 rounded-xl w-fit">
                                  <Clock className="w-4 h-4 text-orange-500" />
                                  {new Date(staff.attendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </div>
                              ) : (
                                <span className="text-slate-300 font-bold tracking-widest">--:--</span>
                              )}
                            </td>
                            <td className="px-8 py-5 text-right">
                              <Link href={`/admindashboard/gram-sabha/attendance`}>
                                <button className="p-3 bg-white hover:bg-blue-600 rounded-2xl border border-slate-200 hover:border-blue-600 shadow-sm hover:shadow-blue-200 transition-all text-slate-400 hover:text-white group/btn">
                                  <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={`bg-white p-6 rounded-2xl border ${item.border} shadow-sm hover:shadow-md transition-all duration-300 group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-2.5 rounded-xl ${item.color} transition-colors duration-300`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-slate-200 group-hover:bg-blue-500 transition-colors"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                  {item.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-slate-900 tracking-tight">
                    {item.value}
                  </p>
                  <span className="text-xs font-medium text-slate-400">
                    Total
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Application Status
              </h3>
              <p className="text-sm text-slate-500">
                Live distribution of warish applications
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                Live
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={applicationData}
                innerRadius={60}
                outerRadius={100}
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

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Work Progress
              </h3>
              <p className="text-sm text-slate-500">
                Current status of infrastructure projects
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                Live
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
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
      </div>

      {/* SECTIONS */}
      <div className="space-y-12">
        {dashboardSections.map((section, idx) => (
          <div key={idx}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900">
                {section.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {section.cards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <Link key={i} href={card.link} className="group">
                    <div className="h-full bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-md group-hover:border-blue-100 transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                          <Icon className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-slate-900 mb-1">
                          {card.value}
                        </p>
                        <p className="text-sm font-medium text-slate-500">
                          {card.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* LAST UPDATED */}
      <div className="flex items-center justify-between pt-8 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-slate-600">
            System Monitoring Active
          </span>
        </div>
        <p className="text-xs font-medium text-slate-400">
          Last updated: {new Date(data.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
