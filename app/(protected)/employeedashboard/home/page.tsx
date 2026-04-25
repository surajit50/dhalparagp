import React from "react";
import { 
  FileText, 
  MapPin, 
  Wrench, 
  CalendarCheck, 
  Clock, 
  Fingerprint,
  AlertTriangle,
  Layers,
  ChevronRight,
  CheckCircle2,
  CalendarDays,
  ExternalLink,
  History,
  ClipboardList
} from "lucide-react";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AttendanceButton } from "./AttendanceButton";
import StaffWarishActionCell from "@/components/StaffWarishActionCell";

export default async function GPEmployeeDashboard() {
  // 1. Authenticate & Fetch User Details
  const user = await currentUser();

  if (!user) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-5 bg-slate-50">
        <div className="rounded-full bg-slate-200/50 p-6 ring-8 ring-slate-100">
          <Layers className="h-10 w-10 text-slate-500" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
          <p className="mt-2 text-sm text-slate-500">Please log in to view your secure dashboard.</p>
        </div>
      </div>
    );
  }

  try {
    // 2. Fetch User Profile from DB
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        designation: true,
        userStatus: true,
      }
    });

    // 3. Fetch Today's Attendance
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todaysAttendance = await db.attendance.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    });

    // 4. Fetch Aggregate Statistics (FIXED: Querying nocApplication directly)
    const [
      pendingWarishCount,
      pendingNocCount,
      issuedTubewellCount,
      approvedLeavesCount
    ] = await Promise.all([
      db.warishApplication.count({ where: { warishApplicationStatus: "submitted" } }),
      db.nocApplication.count({ where: { status: "SUBMITTED" } }), // Fixed here
      db.tubewellWorkOrder.count({ where: { status: "ISSUED" } }),
      db.leave.count({ where: { userId: user.id, status: "approved" } }),
    ]);

    // 5. Build Unified Task Queue (FIXED: Querying nocApplication directly)
    const [recentWarish, recentNoc, recentTubewell] = await Promise.all([
      db.warishApplication.findMany({
        where: { warishApplicationStatus: "process" },
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: { id: true, applicantName: true, createdAt: true }
      }),
      db.nocApplication.findMany({ // Fixed here
        where: { status: "SUBMITTED" }, 
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: { id: true, eventName: true, createdAt: true }
      }),
      db.tubewellWorkOrder.findMany({
        where: { status: "ISSUED" },
        orderBy: { issueDate: 'desc' },
        take: 2,
        select: { id: true, orderNumber: true, issueDate: true }
      })
    ]);

    // Normalize tasks into a single array for the UI (FIXED: n.eventName mapping)
    const taskQueue = [
      ...recentWarish.map(w => ({
        id: w.id.slice(-6).toUpperCase(), 
        applicationId: w.id,
        title: `Verify Warish: ${w.applicantName}`,
        model: "Warish",
        priority: "NORMAL",
        date: w.createdAt,
        icon: FileText,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-100"
      })),
      ...recentNoc.map(n => ({
        id: n.id.slice(-6).toUpperCase(),
        applicationId: n.id,
        title: `NOC Inspection: ${n.eventName || 'Event'}`, // Fixed here
        model: "NOC",
        priority: "HIGH",
        date: n.createdAt,
        icon: MapPin,
        iconColor: "text-purple-600",
        iconBg: "bg-purple-100"
      })),
      ...recentTubewell.map(t => ({
        id: t.orderNumber,
        applicationId: t.id,
        title: "Oversee Tubewell Repair",
        model: "Tubewell",
        priority: "HIGH",
        date: t.issueDate,
        icon: Wrench,
        iconColor: "text-amber-600",
        iconBg: "bg-amber-100"
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()); 

    // 6. Fetch Upcoming Meetings
    const upcomingMeetings = await db.meeting.findMany({
      where: { meetingDate: { gte: todayStart } },
      orderBy: { meetingDate: 'asc' },
      take: 4,
      select: { title: true, meetingDate: true, meetingType: true, startTime: true }
    });

    // Formatting Helpers
    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const getMonth = (date: Date) => date.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
    const getDay = (date: Date) => date.toLocaleDateString('en-IN', { day: '2-digit' });

    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 17) return "Good Afternoon";
      return "Good Evening";
    };

    const isCheckedIn = !!(todaysAttendance?.checkIn && !todaysAttendance?.checkOut);
    const hasCheckedOut = !!(todaysAttendance?.checkIn && todaysAttendance?.checkOut);

    return (
      <main className="flex flex-1 flex-col bg-slate-50/50 p-4 sm:p-8 min-h-screen">
        <div className="mx-auto w-full max-w-7xl space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col gap-6 rounded-3xl bg-white p-8 shadow-sm border border-slate-200 sm:flex-row sm:items-center sm:justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-110 duration-500"></div>
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-white shadow-xl">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-violet-700 text-2xl font-bold text-white">
                    {dbUser?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-6 w-6 rounded-full border-4 border-white"></div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none uppercase tracking-widest text-[10px] font-bold px-2.5 py-0.5">
                    {dbUser?.designation?.replace('_', ' ') || "Staff"}
                  </Badge>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-tight">{getGreeting()}</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
                  {dbUser?.name || "User Dashboard"}
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">Welcome back to your workspace</p>
              </div>
            </div>

            {/* Attendance Actions */}
            <div className="flex items-center gap-5 bg-slate-50/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 relative z-10">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Today's Shift</span>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${todaysAttendance?.checkIn && !hasCheckedOut ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                  <span className="text-sm font-bold text-slate-700">
                    {todaysAttendance?.checkIn ? (
                      hasCheckedOut ? (
                        <span className="text-rose-600">Ended at {formatTime(todaysAttendance.checkOut!)}</span>
                      ) : (
                        <span className="text-emerald-600">Active since {formatTime(todaysAttendance.checkIn)}</span>
                      )
                    ) : (
                      <span className="text-slate-400">Not started yet</span>
                    )}
                  </span>
                </div>
              </div>
              <div className="h-10 w-px bg-slate-200 mx-1"></div>
              <AttendanceButton isCheckedIn={isCheckedIn} hasCheckedOut={hasCheckedOut} />
            </div>
          </div>

          {/* Dynamic Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Pending Warish", value: pendingWarishCount, sub: "Requires verification", Icon: FileText, color: "blue" },
              { title: "NOC Applications", value: pendingNocCount, sub: "Site visits pending", Icon: MapPin, color: "purple" },
              { title: "Tubewell Orders", value: issuedTubewellCount, sub: "Active work orders", Icon: Wrench, color: "amber" },
              { title: "Approved Leaves", value: approvedLeavesCount, sub: "Historical total", Icon: CalendarCheck, color: "emerald" },
            ].map((stat, i) => {
              const colorMap: Record<string, { border: string, bg: string, text: string, shadow: string }> = {
                blue: { border: "border-blue-500", bg: "bg-blue-50", text: "text-blue-600", shadow: "shadow-blue-100" },
                purple: { border: "border-purple-500", bg: "bg-purple-50", text: "text-purple-600", shadow: "shadow-purple-100" },
                amber: { border: "border-amber-500", bg: "bg-amber-50", text: "text-amber-600", shadow: "shadow-amber-100" },
                emerald: { border: "border-emerald-500", bg: "bg-emerald-50", text: "text-emerald-600", shadow: "shadow-emerald-100" },
              };
              const colors = colorMap[stat.color];
              
              return (
                <Card key={i} className={`group border-none shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white overflow-hidden`}>
                  <CardContent className="p-0">
                    <div className={`h-1 w-full bg-slate-100 group-hover:bg-gradient-to-r ${stat.color === 'blue' ? 'from-blue-400 to-blue-600' : stat.color === 'purple' ? 'from-purple-400 to-purple-600' : stat.color === 'amber' ? 'from-amber-400 to-amber-600' : 'from-emerald-400 to-emerald-600'}`}></div>
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                          <div className="flex items-baseline gap-1">
                            <p className="text-4xl font-black tracking-tight text-slate-900">{stat.value}</p>
                          </div>
                          <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                            <span className={`h-1.5 w-1.5 rounded-full ${colors.text.replace('text', 'bg')} inline-block`}></span>
                            {stat.sub}
                          </p>
                        </div>
                        <div className={`rounded-2xl p-4 ${colors.bg} ${colors.text} transition-transform duration-500 group-hover:rotate-12`}>
                          <stat.Icon className="h-7 w-7" strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* Universal Task Queue */}
            <Card className="lg:col-span-2 shadow-sm border-slate-200 flex flex-col overflow-hidden bg-white">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/30 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 p-2 rounded-lg">
                    <ClipboardList className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Action Queue</CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5 font-bold uppercase tracking-widest">Immediate Attention Required</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold px-3 py-1">
                  {taskQueue.length} Active
                </Badge>
              </CardHeader>
              
              <CardContent className="p-0 flex-1">
                {taskQueue.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                     <div className="bg-slate-50 p-6 rounded-full mb-4 ring-8 ring-slate-50/50">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                     </div>
                     <h3 className="text-lg font-bold text-slate-800">Mission Accomplished!</h3>
                     <p className="text-sm text-slate-400 mt-1 max-w-[240px]">Your queue is empty. Take a moment to recharge or review your reports.</p>
                   </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {taskQueue.map((task, idx) => (
                      <div key={idx} className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50/80 transition-all cursor-pointer relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-indigo-600 transition-colors"></div>
                        <div className="flex items-start gap-5">
                          <div className={`mt-1 p-3 rounded-2xl ${task.iconBg} ${task.iconColor} transition-transform group-hover:scale-110 duration-300`}>
                            <task.icon className="h-6 w-6" strokeWidth={2.5} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase tracking-tighter bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded leading-none">
                                {task.model}
                              </span>
                              <span className="text-[10px] font-bold text-slate-300">#{task.id}</span>
                            </div>
                            <p className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{task.title}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                                <Clock className="h-3.5 w-3.5" /> 
                                {task.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                              {task.priority === 'HIGH' && (
                                <span className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                  <AlertTriangle className="h-3 w-3" /> Urgent
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4 sm:mt-0">
                          {task.model === "Warish" ? (
                            <div>
                              <StaffWarishActionCell applicationId={task.applicationId!} />
                            </div>
                          ) : (
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border border-slate-200 text-indigo-600 font-bold text-xs h-8 px-4 rounded-lg">
                              Handle Task
                            </Button>
                          )}
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
                <Button variant="link" className="text-xs font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest">
                  View All Activity Logs
                </Button>
              </div>
            </Card>

            {/* Sidebar Area */}
            <div className="space-y-8">
              
              {/* Scheduled Meetings */}
              <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-100 bg-slate-50/30 pb-4">
                  <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2 tracking-tight">
                    <CalendarDays className="h-5 w-5 text-indigo-600" /> 
                    Meetings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {upcomingMeetings.length === 0 ? (
                    <div className="py-12 text-center border-t border-dashed border-slate-100 bg-slate-50/20">
                      <div className="bg-white h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <CalendarCheck className="h-6 w-6 text-slate-300" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Meetings</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {upcomingMeetings.map((meeting, idx) => (
                        <div key={idx} className="p-5 flex items-start gap-5 hover:bg-slate-50 transition-all group cursor-pointer">
                          
                          {/* Calendar Tear-off Graphic */}
                          <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 min-w-[60px] shadow-sm overflow-hidden transition-transform group-hover:-rotate-3 duration-300">
                            <div className="bg-indigo-600 w-full text-center py-1">
                              <span className="text-[9px] font-black text-white tracking-widest uppercase">{getMonth(meeting.meetingDate)}</span>
                            </div>
                            <div className="py-2">
                              <span className="text-xl font-black text-indigo-950 leading-none">{getDay(meeting.meetingDate)}</span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors leading-tight">{meeting.title}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold text-[9px] uppercase tracking-tighter border-none px-1.5 py-0">
                                {meeting.meetingType.replace(/_/g, ' ')}
                              </Badge>
                              <span className="text-slate-300 text-[10px]">•</span>
                              <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {meeting.startTime}
                              </p>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                {upcomingMeetings.length > 0 && (
                  <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-center">
                    <Button variant="link" className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest h-auto p-0">
                      Full Calendar
                    </Button>
                  </div>
                )}
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-100 bg-slate-50/30 pb-4">
                  <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2 tracking-tight">
                    <Layers className="h-5 w-5 text-emerald-600" /> 
                    Shortcuts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: "My Attendance", href: "/employeedashboard/attendance", icon: History, color: "text-blue-600", bg: "bg-blue-50" },
                      { label: "Leave Requests", href: "/employeedashboard/leave-request", icon: CalendarCheck, color: "text-purple-600", bg: "bg-purple-50" },
                      { label: "View Reports", href: "/employeedashboard/reports", icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
                    ].map((link, idx) => (
                      <Link key={idx} href={link.href}>
                        <div className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100 shadow-sm hover:shadow-md">
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl ${link.bg} ${link.color} transition-transform group-hover:scale-110`}>
                              <link.icon className="h-5 w-5" strokeWidth={2.5} />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors tracking-tight">{link.label}</span>
                          </div>
                          <div className="h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                            <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Database error:", error);
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-8 bg-slate-50/50 p-6">
        <div className="relative">
          <div className="absolute inset-0 bg-rose-200/20 blur-3xl rounded-full"></div>
          <div className="relative rounded-3xl bg-white p-8 shadow-2xl border border-rose-100 flex flex-col items-center">
            <div className="rounded-2xl bg-rose-50 p-4 mb-6 ring-8 ring-rose-50/50">
              <AlertTriangle className="h-10 w-10 text-rose-500" strokeWidth={2.5} />
            </div>
            <div className="text-center max-w-xs">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Offline</h2>
              <p className="mt-3 text-sm text-slate-500 font-medium leading-relaxed">
                We are having trouble connecting to the database. This might be temporary.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 w-full">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 rounded-xl">
                Try Reconnecting
              </Button>
              <Button variant="ghost" className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest h-10">
                Contact IT Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
