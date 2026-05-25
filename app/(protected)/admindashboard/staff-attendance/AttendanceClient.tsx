"use client";

import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWeekend, getMonth, getYear } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  User as UserIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Info,
  Search,
  SlidersHorizontal,
  Sparkles,
  CalendarDays,
  Activity,
  Users
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addHoliday, deleteHoliday, getStaffAttendance } from "./actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AttendanceRecord {
  id: string;
  userId: string;
  date: Date;
  status: string;
  checkIn: Date | null;
  checkOut: Date | null;
}

interface StaffMember {
  id: string;
  name: string | null;
  designation: string | null;
}

interface Holiday {
  id: string;
  name: string;
  date: Date;
  description: string | null;
}

interface AttendanceClientProps {
  initialHolidays: Holiday[];
}

const isDefaultHoliday = (date: Date): boolean => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  if (dayOfWeek === 0) {
    return true; // Sunday is always a holiday
  }
  if (dayOfWeek === 6) {
    // Saturday
    const dateNum = date.getDate();
    const occurrence = Math.ceil(dateNum / 7); // 1st, 2nd, 3rd, 4th, 5th Saturday
    // 2nd and 4th Saturday are open (not a holiday), others are holidays
    return !(occurrence === 2 || occurrence === 4);
  }
  return false;
};

const DESIGNATIONS = [
  { value: "ALL", label: "All Designations" },
  { value: "Executive_Assistant", label: "Executive Assistant" },
  { value: "Nirman_Sahayak", label: "Nirman Sahayak" },
  { value: "Secretary", label: "Secretary" },
  { value: "Sahayak", label: "Sahayak" },
  { value: "GPKarmee", label: "GP Karmee" },
  { value: "Casual", label: "Casual" }
];

export default function AttendanceClient({ initialHolidays }: AttendanceClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [isLoading, setIsLoading] = useState(true);
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: "", date: "", description: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [designationFilter, setDesignationFilter] = useState("ALL");

  const month = getMonth(currentDate);
  const year = getYear(currentDate);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  useEffect(() => {
    const fetchAttendance = async () => {
      setIsLoading(true);
      try {
        const { staffMembers, attendance } = await getStaffAttendance(month, year);
        setAttendanceRecords(attendance as any);
        setStaffMembers(staffMembers as any);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
        toast.error("Failed to load attendance records");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [month, year]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHoliday.name || !newHoliday.date) return;

    try {
      const added = await addHoliday(newHoliday.name, new Date(newHoliday.date), newHoliday.description);
      if (added) {
        setHolidays(prev => [...prev, { 
          id: added.id, 
          name: added.name, 
          date: new Date(added.date), 
          description: added.description 
        }]);
      }
      setNewHoliday({ name: "", date: "", description: "" });
      setIsHolidayDialogOpen(false);
      toast.success("Holiday added successfully");
    } catch (error) {
      toast.error("Failed to add holiday");
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    try {
      await deleteHoliday(id);
      setHolidays(prev => prev.filter(h => h.id !== id));
      toast.success("Holiday deleted successfully");
    } catch (error) {
      toast.error("Failed to delete holiday");
    }
  };

  // Filter staff members based on search and designation
  const filteredStaff = useMemo(() => {
    return staffMembers.filter(member => {
      const matchesSearch = (member.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.designation || "").toLowerCase().replace(/_/g, " ").includes(searchTerm.toLowerCase());
      const matchesDesignation = designationFilter === "ALL" || member.designation === designationFilter;
      return matchesSearch && matchesDesignation;
    });
  }, [staffMembers, searchTerm, designationFilter]);

  // Calculate statistics for the selected month
  const stats = useMemo(() => {
    const totalStaff = staffMembers.length;
    const currentMonthHolidays = holidays.filter(h => {
      const d = new Date(h.date);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;

    const currentMonthRecords = attendanceRecords;
    const presents = currentMonthRecords.filter(r => r.status === "PRESENT").length;
    const leaves = currentMonthRecords.filter(r => r.status === "LEAVE").length;
    
    const totalWorkingLogs = currentMonthRecords.length;
    const attendanceRate = totalWorkingLogs > 0 ? Math.round((presents / totalWorkingLogs) * 100) : 0;

    return {
      totalStaff,
      currentMonthHolidays,
      presents,
      leaves,
      attendanceRate
    };
  }, [staffMembers, holidays, attendanceRecords, month, year]);

  const getRecordInfo = (record: AttendanceRecord) => {
    if (record.status === "PRESENT") {
      const inTime = record.checkIn ? format(new Date(record.checkIn), "hh:mm a") : "--:--";
      const outTime = record.checkOut ? format(new Date(record.checkOut), "hh:mm a") : "--:--";
      return `Present (In: ${inTime} | Out: ${outTime})`;
    }
    return record.status.replace(/_/g, " ");
  };

  return (
    <div className="space-y-8 max-w-full">
      {/* Upper Banner Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-orange-900 to-orange-850 p-6 md:p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-orange-700/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="space-y-2">
          <Badge className="bg-orange-700 text-orange-100 hover:bg-orange-700 border-none font-semibold px-2.5 py-1">
            System Administration
          </Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Staff Attendance Control</h1>
          <p className="text-orange-200 text-sm md:text-base max-w-xl">
            Monitor monthly staff attendance logs, manage holiday calendars, and keep track of daily operations.
          </p>
        </div>

        {/* Month Selector Widget */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-inner">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrevMonth} 
            className="h-9 w-9 text-white hover:bg-white/20 hover:text-white rounded-lg active:scale-95 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="px-5 font-bold text-sm min-w-[150px] text-center tracking-wide">
            {format(currentDate, "MMMM yyyy")}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNextMonth} 
            className="h-9 w-9 text-white hover:bg-white/20 hover:text-white rounded-lg active:scale-95 transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Modern Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.0 }}>
          <Card className="border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 overflow-hidden group">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Staff</span>
                <h3 className="text-2xl font-bold text-slate-800">{stats.totalStaff} Members</h3>
              </div>
              <div className="p-3.5 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-250 transition-all duration-300 overflow-hidden group">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Present logs</span>
                <h3 className="text-2xl font-bold text-slate-800">{stats.presents} Logs</h3>
              </div>
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <Card className="border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-250 transition-all duration-300 overflow-hidden group">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Present Rate</span>
                <h3 className="text-2xl font-bold text-slate-800">{stats.attendanceRate}%</h3>
              </div>
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
          <Card className="border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-250 transition-all duration-300 overflow-hidden group">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Holidays ({format(currentDate, "MMM")})</span>
                <h3 className="text-2xl font-bold text-slate-800">{stats.currentMonthHolidays} Days</h3>
              </div>
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <CalendarDays className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Board Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Attendance Table (Left Column Span) */}
        <Card className="lg:col-span-3 border-slate-100 shadow-lg overflow-hidden flex flex-col">
          <CardHeader className="bg-slate-50/50 border-b p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">Monthly Attendance Overview</CardTitle>
                <CardDescription>Track daily attendance details of all Panchayat staff members.</CardDescription>
              </div>
              
              {/* Legend of Status badges */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Present
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <XCircle className="h-4 w-4 text-rose-500" /> Absent
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Badge variant="outline" className="w-5 h-5 bg-amber-50 text-amber-700 border-amber-100 p-0 flex items-center justify-center text-[10px] font-bold">L</Badge> Leave
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Badge variant="outline" className="w-5 h-5 bg-orange-50 text-orange-700 border-orange-100 p-0 flex items-center justify-center text-[8px] font-bold">HD</Badge> Half Day
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Badge variant="outline" className="w-5 h-5 bg-orange-100 text-orange-700 border-orange-200 p-0 flex items-center justify-center text-[10px] font-bold animate-pulse">H</Badge> Holiday
                </div>
              </div>
            </div>

            {/* Interactive Filters and Search */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="relative w-full sm:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search staff by name or designation..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white border-slate-200 focus-visible:ring-orange-500"
                />
              </div>
              <div className="w-full sm:w-64 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
                <Select value={designationFilter} onValueChange={setDesignationFilter}>
                  <SelectTrigger className="bg-white border-slate-200 focus:ring-orange-500">
                    <SelectValue placeholder="Filter by designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGNATIONS.map(d => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1">
            <div className="overflow-x-auto max-w-full">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    {/* Sticky Name column header */}
                    <TableHead className="w-[200px] min-w-[200px] border-r border-slate-100 font-bold text-slate-800 sticky left-0 bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      Staff Member
                    </TableHead>
                    {daysInMonth.map(day => {
                      const isTodayDate = isSameDay(day, new Date());
                      const weekend = isDefaultHoliday(day);
                      return (
                        <TableHead key={day.toISOString()} className={cn(
                          "text-center p-2 min-w-[50px] text-[11px] font-bold border-r border-slate-100",
                          weekend ? "bg-slate-100/30 text-slate-400" : "text-slate-700",
                          isTodayDate ? "bg-orange-500/10 text-orange-700 font-extrabold" : ""
                        )}>
                          <div className={cn(
                            "mx-auto w-6.5 h-6.5 flex items-center justify-center rounded-full text-xs font-semibold",
                            isTodayDate ? "bg-orange-600 text-white shadow-sm shadow-orange-200" : ""
                          )}>
                            {format(day, "d")}
                          </div>
                          <div className="text-[9px] uppercase font-normal tracking-wide mt-1">{format(day, "eee")}</div>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={daysInMonth.length + 1} className="h-64 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Clock className="h-8 w-8 animate-spin text-orange-600" />
                          <span className="font-semibold text-sm">Loading attendance records...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredStaff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={daysInMonth.length + 1} className="h-64 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2 p-6">
                          <UserIcon className="h-10 w-10 text-slate-350 opacity-50" />
                          <span className="font-semibold text-sm">No staff members match the filters</span>
                          <p className="text-xs text-slate-400">Try adjusting your search criteria or filter options.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStaff.map(user => (
                      <TableRow key={user.id} className="hover:bg-slate-55/40 transition-colors group">
                        {/* Sticky Name column body */}
                        <TableCell className="font-medium border-r border-slate-150 py-3.5 sticky left-0 bg-white group-hover:bg-slate-50/90 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm shrink-0">
                              {user.name ? user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : <UserIcon className="h-4 w-4" />}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-bold text-slate-800 truncate" title={user.name || "Unknown"}>
                                {user.name || "Unknown"}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate mt-0.5" title={user.designation?.replace(/_/g, " ")}>
                                {user.designation?.replace(/_/g, " ")}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Attendance days calendar body cells */}
                        {daysInMonth.map(day => {
                          const record = attendanceRecords.find(r => r.userId === user.id && isSameDay(new Date(r.date), day));
                          const holiday = holidays.find(h => isSameDay(new Date(h.date), day));
                          const weekend = isDefaultHoliday(day);

                          return (
                            <TableCell key={day.toISOString()} className={cn(
                              "p-1 text-center border-r border-slate-100 last:border-r-0",
                              weekend ? "bg-slate-50/20" : ""
                            )}>
                              {holiday ? (
                                <div className="flex justify-center" title={`Holiday: ${holiday.name} ${holiday.description ? `(${holiday.description})` : ''}`}>
                                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-850 font-extrabold text-[11px] flex items-center justify-center shadow-sm cursor-help animate-pulse">
                                  <motion.div 
                                    whileHover={{ scale: 1.15 }}
                                    
                                  >
                                    H
                                  </motion.div>
                                  </div>
                                </div>
                              ) : record ? (
                                <div className="flex justify-center" title={getRecordInfo(record)}>
                                  {record.status === "PRESENT" ? (
                                    <motion.div whileHover={{ scale: 1.15 }}>
                                      <CheckCircle2 className="h-5.5 w-5.5 text-emerald-500 stroke-[2.2] cursor-help filter drop-shadow-sm" />
                                    </motion.div>
                                  ) : record.status === "ABSENT" ? (
                                    <motion.div whileHover={{ scale: 1.15 }}>
                                      <XCircle className="h-5.5 w-5.5 text-rose-500 stroke-[2.2] cursor-help filter drop-shadow-sm" />
                                    </motion.div>
                                  ) : record.status === "LEAVE" ? (
                                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold text-xs shadow-sm cursor-help">
                                    <motion.div 
                                      whileHover={{ scale: 1.15 }}
                                      
                                    >
                                      L
                                    </motion.div>
                                    </div>
                                  ) : (
                                    <div className="w-7 h-7 rounded-lg bg-orange-55 text-orange-700 border border-orange-200 flex items-center justify-center font-bold text-[10px] shadow-sm cursor-help">
                                    <motion.div 
                                      whileHover={{ scale: 1.15 }}
                                      
                                    >
                                      HD
                                    </motion.div>
                                    </div>
                                  )}
                                </div>
                              ) : weekend ? (
                                <div className="flex justify-center" title={day.getDay() === 0 ? "Weekly Off (Sunday)" : "Weekly Off (Saturday)"}>
                                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-850 font-extrabold text-[11px] flex items-center justify-center shadow-sm cursor-help">
                                    <motion.div whileHover={{ scale: 1.15 }}>
                                      H
                                    </motion.div>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-7 w-7 flex items-center justify-center mx-auto text-slate-200">-</div>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Holiday Management Panel (Right Column Span) */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-slate-100 shadow-lg overflow-hidden flex flex-col h-full">
            <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between py-4 px-5">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <CalendarIcon className="h-5 w-5 text-orange-600 shrink-0" />
                Holidays List
              </CardTitle>
              
              {/* Add Holiday trigger Dialog */}
              <Dialog open={isHolidayDialogOpen} onOpenChange={setIsHolidayDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="outline" className="h-8 w-8 hover:bg-orange-55 hover:text-orange-600 transition-colors">
                    <Plus className="h-4.5 w-4.5 stroke-[2.2]" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-orange-600" />
                      Add New Holiday
                    </DialogTitle>
                    <DialogDescription>
                      Configure a public or state holiday. This will immediately display on the monthly calendars.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddHoliday} className="space-y-4 py-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Holiday Name</Label>
                      <Input 
                        id="name" 
                        value={newHoliday.name} 
                        onChange={e => setNewHoliday({...newHoliday, name: e.target.value})} 
                        placeholder="e.g. Durga Puja, Good Friday"
                        className="border-slate-200 focus-visible:ring-orange-500"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="date" className="text-sm font-semibold text-slate-700">Date</Label>
                      <Input 
                        id="date" 
                        type="date" 
                        value={newHoliday.date} 
                        onChange={e => setNewHoliday({...newHoliday, date: e.target.value})} 
                        className="border-slate-200 focus-visible:ring-orange-500"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Description (Optional)</Label>
                      <Textarea 
                        id="description" 
                        value={newHoliday.description} 
                        onChange={e => setNewHoliday({...newHoliday, description: e.target.value})} 
                        placeholder="Brief description of the holiday"
                        className="border-slate-200 focus-visible:ring-orange-500 min-h-[90px] resize-none"
                      />
                    </div>
                    <DialogFooter className="pt-2">
                      <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                        Save Holiday Details
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            
            <CardContent className="p-0 flex-1 overflow-y-auto max-h-[550px]">
              <AnimatePresence initial={false}>
                {holidays.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center h-48 gap-2">

                 
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    
                  >
                    <Info className="h-8 w-8 text-slate-300 opacity-60" />
                    <p className="text-sm font-semibold">No holidays listed</p>
                  </motion.div>
                   </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {holidays
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map(holiday => {
                        const hDate = new Date(holiday.date);
                        return (
                          <div  className="p-4 hover:bg-slate-50/50 transition-colors group relative"> 
                          <motion.div 
                            key={holiday.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                           
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex items-center gap-3">
                                {/* Calendar graphic badge */}
                                <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 overflow-hidden flex flex-col items-center justify-center shrink-0">
                                  <div className="bg-orange-600 text-[8px] uppercase font-bold text-white py-0.5 w-full text-center tracking-wider">
                                    {format(hDate, "MMM")}
                                  </div>
                                  <div className="text-sm font-extrabold text-orange-850 py-0.5">
                                    {format(hDate, "d")}
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-xs.5 text-slate-800 truncate" title={holiday.name}>
                                    {holiday.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    {format(hDate, "EEEE, yyyy")}
                                  </p>
                                  {holiday.description && (
                                    <p className="text-[10px] text-slate-500 italic mt-0.5 truncate max-w-[140px]" title={holiday.description}>
                                      {holiday.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteHoliday(holiday.id)}
                                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </Button>
                            </div>
                          </motion.div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
