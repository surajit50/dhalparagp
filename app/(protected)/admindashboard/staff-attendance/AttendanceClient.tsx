"use client";

import { useState, useEffect } from "react";
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
  Info
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

export default function AttendanceClient({ initialHolidays }: AttendanceClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [isLoading, setIsLoading] = useState(true);
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: "", date: "", description: "" });

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
      await addHoliday(newHoliday.name, new Date(newHoliday.date), newHoliday.description);
      setHolidays(prev => [...prev, { 
        id: Math.random().toString(), 
        name: newHoliday.name, 
        date: new Date(newHoliday.date), 
        description: newHoliday.description 
      }]);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT": return <Badge className="bg-green-100 text-green-800 border-green-200">Present</Badge>;
      case "ABSENT": return <Badge className="bg-red-100 text-red-800 border-red-200">Absent</Badge>;
      case "LEAVE": return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Leave</Badge>;
      case "HALF_DAY": return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Half Day</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Staff Attendance Control</h1>
          <p className="text-slate-500 mt-1">Manage staff attendance and holiday schedule</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="px-4 font-semibold text-sm min-w-[140px] text-center">
            {format(currentDate, "MMMM yyyy")}
          </div>
          <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Attendance Table */}
        <Card className="lg:col-span-3 border-none shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Monthly Attendance Overview</CardTitle>
                <CardDescription>Visualizing attendance for {format(currentDate, "MMMM yyyy")}</CardDescription>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                  <CheckCircle2 className="h-3 w-3 text-green-500" /> Present
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                  <XCircle className="h-3 w-3 text-red-500" /> Absent
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                  <div className="w-3 h-3 rounded-full bg-yellow-100 flex items-center justify-center text-[8px] font-bold text-yellow-700">L</div> Leave
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                  <div className="w-3 h-3 rounded-full bg-orange-100 flex items-center justify-center text-[8px] font-bold text-orange-700">H</div> Half Day
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                  <div className="w-3 h-3 rounded-full bg-orange-100 flex items-center justify-center text-[8px] font-bold text-orange-700">H</div> Holiday
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/30">
                  <TableRow>
                    <TableHead className="w-[200px] border-r font-bold">Staff Member</TableHead>
                    {daysInMonth.map(day => (
                      <TableHead key={day.toISOString()} className={cn(
                        "text-center p-2 min-w-[40px] text-[10px] font-bold",
                        isWeekend(day) ? "bg-slate-100/50 text-slate-400" : ""
                      )}>
                        <div>{format(day, "dd")}</div>
                        <div className="font-normal text-[9px] uppercase">{format(day, "eee")}</div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={daysInMonth.length + 1} className="h-32 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <Clock className="h-5 w-5 animate-spin" />
                          <span>Loading attendance records...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : staffMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={daysInMonth.length + 1} className="h-32 text-center text-slate-500">
                        No staff members found
                      </TableCell>
                    </TableRow>
                  ) : (
                    staffMembers.map(user => (
                      <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-medium border-r py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700">
                              <UserIcon className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold truncate max-w-[120px]">{user.name || "Unknown"}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-500 truncate">{user.designation?.replace(/_/g, " ")}</span>
                                {attendanceRecords.find(r => r.userId === user.id && isSameDay(new Date(r.date), new Date())) && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title="Present Today"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        {daysInMonth.map(day => {
                          const record = attendanceRecords.find(r => r.userId === user.id && isSameDay(new Date(r.date), day));
                          const isHoliday = holidays.some(h => isSameDay(new Date(h.date), day));
                          const weekend = isWeekend(day);

                          return (
                            <TableCell key={day.toISOString()} className={cn(
                              "p-1 text-center border-r last:border-r-0",
                              weekend ? "bg-slate-50/30" : ""
                            )}>
                              {isHoliday ? (
                                <div className="flex justify-center" title="Public Holiday">
                                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-orange-700">H</span>
                                  </div>
                                </div>
                              ) : record ? (
                                <div className="flex justify-center" title={record.status}>
                                  {record.status === "PRESENT" ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  ) : record.status === "ABSENT" ? (
                                    <XCircle className="h-5 w-5 text-red-500" />
                                  ) : (
                                    <div className={cn(
                                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                                      record.status === "LEAVE" ? "bg-yellow-100 text-yellow-700" : "bg-orange-100 text-orange-700"
                                    )}>
                                      {record.status[0]}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="h-5 w-5" />
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

        {/* Holiday Management Section */}
        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-orange-600" />
                Holidays
              </CardTitle>
              <Dialog open={isHolidayDialogOpen} onOpenChange={setIsHolidayDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="outline" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Holiday</DialogTitle>
                    <DialogDescription>Add a public holiday to the attendance calendar.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddHoliday} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Holiday Name</Label>
                      <Input 
                        id="name" 
                        value={newHoliday.name} 
                        onChange={e => setNewHoliday({...newHoliday, name: e.target.value})} 
                        placeholder="e.g. Independence Day"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input 
                        id="date" 
                        type="date" 
                        value={newHoliday.date} 
                        onChange={e => setNewHoliday({...newHoliday, date: e.target.value})} 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea 
                        id="description" 
                        value={newHoliday.description} 
                        onChange={e => setNewHoliday({...newHoliday, description: e.target.value})} 
                        placeholder="Brief description of the holiday"
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full">Save Holiday</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                {holidays.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <Info className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No holidays listed</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {holidays
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map(holiday => (
                        <div key={holiday.id} className="p-4 hover:bg-slate-50/50 transition-colors group">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <p className="font-semibold text-sm">{holiday.name}</p>
                              <p className="text-xs text-orange-600 font-medium">{format(new Date(holiday.date), "PPP")}</p>
                              {holiday.description && (
                                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{holiday.description}</p>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteHoliday(holiday.id)}
                              className="h-8 w-8 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card className="border-none shadow-md bg-gradient-to-br from-orange-600 to-orange-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-orange-100 text-sm font-medium">Total Staff Tracked</p>
                  <h3 className="text-2xl font-bold">{staffMembers.length} Members</h3>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-orange-100 text-xs font-medium">Active This Month</p>
                  <p className="text-xl font-bold">{attendanceRecords.length}</p>
                </div>
                <div>
                  <p className="text-orange-100 text-xs font-medium">Holidays</p>
                  <p className="text-xl font-bold">{holidays.filter(h => getMonth(new Date(h.date)) === month).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
